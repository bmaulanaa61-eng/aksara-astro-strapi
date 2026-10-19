import { describe, expect, it, vi } from 'vitest';
import { AiEngine, chunkText, parseJsonObject } from './ai-engine';
import { hasTranslationContent, needsOverwrite, targetLocale } from './ai-helpers';

describe('AI helpers', () => {
  it('parses plain and fenced JSON', () => {
    expect(parseJsonObject('{"summary":"ok"}')).toEqual({ summary: 'ok' });
    expect(parseJsonObject('```json\n{"summary":"ok"}\n```')).toEqual({ summary: 'ok' });
    expect(() => parseJsonObject('not json')).toThrow('JSON yang tidak valid');
  });

  it('chunks long text without losing content', () => {
    const input = `first paragraph\n\n${'x'.repeat(13)}`;
    const chunks = chunkText(input, 10);
    expect(chunks.every((chunk) => chunk.length <= 10)).toBe(true);
    expect(chunks.join('').replace(/\s/g, '')).toBe(input.replace(/\s/g, ''));
  });

  it('retries once with the fallback model', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce(new Response('{"error":{"message":"primary failed"}}', { status: 500 }))
      .mockResolvedValueOnce(new Response('{"choices":[{"message":{"content":"{\\"summary\\":\\"ok\\"}"}}]}'));
    const engine = new AiEngine(
      { baseUrl: 'http://provider.test/v1', apiKey: 'test-key', model: 'primary', fallbackModel: 'fallback', timeoutMs: 1000, maxChars: 20 },
      { info: vi.fn(), error: vi.fn() },
      request
    );

    await expect(engine.generate({ feature: 'summary', locale: 'id', prompt: 'test' })).resolves.toEqual({ summary: 'ok' });
    expect(JSON.parse(request.mock.calls[1][1].body as string).model).toBe('fallback');
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('maps paired locales and detects overwrite risk', () => {
    expect(targetLocale('id')).toBe('en');
    expect(targetLocale('en')).toBe('id');
    expect(hasTranslationContent({ title: 'Existing' })).toBe(true);
    expect(hasTranslationContent({ title: '', seo: {} })).toBe(false);
    expect(needsOverwrite([])).toBe(false);
    expect(needsOverwrite([{ id: 1 }])).toBe(true);
  });
});
