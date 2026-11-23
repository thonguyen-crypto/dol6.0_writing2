/* Offline build (`vite build --mode offline`, downloaded from ⚙ Cài đặt → "Tải bản offline (HTML)").
   One HTML file, no server: the teacher teaches and presents locally; activities run as a demo,
   nothing is saved and AI grading is not available. */
// import.meta.env is undefined when the lesson files are loaded by node (lesson check, tests).
export const OFFLINE = import.meta.env?.MODE === 'offline';
export const OFFLINE_CLASS = 'OFFLINE';
export const OFFLINE_AI_MSG = 'Bản offline không chấm bài được. Mở bản online của bài học để nộp bài.';
