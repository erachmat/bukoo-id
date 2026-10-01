import JSZip from 'jszip';

interface ZipEntry {
  name: string;
  dir: boolean;
  async(type: 'string'): Promise<string>;
}

function attribute(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2] ?? null;
}

function resolveZipPath(basePath: string, href: string): string {
  const path = href.split(/[?#]/, 1)[0].replace(/&amp;/g, '&');
  const parts = `${basePath}/${path}`.split('/');
  const resolved: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') resolved.pop();
    else resolved.push(part);
  }
  return resolved.join('/');
}

function decodeEntities(text: string): string {
  return text.replace(/&(#(?:x[\da-f]+|\d+)|amp|lt|gt|quot|apos|nbsp);/gi, (entity, value: string) => {
    if (value[0] === '#') {
      const hex = value[1]?.toLowerCase() === 'x';
      const point = Number.parseInt(value.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(point) && point <= 0x10ffff ? String.fromCodePoint(point) : ' ';
    }
    return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' } as Record<string, string>)[value.toLowerCase()] ?? ' ';
  });
}

function extractReadableText(xhtml: string): string {
  const tokens = xhtml.match(/<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\/?[a-z][^>]*>|[^<]+/gi) ?? [];
  const stack: { tag: string; excluded: boolean }[] = [];
  const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  let excludedDepth = 0;
  let text = '';

  for (const token of tokens) {
    if (token.startsWith('<!--')) continue;
    if (token.startsWith('</')) {
      const tag = token.match(/^<\/\s*([\w:-]+)/)?.[1]?.toLowerCase();
      if (!tag) continue;
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        const element = stack.pop();
        if (element?.excluded) excludedDepth -= 1;
        if (element?.tag === tag) break;
      }
      if (excludedDepth === 0) text += ' ';
      continue;
    }
    if (token.startsWith('<')) {
      const tag = token.match(/^<\s*([\w:-]+)/)?.[1]?.toLowerCase();
      if (!tag) continue;
      const hidden = /\shidden(?:\s|=|\/?>)/i.test(token) || /\baria-hidden\s*=\s*(["'])true\1/i.test(token);
      const excluded = ['head', 'script', 'style', 'svg', 'noscript', 'template'].includes(tag) || hidden;
      const selfClosing = /\/\s*>$/.test(token) || voidElements.has(tag);
      if (!selfClosing) {
        stack.push({ tag, excluded });
        if (excluded) excludedDepth += 1;
      }
      if (excludedDepth === 0) text += ' ';
      continue;
    }
    if (excludedDepth === 0) text += token;
  }

  return decodeEntities(text);
}

/** Count whitespace-delimited EPUB words in the linear reading order. */
export async function countEpubWords(input: ArrayBuffer | Uint8Array): Promise<number> {
  const zip = await JSZip.loadAsync(input);
  const container = await zip.file('META-INF/container.xml')?.async('string');
  if (!container) throw new Error('EPUB is missing META-INF/container.xml');
  const rootfile = container.match(/<rootfile\b[^>]*>/i)?.[0];
  const packagePath = rootfile ? attribute(rootfile, 'full-path') : null;
  if (!packagePath) throw new Error('EPUB container has no package document');

  const packageEntry = zip.file(packagePath) as ZipEntry | null;
  if (!packageEntry) throw new Error('EPUB package document was not found');
  const packageXml = await packageEntry.async('string');
  const manifest = new Map<string, string>();
  for (const match of packageXml.matchAll(/<item\b[^>]*>/gi)) {
    const id = attribute(match[0], 'id');
    const href = attribute(match[0], 'href');
    if (id && href) manifest.set(id, resolveZipPath(packagePath.split('/').slice(0, -1).join('/'), href));
  }

  let wordCount = 0;
  for (const match of packageXml.matchAll(/<itemref\b[^>]*>/gi)) {
    const itemRef = match[0];
    if (attribute(itemRef, 'linear')?.toLowerCase() === 'no') continue;
    const href = manifest.get(attribute(itemRef, 'idref') ?? '');
    if (!href) continue;
    const entry = zip.file(href) as ZipEntry | null;
    if (!entry || entry.dir) throw new Error(`EPUB spine item was not found: ${href}`);
    const text = extractReadableText(await entry.async('string'));
    wordCount += (text.match(/\S+/gu) ?? []).length;
  }

  if (wordCount <= 0) throw new Error('EPUB has no readable linear-spine text');
  return wordCount;
}
