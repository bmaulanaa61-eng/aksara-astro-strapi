import { useEffect, useRef, useState } from 'react';
import { useFetchClient, useForm } from '@strapi/strapi/admin';
import type { PanelComponent } from '@strapi/content-manager/strapi-admin';
import styled from 'styled-components';

type Status = 'pending' | 'generated' | 'failed' | 'manual';
type Feature = 'summary' | 'seo' | 'tags' | 'alt-text' | 'translation';
type Tag = { id?: number; documentId?: string; name?: string };
type ArticleForm = {
  title?: string; summary?: string; content?: string; locale?: 'id' | 'en';
  seo?: { metaTitle?: string; metaDescription?: string }; tags?: Tag[];
  cover?: { id?: number; alternativeText?: string } | Array<{ id?: number; alternativeText?: string }>;
  aiSummaryStatus?: Status; aiSeoStatus?: Status; aiTagsStatus?: Status;
  aiAltTextStatus?: Status; aiTranslationStatus?: Status;
};
type Result = { summary?: string; metaTitle?: string; metaDescription?: string; tags?: Tag[]; alternativeText?: string; targetLocale?: string };

const featureStatus: Record<Feature, keyof ArticleForm> = {
  summary: 'aiSummaryStatus', seo: 'aiSeoStatus', tags: 'aiTagsStatus',
  'alt-text': 'aiAltTextStatus', translation: 'aiTranslationStatus',
};
const labels: Array<[Feature, string]> = [
  ['summary', 'Buat ringkasan'], ['seo', 'Rekomendasi SEO'], ['tags', 'Saran tag'],
  ['alt-text', 'Alt text cover'], ['translation', 'Buat draft terjemahan'],
];
const Panel = styled.div`display:grid;gap:12px;`;
const Row = styled.div`display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;`;
const Action = styled.button`border:1px solid #7b79ff;border-radius:4px;background:#4945ff;color:white;padding:7px 10px;cursor:pointer;&:disabled{cursor:not-allowed;opacity:.55;}`;
const Pill = styled.span`font-size:11px;color:#666;`;
const Message = styled.p`margin:0;font-size:12px;color:#a51b00;`;

function errorMessage(error: unknown) {
  const candidate = error as { response?: { data?: { error?: { message?: string }; message?: string } }; message?: string };
  return candidate.response?.data?.error?.message ?? candidate.response?.data?.message ?? candidate.message ?? 'Aksi AI gagal.';
}

// Strapi stores relations as { connect, disconnect }, not as a plain array.
function tagList(value: unknown): Tag[] {
  if (Array.isArray(value)) return value as Tag[];
  const relation = value as { connect?: unknown; data?: unknown; results?: unknown } | null | undefined;
  for (const candidate of [relation?.connect, relation?.data, relation?.results]) {
    if (Array.isArray(candidate)) return candidate as Tag[];
  }
  return [];
}

function tagRelation(tags: Tag[]) {
  return { connect: tags.map((tag) => (tag.documentId ? { documentId: tag.documentId } : tag.id)), disconnect: [] };
}

function AiAssistant({ documentId }: { documentId: string }) {
  const { get, post } = useFetchClient();
  const { values, onChange } = useForm('AiAssistant', (form) => ({ values: form.values as ArticleForm, onChange: form.onChange }));
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<Feature | null>(null);
  const [message, setMessage] = useState('');
  const [localStatuses, setLocalStatuses] = useState<Partial<Record<Feature, Status>>>({});
  const generated = useRef<Record<string, string>>({});
  const initialized = useRef(false);
  const cover = Array.isArray(values.cover) ? values.cover[0] : values.cover;
  const locale = values.locale ?? (new URLSearchParams(window.location.search).get('plugins[i18n][locale]') as 'id' | 'en') ?? 'id';
  const summaryValue = values.summary ?? '';
  const seoValue = `${values.seo?.metaTitle ?? ''}|${values.seo?.metaDescription ?? ''}`;
  const tagsValue = tagList(values.tags).map((tag) => tag.documentId ?? tag.id).sort().join('|');
  const altValue = cover?.alternativeText ?? '';

  useEffect(() => {
    void get('/ai-assistant/config').then(({ data }) => setConfigured(Boolean((data as { configured?: boolean }).configured))).catch(() => setConfigured(false));
  }, [get]);

  useEffect(() => {
    const tracked: Array<[Feature, string]> = [['summary', summaryValue], ['seo', seoValue], ['tags', tagsValue], ['alt-text', altValue]];
    if (!initialized.current) {
      for (const [feature, current] of tracked) generated.current[feature] = current;
      initialized.current = true;
      return;
    }
    for (const [feature, current] of tracked) {
      if (values[featureStatus[feature]] === 'generated' && generated.current[feature] !== current) {
        generated.current[feature] = current;
        setLocalStatuses((statuses) => ({ ...statuses, [feature]: 'manual' }));
        onChange(featureStatus[feature] as string, 'manual');
      }
    }
  }, [altValue, onChange, seoValue, summaryValue, tagsValue, values]);

  const setStatus = (feature: Feature, status: Status) => {
    setLocalStatuses((current) => ({ ...current, [feature]: status }));
    onChange(featureStatus[feature] as string, status);
  };
  const existingValue = (feature: Feature) => {
    if (feature === 'summary') return summaryValue;
    if (feature === 'seo') return seoValue.replace('|', '');
    if (feature === 'tags') return tagList(values.tags);
    if (feature === 'alt-text') return altValue;
    return '';
  };

  async function run(feature: Feature, overwrite = false) {
    if (!configured) return;
    const existing = existingValue(feature);
    if (!overwrite && feature !== 'translation' && (Array.isArray(existing) ? existing.length : String(existing).trim())) {
      if (!window.confirm('Field sudah berisi. Timpa dengan hasil AI?')) return;
      overwrite = true;
    }
    setBusy(feature);
    setMessage('');
    try {
      const { data } = await post(`/ai-assistant/${feature}`, {
        documentId, locale, overwrite, title: values.title ?? '', summary: summaryValue,
        content: values.content ?? '', coverId: cover?.id,
      });
      const result = data as Result;
      if (feature === 'summary') {
        generated.current.summary = result.summary ?? '';
        onChange('summary', result.summary);
      } else if (feature === 'seo') {
        generated.current.seo = `${result.metaTitle ?? ''}|${result.metaDescription ?? ''}`;
        onChange('seo.metaTitle', result.metaTitle);
        onChange('seo.metaDescription', result.metaDescription);
      } else if (feature === 'tags') {
        generated.current.tags = (result.tags ?? []).map((tag) => tag.documentId ?? tag.id).sort().join('|');
        onChange('tags', tagRelation(result.tags ?? []));
      } else if (feature === 'alt-text') {
        generated.current['alt-text'] = result.alternativeText ?? '';
        onChange('cover.alternativeText', result.alternativeText);
      }
      setStatus(feature, 'generated');
      setMessage(feature === 'translation' ? `Draft locale ${result.targetLocale} dibuat. Buka locale itu untuk meninjau.` : 'Hasil diterapkan ke form. Tinjau lalu simpan.');
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status === 409 && !overwrite && window.confirm('Konten tujuan sudah berisi. Timpa dengan hasil AI?')) {
        setBusy(null);
        return run(feature, true);
      }
      setStatus(feature, 'failed');
      setMessage(errorMessage(error));
    } finally {
      setBusy(null);
    }
  }

  if (configured === false) return <Message>AI belum dikonfigurasi. Isi variabel AI_* di server.</Message>;
  return <Panel>
    {labels.map(([feature, label]) => <Row key={feature}>
      <div><div>{label}</div><Pill>Status: {String(localStatuses[feature] ?? values[featureStatus[feature]] ?? 'pending')}</Pill></div>
      <Action type="button" disabled={configured !== true || busy !== null || (feature === 'alt-text' && !cover?.id)} onClick={() => void run(feature)}>
        {busy === feature ? 'Memproses…' : 'Jalankan'}
      </Action>
    </Row>)}
    {message ? <Message role="status">{message}</Message> : null}
  </Panel>;
}

export const AiAssistantPanel: PanelComponent = ({ model, documentId }) => {
  if (model !== 'api::article.article' || !documentId) return null;
  return { title: 'AI Assistant', content: <AiAssistant documentId={documentId} /> };
};
