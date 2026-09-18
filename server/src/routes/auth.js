import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  authMiddleware,
  createPasswordRecord,
  defaultUserData,
  newUserId,
  signUserToken,
  validatePassword,
  validateUsername,
  verifyPassword,
} from '../auth.js';
import {
  createAccount,
  findAccountByUsername,
  findAccountById,
  getUserData,
  setUserData,
} from '../db.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, (req, res) => {
  const username = validateUsername(req.body?.username);
  const password = validatePassword(req.body?.password);
  if (!username) {
    res.status(400).json({ error: 'invalid_username' });
    return;
  }
  if (!password) {
    res.status(400).json({ error: 'invalid_password' });
    return;
  }
  if (findAccountByUsername(username)) {
    res.status(409).json({ error: 'username_taken' });
    return;
  }

  const id = newUserId();
  try {
    createAccount(id, username, createPasswordRecord(password));
    setUserData(id, defaultUserData());
  } catch (e) {
    if (String(e.message || '').includes('UNIQUE')) {
      res.status(409).json({ error: 'username_taken' });
      return;
    }
    console.error('register failed:', e);
    res.status(500).json({ error: 'storage_error' });
    return;
  }

  res.status(201).json({
    ok: true,
    token: signUserToken(id, username),
    user: { id, name: username },
  });
});

router.post('/login', authLimiter, (req, res) => {
  const username = validateUsername(req.body?.username);
  const password = validatePassword(req.body?.password);
  if (!username || !password) {
    res.status(400).json({ error: 'invalid_credentials' });
    return;
  }

  const account = findAccountByUsername(username);
  if (!account || !verifyPassword(password, account.password_hash)) {
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }

  res.json({
    ok: true,
    token: signUserToken(account.id, account.username),
    user: { id: account.id, name: account.username },
  });
});

router.get('/me', authMiddleware, (req, res) => {
  const account = findAccountById(req.auth.userId);
  if (!account) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({
    ok: true,
    user: {
      id: account.id,
      name: account.username,
      createdAt: account.created_at,
    },
  });
});

router.get('/data', authMiddleware, (req, res) => {
  const row = getUserData(req.auth.userId);
  if (!row) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ ok: true, data: row.data, updatedAt: row.updated_at });
});

router.put('/data', authMiddleware, (req, res) => {
  const incoming = req.body?.data;
  if (!incoming || typeof incoming !== 'object') {
    res.status(400).json({ error: 'invalid_data' });
    return;
  }

  const base = defaultUserData();
  const sanitized = {
    cookHistory: Array.isArray(incoming.cookHistory)
      ? incoming.cookHistory.slice(0, 200).map((item) => ({
        recipeId: String(item.recipeId || '').slice(0, 80),
        recipeName: String(item.recipeName || '').slice(0, 120),
        stars: Math.min(5, Math.max(0, Number(item.stars) || 0)),
        ts: Number(item.ts) || Date.now(),
        lang: String(item.lang || '').slice(0, 10),
      }))
      : base.cookHistory,
    ratings: typeof incoming.ratings === 'object' && incoming.ratings
      ? incoming.ratings
      : base.ratings,
  };

  try {
    setUserData(req.auth.userId, sanitized);
  } catch (e) {
    console.error('data sync failed:', e);
    res.status(500).json({ error: 'storage_error' });
    return;
  }

  res.json({ ok: true });
});

export default router;
