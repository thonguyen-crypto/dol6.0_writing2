#!/usr/bin/env node
/* Tạo bài mới từ khung src/lessons/_template.
   pnpm new-lesson <id> [--title "Tên bài"] [--activate]
   --activate: chuyển 3 file active-*.ts sang bài mới (app chạy bài này). */
import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const lessons = path.join(root, 'src', 'lessons');
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--title');
const title = args.includes('--title') ? args[args.indexOf('--title') + 1] : 'Lesson mới';
if (!id || !/^[a-z0-9-]+$/.test(id)) {
  console.error('Dùng: pnpm new-lesson <id> [--title "Tên bài"] [--activate]   (id: a-z, 0-9, dấu gạch)');
  process.exit(1);
}
const target = path.join(lessons, id);
if (existsSync(target)) { console.error(`Đã có thư mục src/lessons/${id}.`); process.exit(1); }
cpSync(path.join(lessons, '_template'), target, { recursive: true });
for (const file of readdirSync(target)) {
  const p = path.join(target, file);
  writeFileSync(p, readFileSync(p, 'utf8').replaceAll('__ID__', id).replaceAll('__TITLE__', title.replace(/'/g, "\\'")));
}
console.log(`Đã tạo src/lessons/${id}/ (meta.ts, slides.tsx, rubrics.ts, content.json).`);
if (args.includes('--activate')) {
  writeFileSync(path.join(lessons, 'active-meta.ts'), `/* Bài đang chạy: đổi 3 file active-*.ts (hoặc chạy pnpm new-lesson <id> --activate). */\nexport { default } from './${id}/meta';\n`);
  writeFileSync(path.join(lessons, 'active-slides.ts'), `export { default } from './${id}/slides';\n`);
  writeFileSync(path.join(lessons, 'active-server.ts'), `export { default } from './${id}/rubrics';\n`);
  console.log(`App giờ chạy bài "${id}". Chạy pnpm check:lesson rồi pnpm dev.`);
} else {
  console.log(`App vẫn chạy bài cũ. Thêm --activate, hoặc sửa 3 file src/lessons/active-*.ts trỏ tới ./${id}/…`);
}
