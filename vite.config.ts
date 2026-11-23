import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const root = path.dirname(fileURLToPath(import.meta.url));

/* `vite build --mode offline` → dist/offline/index.html: one self-contained file
   (scripts, styles, fonts, logo inlined) that the teacher downloads from ⚙ Cài đặt
   and opens without a network ("Tải bản offline (HTML)"). */
const dataUri = (file: string, type: string) => `data:${type};base64,${fs.readFileSync(file).toString('base64')}`;

function offlineAssets(): Plugin {
  // Lesson pictures (`'/assets/…'` string literals in src): each file is inlined once as a data URI in
  // globalThis.__DOL_ASSETS__ and the literal becomes a lookup, so the HTML works without a server.
  const used = new Set<string>();
  const mime = (f: string) => ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' } as Record<string, string>)[path.extname(f).toLowerCase()];
  const assetRe = /(=?)(['"])(\/assets\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp|gif|svg))\2/g;
  return {
    name: 'dol-offline-assets',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('/src/') || id.includes('/node_modules/')) return null;
      let out = code;
      if (out.includes('/brand/dol-logo.svg')) out = out
        .replace(/=(['"])\/brand\/dol-logo\.svg\1/g, '={globalThis.__DOL_LOGO__}') // JSX attribute
        .replace(/(['"])\/brand\/dol-logo\.svg\1/g, 'globalThis.__DOL_LOGO__');
      if (out.includes('/assets/')) out = out.replace(assetRe, (m, eq: string, _q: string, url: string) => {
        if (!mime(url) || !fs.existsSync(path.join(root, 'public', url))) return m;
        used.add(url);
        const ref = `globalThis.__DOL_ASSETS__[${JSON.stringify(url)}]`;
        return eq ? `={${ref}}` : ref;
      });
      return out === code ? null : { code: out, map: null };
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const map = Object.fromEntries([...used].sort().map((u) => [u, dataUri(path.join(root, 'public', u), mime(u))]));
        return html.replace('<head>', `<head>\n<script>globalThis.__DOL_ASSETS__=${JSON.stringify(map)}</script>`);
      },
    },
  };
}

function offlineBrand(): Plugin {
  const brand = (f: string) => path.join(root, 'public/brand', f);
  const fontDir = path.join(root, 'node_modules/@fontsource/plus-jakarta-sans');
  const fontFaces = () => ['400', '500', '600', '700', '800', '500-italic', '600-italic'].map((w) => {
    const css = fs.readFileSync(path.join(fontDir, `${w}.css`), 'utf8');
    return css.split(/(?=\/\* plus-jakarta-sans-)/)
      .filter((block) => /-(latin|latin-ext|vietnamese)-\d+-(normal|italic) \*\//.test(block))
      .map((block) => block.replace(/src: url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\)[^;]*;/, (_m, f: string) => `src: url(${dataUri(path.join(fontDir, 'files', f), 'font/woff2')}) format('woff2');`))
      .join('\n');
  }).join('\n');
  return {
    name: 'dol-offline-brand',
    enforce: 'pre',
    transformIndexHtml(html) {
      return html
        .replace(/\s*<link rel="preconnect"[^>]*>/g, '')
        .replace(/\s*<link href="https:\/\/fonts\.googleapis\.com[^>]*>/g, '')
        .replace('href="/brand/dol-symbol.svg"', `href="${dataUri(brand('dol-symbol.svg'), 'image/svg+xml')}"`)
        .replace('</head>', `<style>${fontFaces()}</style>\n<script>globalThis.__DOL_LOGO__=${JSON.stringify(dataUri(brand('dol-logo.svg'), 'image/svg+xml'))}</script>\n</head>`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const offline = mode === 'offline';
  return {
    plugins: [react(), tailwindcss(), ...(offline ? [offlineAssets(), offlineBrand(), viteSingleFile()] : [])],
    resolve: { alias: { '@': path.join(root, 'src') } },
    server: { hmr: process.env.DISABLE_HMR !== 'true' },
    ...(offline ? { base: './', publicDir: false as const, build: { outDir: 'dist/offline', emptyOutDir: true } } : {}),
  };
});
