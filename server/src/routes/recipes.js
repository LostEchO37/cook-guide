import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import { authMiddleware, optionalAuth } from '../auth.js';
import {
  getPublicProfile,
  listUserRecipes,
  getUserRecipe,
  upsertUserRecipe,
  deleteUserRecipe,
  awaitPendingPersist,
} from '../db.js';
import { uploadCommunityPhoto } from '../photo-upload.js';

const router = Router();

const recipeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/profile/:username', optionalAuth, (req, res) => {
  try {
    const profile = getPublicProfile(req.params.username, req.auth?.userId || null);
    if (!profile) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.json({ ok: true, profile });
  } catch (e) {
    console.error('profile failed:', e);
    res.status(500).json({ error: 'server_error' });
  }
});

router.get('/recipes', optionalAuth, (req, res) => {
  try {
    const mine = String(req.query.mine || '') === '1';
    if (mine) {
      if (!req.auth?.userId) {
        res.status(401).json({ error: 'unauthorized' });
        return;
      }
      res.json({
        ok: true,
        recipes: listUserRecipes({ userId: req.auth.userId, publishedOnly: false }),
      });
      return;
    }
    res.json({ ok: true, recipes: listUserRecipes({ publishedOnly: true, limit: Number(req.query.limit) || 50 }) });
  } catch (e) {
    console.error('list recipes failed:', e);
    res.status(500).json({ error: 'server_error' });
  }
});

router.get('/recipes/:id', (req, res) => {
  try {
    const recipe = getUserRecipe(req.params.id);
    if (!recipe || !recipe.published) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.json({ ok: true, recipe });
  } catch (e) {
    console.error('get recipe failed:', e);
    res.status(500).json({ error: 'server_error' });
  }
});

router.post('/recipes', authMiddleware, recipeLimiter, async (req, res) => {
  const title = String(req.body?.title || '').trim().slice(0, 80);
  const description = String(req.body?.description || '').trim().slice(0, 500);
  const ingredients = Array.isArray(req.body?.ingredients)
    ? req.body.ingredients.map((x) => String(x).trim()).filter(Boolean).slice(0, 40)
    : [];
  const steps = Array.isArray(req.body?.steps)
    ? req.body.steps.map((x) => String(x).trim()).filter(Boolean).slice(0, 40)
    : [];
  const tags = Array.isArray(req.body?.tags)
    ? req.body.tags.map((x) => String(x).trim().toLowerCase()).filter(Boolean).slice(0, 12)
    : [];
  const published = req.body?.published !== false;
  const photoData = req.body?.photo;

  if (!title || ingredients.length < 1 || steps.length < 1) {
    res.status(400).json({ error: 'invalid_recipe' });
    return;
  }

  let photoUrl = '';
  if (photoData) {
    try {
      photoUrl = await uploadCommunityPhoto(photoData);
    } catch (e) {
      if (e.code === 'invalid_photo') {
        res.status(400).json({ error: 'invalid_photo' });
        return;
      }
      console.error('recipe photo upload failed:', e);
      res.status(500).json({ error: 'upload_failed' });
      return;
    }
  }

  const id = `ur_${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;
  try {
    const recipe = upsertUserRecipe({
      id,
      userId: req.auth.userId,
      username: req.auth.username,
      title,
      description,
      ingredients,
      steps,
      tags,
      photoUrl,
      published,
    });
    await awaitPendingPersist();
    res.status(201).json({ ok: true, recipe });
  } catch (e) {
    console.error('create recipe failed:', e);
    res.status(500).json({ error: 'storage_error' });
  }
});

router.put('/recipes/:id', authMiddleware, recipeLimiter, async (req, res) => {
  const existing = getUserRecipe(req.params.id);
  if (!existing || existing.userId !== req.auth.userId) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  const title = String(req.body?.title || existing.title).trim().slice(0, 80);
  const description = String(req.body?.description ?? existing.description).trim().slice(0, 500);
  const ingredients = Array.isArray(req.body?.ingredients)
    ? req.body.ingredients.map((x) => String(x).trim()).filter(Boolean).slice(0, 40)
    : existing.ingredients;
  const steps = Array.isArray(req.body?.steps)
    ? req.body.steps.map((x) => String(x).trim()).filter(Boolean).slice(0, 40)
    : existing.steps;
  const tags = Array.isArray(req.body?.tags)
    ? req.body.tags.map((x) => String(x).trim().toLowerCase()).filter(Boolean).slice(0, 12)
    : existing.tags;
  const published = req.body?.published !== undefined ? req.body.published !== false : existing.published;

  let photoUrl = existing.photoUrl || '';
  if (req.body?.photo) {
    try {
      photoUrl = await uploadCommunityPhoto(req.body.photo);
    } catch (e) {
      if (e.code === 'invalid_photo') {
        res.status(400).json({ error: 'invalid_photo' });
        return;
      }
      res.status(500).json({ error: 'upload_failed' });
      return;
    }
  }

  try {
    const recipe = upsertUserRecipe({
      id: existing.id,
      userId: req.auth.userId,
      username: req.auth.username,
      title,
      description,
      ingredients,
      steps,
      tags,
      photoUrl,
      published,
      createdAt: existing.createdAt,
    });
    await awaitPendingPersist();
    res.json({ ok: true, recipe });
  } catch (e) {
    console.error('update recipe failed:', e);
    res.status(500).json({ error: 'storage_error' });
  }
});

router.delete('/recipes/:id', authMiddleware, async (req, res) => {
  try {
    const ok = deleteUserRecipe(req.params.id, req.auth.userId);
    if (!ok) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    await awaitPendingPersist();
    res.json({ ok: true });
  } catch (e) {
    console.error('delete recipe failed:', e);
    res.status(500).json({ error: 'server_error' });
  }
});

export default router;
