export type AiFeature = 'summary' | 'seo' | 'tags' | 'alt-text' | 'translation';
export type Locale = 'id' | 'en';

type Logger = {
  info(message: string): void;
  error(message: string): void;
};

type AiConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  fallbackModel?: string;
  visionModel?: string;
  timeoutMs: number;
  maxChars: number;
};

type GenerateOptions = {
  feature: AiFeature;
  locale: Locale;
  prompt: string;
  image?: { mime: string; data: string };
  model?: string;
};

type ChatResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_MAX_CHARS = 12_000;

export class AiEngineError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
    this.name = 'AiEngineError';
  }
}

export function getAiConfig(env: NodeJS.ProcessEnv = process.env): AiConfig | null {
  const baseUrl = env.AI_BASE_URL?.trim().replace(/\/+$/, '');
  const apiKey = env.AI_API_KEY?.trim();
  const model = env.AI_MODEL?.trim();
  if (!baseUrl || !apiKey || !model) return null;

  return {
    baseUrl,
    apiKey,
    model,
    fallbackModel: env.AI_FALLBACK_MODEL?.trim() || undefined,
    visionModel: env.AI_VISION_MODEL?.trim() || undefined,
    timeoutMs: positiveInteger(env.AI_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    maxChars: positiveInteger(env.AI_MAX_CHARS, DEFAULT_MAX_CHARS),
  };
}

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseJsonObject(value: string): Record<string, unknown> {
  const trimmed = value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new AiEngineError('Provider AI mengembalikan JSON yang tidak valid.');
  }
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new AiEngineError('Provider AI harus mengembalikan sebuah objek JSON.');
  }
  return parsed as Record<string, unknown>;
}

export function chunkText(value: string, maxChars: number): string[] {
  const text = value.trim();
  if (!text) return [];
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let current = '';
  for (const paragraph of text.split(/\n{2,}/)) {
    const pieces = paragraph.length > maxChars
      ? paragraph.match(new RegExp(`[\\s\\S]{1,${maxChars}}`, 'g')) ?? []
      : [paragraph];
    for (const piece of pieces) {
      const candidate = current ? `${current}\n\n${piece}` : piece;
      if (candidate.length > maxChars && current) {
        chunks.push(current);
        current = piece;
      } else {
        current = candidate;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export class AiEngine {
  constructor(
    private readonly config: AiConfig,
    private readonly logger: Logger = console,
    private readonly request: typeof fetch = fetch
  ) {}

  static fromEnv(logger?: Logger, env: NodeJS.ProcessEnv = process.env) {
    const config = getAiConfig(env);
    return config ? new AiEngine(config, logger) : null;
  }

  get maxChars() {
    return this.config.maxChars;
  }

  async generate(options: GenerateOptions): Promise<Record<string, unknown>> {
    const primaryModel = options.model ?? this.config.model;
    const fallbackModel = this.config.fallbackModel;
    try {
      return await this.call(primaryModel, options);
    } catch (error) {
      if (!fallbackModel || fallbackModel === primaryModel) throw error;
      return this.call(fallbackModel, options);
    }
  }

  get visionModel() {
    return this.config.visionModel ?? this.config.model;
  }

  private async call(model: string, options: GenerateOptions) {
    const startedAt = Date.now();
    try {
      const content = options.image
        ? [
            { type: 'text', text: options.prompt },
            { type: 'image_url', image_url: { url: `data:${options.image.mime};base64,${options.image.data}` } },
          ]
        : options.prompt;
      const response = await this.request(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: `You are an editorial assistant. Reply with valid JSON only. Output language: ${options.locale}.`,
            },
            { role: 'user', content },
          ],
        }),
        signal: AbortSignal.timeout(this.config.timeoutMs),
      });
      const payload = (await response.json().catch(() => ({}))) as ChatResponse;
      if (!response.ok) {
        throw new AiEngineError(payload.error?.message || `Provider AI merespons HTTP ${response.status}.`);
      }
      const answer = payload.choices?.[0]?.message?.content;
      if (!answer) throw new AiEngineError('Provider AI tidak mengembalikan konten.');
      const result = parseJsonObject(answer);
      this.logger.info(`[aksara:ai] feature=${options.feature} model=${model} durationMs=${Date.now() - startedAt} status=ok`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown AI error';
      this.logger.error(`[aksara:ai] feature=${options.feature} model=${model} durationMs=${Date.now() - startedAt} status=failed error=${message}`);
      if (error instanceof AiEngineError) throw error;
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new AiEngineError('Permintaan AI melewati batas waktu.', 504);
      }
      throw new AiEngineError('Provider AI tidak dapat dihubungi.');
    }
  }
}
