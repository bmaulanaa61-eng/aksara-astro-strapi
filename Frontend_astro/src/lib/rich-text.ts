import sanitizeHtml from 'sanitize-html';

const allowedTags = ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'a', 'code', 'pre', 'br'];

export function renderRichText(value: string): string {
  return sanitizeHtml(value, {
    allowedTags,
    allowedAttributes: { a: ['href', 'target', 'rel'], code: ['class'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (_tagName, attribs) => ({ tagName: 'a', attribs: { ...attribs, ...(attribs.target === '_blank' ? { rel: 'noopener noreferrer' } : {}) } }),
    },
  });
}

export function readingTime(html: string): number {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 200));
}

export function withHeadingIds(html: string): { html: string; headings: { id: string; text: string }[] } {
  const headings: { id: string; text: string }[] = [];
  let index = 0;
  const rendered = renderRichText(html).replace(/<h([23])>(.*?)<\/h\1>/gi, (_match, level, inner) => {
    const text = sanitizeHtml(inner, { allowedTags: [], allowedAttributes: {} });
    const base = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `bagian-${index + 1}`;
    const id = `${base}-${++index}`;
    headings.push({ id, text });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
  return { html: rendered, headings };
}
