/* pnpm check:lesson — checks the active lesson (src/lessons/active-*.ts). */
import lesson from '../src/lessons/active-meta';
import slides from '../src/lessons/active-slides';
import rubrics from '../src/lessons/active-server';
import { checkLesson } from '../src/kit/checkLesson';

const report = checkLesson(lesson, Object.keys(slides), rubrics);
console.log(`Bài: ${lesson.title} (${lesson.id}) · ${lesson.steps.length} bước · ${lesson.steps.filter((s) => s.tracking).length} trang có tracking`);
for (const w of report.warnings) console.log(`  ! ${w}`);
for (const e of report.errors) console.log(`  ✗ ${e}`);
console.log(report.errors.length ? `${report.errors.length} lỗi cần sửa.` : 'Không có lỗi.');
process.exit(report.errors.length ? 1 : 0);
