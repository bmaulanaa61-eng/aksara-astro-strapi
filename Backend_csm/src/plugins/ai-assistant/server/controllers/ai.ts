import type { Context } from 'koa';
import { errors } from '@strapi/utils';
import { AiEngine, AiEngineError, chunkText, type Locale } from '../../../../utils/ai-engine';
import { hasTranslationContent, targetLocale } from '../../../../utils/ai-helpers';

const { ApplicationError, ValidationError } = errors;
const ARTICLE_UID = 'api::article.article' as const;
const MAX_INPUT_CHARS = 250_000;

type Input = {
  documentId?: string;
  locale?: Locale;
  overwrite?: boolean;
  title?: string;
  summary?: string;
  content?: string;
  coverId?: number;
};

type Article = Record<string, any> & { documentId: string; locale: Locale };

function input(ctx: Context): Required<Pick<Input, 'documentId' | 'locale'>> & Input {
  const body = (ctx.request.body ?? {}) as Input;
  if (!body.documentId) throw new ValidationError('documentId wajib diisi.');
  if (body.locale !== 'id' && body.locale !== 'en') throw new ValidationError('locale harus id atau en.');
  if ([body.title, body.summary, body.content].some((value) => typeof value === 'string' && value.length > MAX_INPUT_CHARS)) {
    throw new ValidationError('Input terlalu panjang.');
  }
  return body as Required<Pick<Input, 'documentId' | 'locale'>> & Input;
}

function engine(_ctx?: Context) {
  const ai = AiEngine.fromEnv(strapi.log);
  if (!ai) throw new ApplicationError('AI belum dikonfigurasi. Isi AI_BASE_URL, AI_API_KEY, dan AI_MODEL.');
  return ai;
}

function text(value: unknown, field: string, max?: number) {
  if (typeof value !== 'string' || !value.trim()) throw new AiEngineError(`Output ${field} tidak valid.`);
  const result = value.trim();
  if (max && result.length > max) throw new AiEngineError(`Output ${field} melebihi ${max} karakter.`);
  return result;
}

function sentenceCount(value: string) {
  return value.split(/(?<=[.!?])\s+/).filter(Boolean).length;
}

function fail(ctx: Context, error: unknown) {
  if (error instanceof AiEngineError) {
    ctx.status = error.status;
    ctx.body = { error: { message: error.message } };
    return;
  }
  throw error;
}

async function article(documentId: string, locale: Locale): Promise<Article> {
  const found = await strapi.documents(ARTICLE_UID).findOne({
    documentId, locale, status: 'draft', populate: { seo: true, tags: true, cover: true, author: true },
  });
  if (!found) throw new ValidationError('Article tidak ditemukan.');
  return found as Article;
}

function source(body: Input, stored: Article) {
  return {
    title: body.title?.trim() || stored.title,
    summary: body.summary?.trim() ?? stored.summary ?? '',
    content: body.content?.trim() || stored.content,
  };
}

export default {
  config(ctx: Context) {
    ctx.body = { configured: Boolean(AiEngine.fromEnv(strapi.log)) };
  },

  async summary(ctx: Context) {
    try {
      const body = input(ctx);
      const stored = await article(body.documentId, body.locale);
      const data = source(body, stored);
      const ai = engine(ctx);
      const chunks = chunkText(data.content, ai.maxChars);
      const parts: string[] = [];
      for (const chunk of chunks) {
        const result = await ai.generate({ feature: 'summary', locale: body.locale, prompt: `Summarize this article section factually in at most 2 sentences. Return {"summary":"..."}.\nTitle: ${data.title}\nContent: ${chunk}` });
        parts.push(text(result.summary, 'summary'));
      }
      const result = chunks.length > 1
        ? await ai.generate({ feature: 'summary', locale: body.locale, prompt: `Combine these notes into at most 2 sentences. Return {"summary":"..."}.\n${parts.join('\n')}` })
        : { summary: parts[0] };
      const summary = text(result.summary, 'summary', 500);
      if (sentenceCount(summary) > 2) throw new AiEngineError('Ringkasan harus maksimal 2 kalimat.');
      ctx.body = { summary };
    } catch (error) { fail(ctx, error); }
  },

  async seo(ctx: Context) {
    try {
      const body = input(ctx);
      const stored = await article(body.documentId, body.locale);
      const data = source(body, stored);
      const result = await engine(ctx).generate({ feature: 'seo', locale: body.locale, prompt: `Create concise SEO metadata. Return {"metaTitle":"max 60 chars","metaDescription":"max 160 chars"}.\nTitle: ${data.title}\nSummary: ${data.summary}\nContent: ${data.content.slice(0, 8000)}` });
      ctx.body = { metaTitle: text(result.metaTitle, 'metaTitle', 60), metaDescription: text(result.metaDescription, 'metaDescription', 160) };
    } catch (error) { fail(ctx, error); }
  },

  async tags(ctx: Context) {
    try {
      const body = input(ctx);
      const stored = await article(body.documentId, body.locale);
      const data = source(body, stored);
      const available = await strapi.documents('api::tag.tag').findMany({ locale: body.locale, limit: 100, fields: ['name', 'slug'] });
      const choices = available.map((tag) => ({ documentId: tag.documentId, name: tag.name, slug: tag.slug }));
      const result = await engine(ctx).generate({ feature: 'tags', locale: body.locale, prompt: `Select only relevant tag documentId values from this exact list. Return {"documentIds":["..."]}. Never invent tags.\nAvailable: ${JSON.stringify(choices)}\nTitle: ${data.title}\nContent: ${data.content.slice(0, 8000)}` });
      if (!Array.isArray(result.documentIds)) throw new AiEngineError('Output documentIds tidak valid.');
      const selected = new Set(result.documentIds.filter((id): id is string => typeof id === 'string'));
      const tags = choices.filter((tag) => selected.has(tag.documentId));
      ctx.body = { tags };
    } catch (error) { fail(ctx, error); }
  },

  async altText(ctx: Context) {
    try {
      const body = input(ctx);
      if (!body.coverId) throw new ValidationError('Article belum memiliki cover.');
      const file = await strapi.db.query('plugin::upload.file').findOne({ where: { id: body.coverId } }) as { id: number; mime: string; url: string; alternativeText?: string } | null;
      if (!file?.mime?.startsWith('image/')) throw new ValidationError('Cover gambar tidak ditemukan.');
      if (file.alternativeText?.trim() && !body.overwrite) {
        ctx.status = 409;
        ctx.body = { error: { message: 'Alt text cover sudah berisi.' } };
        return;
      }
      const url = file.url.startsWith('http') ? file.url : new URL(file.url, strapi.config.get('server.url', 'http://localhost:1337')).toString();
      const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new AiEngineError('Gambar cover tidak dapat dibaca.');
      const data = Buffer.from(await response.arrayBuffer()).toString('base64');
      const ai = engine(ctx);
      const result = await ai.generate({ feature: 'alt-text', locale: body.locale, model: ai.visionModel, image: { mime: file.mime, data }, prompt: `Describe this image accessibly and concisely in the article language. Do not infer facts not visible. Return {"alternativeText":"..."}. Article title: ${body.title ?? ''}` });
      const alternativeText = text(result.alternativeText, 'alternativeText', 500);
      await strapi.plugin('upload').service('upload').updateFileInfo(file.id, { alternativeText });
      ctx.body = { alternativeText };
    } catch (error) { fail(ctx, error); }
  },

  async translation(ctx: Context) {
    try {
      const body = input(ctx);
      const stored = await article(body.documentId, body.locale);
      const target = targetLocale(body.locale);
      const existing = await strapi.documents(ARTICLE_UID).findOne({ documentId: body.documentId, locale: target, status: 'draft', populate: { seo: true } });
      if (hasTranslationContent(existing) && !body.overwrite) {
        ctx.status = 409;
        ctx.body = { error: { message: `Draft locale ${target} sudah berisi.` } };
        return;
      }
      const data = source(body, stored);
      const ai = engine(ctx);
      const chunks = chunkText(data.content, ai.maxChars);
      const translated: string[] = [];
      for (const chunk of chunks) {
        const result = await ai.generate({ feature: 'translation', locale: target, prompt: `Translate faithfully from ${body.locale} to ${target}. Preserve HTML tags and formatting. Return {"content":"..."}.\n${chunk}` });
        translated.push(text(result.content, 'content'));
      }
      const metadata = await ai.generate({ feature: 'translation', locale: target, prompt: `Translate this article metadata from ${body.locale} to ${target}. Return {"title":"...","summary":"...","metaTitle":"max 60 chars","metaDescription":"max 160 chars"}.\n${JSON.stringify({ title: data.title, summary: data.summary, metaTitle: stored.seo?.metaTitle, metaDescription: stored.seo?.metaDescription })}` });
      const slug = `${stored.slug}-${target}`;
      const translatedData: Parameters<ReturnType<typeof strapi.documents<typeof ARTICLE_UID>>['update']>[0]['data'] = {
        title: text(metadata.title, 'title', 200), slug,
        summary: text(metadata.summary, 'summary', 500), content: translated.join('\n\n'),
        author: stored.author?.documentId ?? stored.author?.id,
        tags: (stored.tags ?? []).map((tag: any) => tag.documentId ?? tag.id),
        cover: stored.cover?.id,
        seo: {
          metaTitle: text(metadata.metaTitle, 'metaTitle', 60),
          metaDescription: text(metadata.metaDescription, 'metaDescription', 160),
          metaRobots: stored.seo?.metaRobots ?? 'index,follow',
        },
        aiSummaryStatus: 'generated', aiSeoStatus: 'generated', aiTagsStatus: 'generated',
        aiAltTextStatus: stored.aiAltTextStatus ?? 'pending', aiTranslationStatus: 'generated',
      };
      await strapi.documents(ARTICLE_UID).update({ documentId: body.documentId, locale: target, status: 'draft', data: translatedData });
      await strapi.documents(ARTICLE_UID).update({
        documentId: body.documentId,
        locale: body.locale,
        status: 'draft',
        data: { aiTranslationStatus: 'generated' },
      });
      ctx.body = { targetLocale: target };
    } catch (error) { fail(ctx, error); }
  },
};

