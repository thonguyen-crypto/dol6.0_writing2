// JSON-file store for one lesson app: students, submissions, per-class live control state.
// Writes are serialized through one queue and replaced atomically (tmp file + rename).
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const normalize = (code) => String(code || '').trim().toUpperCase();
const empty = () => ({ version: 1, students: [], submissions: [], controls: {} });

export const defaultControl = (firstStep = '') => ({
  teacherStep: firstStep,
  build: 0,
  paused: false,
  gate: null,
  gateAuto: false,
  revealed: {},
  invitation: null,
  updatedAt: new Date(0).toISOString(),
});

export function createClassroomStore({ filePath, firstStep = '' }) {
  let queue = Promise.resolve();

  async function read() {
    try {
      const data = JSON.parse(await readFile(filePath, 'utf8'));
      return {
        version: 1,
        students: Array.isArray(data.students) ? data.students : [],
        submissions: Array.isArray(data.submissions) ? data.submissions : [],
        controls: data.controls && typeof data.controls === 'object' ? data.controls : {},
      };
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      return empty();
    }
  }

  function mutate(change) {
    const op = queue.catch(() => undefined).then(async () => {
      const data = await read();
      const result = change(data);
      await mkdir(path.dirname(filePath), { recursive: true });
      const tmp = `${filePath}.${process.pid}.tmp`;
      const text = JSON.stringify(data, null, 2);
      await writeFile(tmp, text, 'utf8');
      try {
        await rename(tmp, filePath);
      } catch (error) {
        if (!['EPERM', 'EEXIST'].includes(error?.code)) throw error;
        await writeFile(filePath, text, 'utf8');
        await unlink(tmp).catch(() => undefined);
      }
      return result;
    });
    queue = op.catch(() => undefined);
    return op;
  }

  return {
    read,
    async getStudent(id) {
      return (await read()).students.find((s) => s.id === id) || null;
    },
    async upsertStudent(student) {
      return mutate((data) => {
        const i = data.students.findIndex((s) => s.id === student.id);
        if (i >= 0) data.students[i] = { ...data.students[i], ...student };
        else data.students.push(student);
        return data.students[i >= 0 ? i : data.students.length - 1];
      });
    },
    async getSubmission(id) {
      return (await read()).submissions.find((s) => s.id === id) || null;
    },
    /** change(existing) returns the next submission or throws; runs inside the write queue. */
    async updateSubmission(id, change) {
      return mutate((data) => {
        const i = data.submissions.findIndex((s) => s.id === id);
        const next = change(i >= 0 ? data.submissions[i] : null);
        if (!next) return null; // rejected change: nothing to store
        if (i >= 0) data.submissions[i] = next;
        else data.submissions.push(next);
        return next;
      });
    },
    async getClassroom(classCode) {
      const data = await read();
      const code = normalize(classCode);
      return {
        students: data.students.filter((s) => normalize(s.classCode) === code),
        submissions: data.submissions.filter((s) => normalize(s.classCode) === code),
        control: data.controls[code] || defaultControl(firstStep),
      };
    },
    async getStudentProgress(studentId) {
      const data = await read();
      return {
        student: data.students.find((s) => s.id === studentId) || null,
        submissions: data.submissions.filter((s) => s.studentId === studentId),
      };
    },
    async getControl(classCode) {
      return (await read()).controls[normalize(classCode)] || defaultControl(firstStep);
    },
    async updateControl(classCode, change) {
      return mutate((data) => {
        const code = normalize(classCode);
        const next = { ...(data.controls[code] || defaultControl(firstStep)) };
        change(next);
        next.updatedAt = new Date().toISOString();
        data.controls[code] = next;
        return next;
      });
    },
    async removeClass(classCode) {
      return mutate((data) => {
        const code = normalize(classCode);
        delete data.controls[code];
        return true;
      });
    },
  };
}
