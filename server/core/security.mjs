import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const SESSION_MS = 4 * 60 * 60 * 1000;
const digest = (value) => createHash('sha256').update(value).digest();

function loadOrCreateSecret(filePath, migrationSecret) {
  const readSecret = () => {
    const value = readFileSync(filePath, 'utf8').trim();
    if (value.length < 32) throw new Error('SESSION_SECRET_FILE_INVALID');
    return value;
  };
  try {
    return readSecret();
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  mkdirSync(path.dirname(filePath), { recursive: true });
  const value = migrationSecret?.length >= 32 ? migrationSecret : randomBytes(48).toString('base64url');
  try {
    // Exclusive creation makes concurrent starts use the same persisted secret.
    writeFileSync(filePath, value, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    return value;
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    return readSecret();
  }
}

/** @param {{production?: boolean, env?: Record<string, string | undefined>, now?: () => number, secretFilePath?: string, cookieName?: string}} [options] */
export function createSecurity({ production = false, env = process.env, now = Date.now, secretFilePath, cookieName = 'dol_lesson_session' } = {}) {
  const LEGACY_COOKIE = cookieName;
  const roleCookie = (role) => `${cookieName}_${role}`;
  const counters = new Map();
  const revoked = new Map();
  let activeAI = 0;
  const persistedSecret = secretFilePath ? loadOrCreateSecret(secretFilePath, env.SESSION_SECRET) : null;
  const sessionSecret = persistedSecret || (production ? null : randomBytes(32).toString('hex'));
  const secret = () => sessionSecret;
  const sign = (value) => createHmac('sha256', secret()).update(value).digest('base64url');

  function allowed(key, limit, windowMs) {
    const time = now();
    for (const [id, value] of counters) if (value.until <= time) counters.delete(id);
    if (!counters.has(key) && counters.size >= 10000) return false;
    const counter = counters.get(key) || { count: 0, until: time + windowMs };
    counter.count++;
    counters.set(key, counter);
    return counter.count <= limit;
  }

  // Routes only a teacher session may call. Student access to class routes is checked per route in server.ts.
  function teacherOnlyRequest(req) {
    const route = String(req.originalUrl || req.path || '').split('?')[0].replace(/^\/api(?=\/)/, '');
    return route === '/class-codes'
      || (req.method === 'DELETE' && route.startsWith('/class-codes/'))
      || (req.method === 'GET' && /^\/classroom\/[^/]+$/.test(route))
      || (req.method === 'PUT' && /^\/classroom\/[^/]+\/control$/.test(route))
      || (req.method === 'PUT' && /^\/submissions\/[^/]+\/review$/.test(route))
      || (req.method === 'GET' && route === '/offline-html');
  }

  function cookiesFor(req) {
    const cookies = new Map();
    for (const part of String(req.headers?.cookie || '').split(';')) {
      const separator = part.indexOf('=');
      if (separator > 0) cookies.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
    }
    return cookies;
  }

  function decode(token) {
    if (!secret()) return null;
    if (!token || token.length > 2048) return null;
    const [payload, signature] = token.split('.');
    if (!signature || !timingSafeEqual(digest(signature), digest(sign(payload)))) return null;
    try {
      const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
      for (const [id, expires] of revoked) if (expires <= now()) revoked.delete(id);
      if (!['student', 'teacher'].includes(session.role) || session.expiresAt <= now() || revoked.has(session.nonce)) return null;
      if (session.role === 'student' && (!session.studentId || !session.classCode)) return null;
      return session;
    } catch { return null; }
  }

  function read(req, preferredRole = teacherOnlyRequest(req) ? 'teacher' : undefined) {
    const cookies = cookiesFor(req);
    const names = preferredRole ? [roleCookie(preferredRole), LEGACY_COOKIE] : [roleCookie('student'), roleCookie('teacher'), LEGACY_COOKIE];
    for (const name of names) {
      const session = decode(cookies.get(name));
      if (session && (!preferredRole || session.role === preferredRole)) return session;
    }
    return null;
  }

  return {
    configured: () => Boolean(secret()),
    read,
    issue(res, identity) {
      if (!secret()) throw new Error('SESSION_NOT_CONFIGURED');
      const session = { ...identity, nonce: randomBytes(24).toString('hex'), expiresAt: now() + SESSION_MS };
      const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
      res.cookie(roleCookie(identity.role), payload + '.' + sign(payload), { httpOnly: true, secure: production, sameSite: 'strict', path: '/', maxAge: SESSION_MS });
    },
    logout(req, res) {
      const requestedRole = ['student', 'teacher'].includes(req.body?.role) ? req.body.role : undefined;
      const session = read(req, requestedRole);
      if (session) revoked.set(session.nonce, session.expiresAt);
      const roleToClear = requestedRole || session?.role;
      if (roleToClear) res.clearCookie(roleCookie(roleToClear), { httpOnly: true, secure: production, sameSite: 'strict', path: '/' });
      const legacy = decode(cookiesFor(req).get(LEGACY_COOKIE));
      if (legacy && (!requestedRole || legacy.role === requestedRole)) {
        revoked.set(legacy.nonce, legacy.expiresAt);
        res.clearCookie(LEGACY_COOKIE, { httpOnly: true, secure: production, sameSite: 'strict', path: '/' });
      }
    },
    teacherPasswordMatches(password) {
      return typeof password === 'string' && typeof env.TEACHER_PASSWORD === 'string' && env.TEACHER_PASSWORD.length >= 12 && timingSafeEqual(digest(password), digest(env.TEACHER_PASSWORD));
    },
    loginLimit(req, res, next) {
      // Use the socket address, never an untrusted X-Forwarded-For header.
      const teacher = req.originalUrl.split('?')[0] === '/api/auth/teacher';
      if (!allowed(`login:${teacher}:${req.socket.remoteAddress}`, teacher ? 15 : 150, 15 * 60000)) return res.status(429).json({ error: 'Quá nhiều lần đăng nhập. Vui lòng thử lại sau.' });
      next();
    },
    guard(req, res, next) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (!['GET', 'HEAD'].includes(req.method)) {
        const origin = req.get('origin');
        const expected = env.APP_URL?.replace(/\/$/, '') || `${production ? 'https' : req.protocol}://${req.get('host')}`;
        if (origin && origin !== expected) return res.status(403).json({ code: 'ORIGIN_NOT_ALLOWED', error: 'Request origin is not allowed.' });
        if (req.method !== 'DELETE' && !req.is('application/json')) return res.status(415).json({ error: 'JSON required.' });
      }
      const publicRoute = (req.method === 'GET' && ['/health', '/lesson', '/auth/session'].includes(req.path)) || (req.method === 'POST' && ['/students/login', '/class-codes/validate', '/auth/teacher', '/auth/logout'].includes(req.path));
      if (publicRoute) return next();
      const session = read(req);
      if (!session) {
        if (teacherOnlyRequest(req) && read(req, 'student')) return res.status(403).json({ error: 'Teacher access required.' });
        return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại; bài làm vẫn được lưu.' });
      }
      res.locals.session = session;
      const teacherOnly = teacherOnlyRequest(req);
      if (teacherOnly && session.role !== 'teacher') return res.status(403).json({ error: 'Teacher access required.' });
      next();
    },
    aiLimit(req, res, next) {
      const session = res.locals.session;
      const identity = session.role === 'teacher' ? 'teacher' : session.studentId;
      if (!allowed(`ai:${identity}`, 12, 60000) || !allowed(`ai-hour:${identity}`, 100, 3600000) || !allowed('ai-total', Number(env.AI_HOURLY_CAP) || 600, 3600000) || activeAI >= 4) {
        res.setHeader('Retry-After', '60');
        return res.status(429).json({ error: 'Đã đạt giới hạn chấm bài tạm thời. Vui lòng thử lại sau.' });
      }
      activeAI++;
      let released = false;
      const release = () => { if (!released) { released = true; activeAI--; } };
      res.once('finish', release);
      res.once('close', release);
      next();
    },
  };
}
