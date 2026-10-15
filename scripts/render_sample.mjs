// Render the sample MP4 (and optional style variants as stills). Usage:
//   node scripts/render_sample.mjs --out ../out/sample.mp4 [--style handnote] [--stills 179,240,374]
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import {webpackOverride} from './webpack-override.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const entry = path.resolve(arg('entry', 'examples/sample-12s/index.ts'));
const out = path.resolve(arg('out', 'out/sample.mp4'));
const style = arg('style', undefined);
const stills = arg('stills', '');
const inputProps = style ? {style} : {};
const serveUrl = await bundle({entryPoint: entry, webpackOverride});
const composition = await selectComposition({serveUrl, id: 'EMV-Sample', inputProps});
if (!arg('stills-only', '')) {
  await renderMedia({serveUrl, composition, codec: 'h264', outputLocation: out, inputProps, crf: 18});
  console.log('video -> ' + out);
}
for (const f of stills.split(',').filter(Boolean)) {
  const o = out.replace(/\.mp4$/, '') + `-${style ?? 'default'}-f${f}.png`;
  await renderStill({serveUrl, composition, frame: Number(f), output: o, inputProps});
  console.log('still -> ' + o);
}
