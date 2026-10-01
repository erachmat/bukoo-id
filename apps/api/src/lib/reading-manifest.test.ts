import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { countEpubWords } from '../../../../packages/db/src/reading-manifest.js';

async function makeEpub(): Promise<ArrayBuffer> {
  const zip = new JSZip();
  zip.file('META-INF/container.xml', '<container><rootfiles><rootfile full-path="OPS/package.opf"/></rootfiles></container>');
  zip.file(
    'OPS/package.opf',
    '<package><manifest><item id="chapter" href="text/chapter.xhtml"/><item id="nav" href="nav.xhtml"/></manifest><spine><itemref idref="chapter"/><itemref idref="nav" linear="no"/></spine></package>',
  );
  zip.file('OPS/text/chapter.xhtml', '<html><head><title>Hidden title words</title></head><body><p>First five count here.</p><p>More&nbsp;text &amp; words</p><div hidden>Collapsed text is excluded</div><aside aria-hidden="true">Decorative text is excluded</aside><script>Ignore these words</script></body></html>');
  zip.file('OPS/nav.xhtml', '<html><body><p>Navigation words are excluded</p></body></html>');
  return zip.generateAsync({ type: 'arraybuffer' });
}

describe('EPUB reading manifest', () => {
  it('counts only readable linear-spine text and decodes HTML entities', async () => {
    expect(await countEpubWords(await makeEpub())).toBe(8);
  });

  it('rejects malformed EPUB containers instead of inventing a denominator', async () => {
    await expect(countEpubWords(new TextEncoder().encode('not a zip'))).rejects.toThrow();
  });
});
