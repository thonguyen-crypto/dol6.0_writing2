import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const normalize = (code) => String(code || '').trim().toUpperCase();

/** @param {{ filePath: string, defaultCodes?: string[] }} options */
export function createClassCodeStore({ filePath, defaultCodes = [] }) {
  const normalizedDefaults = [...new Set(defaultCodes.map(normalize).filter(Boolean))];
  const schemaVersion = 2;

  async function write(codes) {
    await mkdir(path.dirname(filePath), { recursive: true });
    const temporaryPath = `${filePath}.${process.pid}.tmp`;
    const serialized = JSON.stringify({ version: schemaVersion, codes }, null, 2);
    await writeFile(temporaryPath, serialized, 'utf8');
    try {
      await rename(temporaryPath, filePath);
    } catch (error) {
      if (!['EPERM', 'EEXIST'].includes(error?.code)) throw error;
      await writeFile(filePath, serialized, 'utf8');
      await unlink(temporaryPath).catch(() => undefined);
    }
  }

  async function list() {
    try {
      const stored = JSON.parse(await readFile(filePath, 'utf8'));
      if (Array.isArray(stored)) {
        const migrated = [...new Set([...stored, ...normalizedDefaults].map(normalize).filter(Boolean))];
        await write(migrated);
        return migrated;
      }
      if (stored && Array.isArray(stored.codes)) {
        return [...new Set(stored.codes.map(normalize).filter(Boolean))];
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }

    await write(normalizedDefaults);
    return normalizedDefaults;
  }

  return {
    list,
    async has(code) {
      return (await list()).includes(normalize(code));
    },
    async add(code) {
      const normalizedCode = normalize(code);
      if (!normalizedCode) throw new Error('Class code is required');
      const codes = await list();
      const nextCodes = codes.includes(normalizedCode) ? codes : [...codes, normalizedCode];
      await write(nextCodes);
      return nextCodes;
    },
    async remove(code) {
      const nextCodes = (await list()).filter((item) => item !== normalize(code));
      await write(nextCodes);
      return nextCodes;
    },
  };
}
