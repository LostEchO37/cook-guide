import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import { authMiddleware, optionalAuth } from '../auth.js';
import {
  createCommunityPost,
  listCommunityPosts,
  getCommunityPost,
  toggleCommunityLike,
  weeklyTopDishes,
  awaitPendingPersist,
} from '../db.js';
import { uploadCommunityPhoto, resolveCommunityPhotoUrl } from '../photo-upload.js';

const router = Router();

const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const likeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/photo/:file', async (req, res) => {
  try {
    const target = await resolveCommunityPhotoUrl(`api/community/photo/${req.params.file}`);
    if (!target) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    if (target.startsWith('http')) {
      const imgRes = await fetch(target);
      if (!imgRes.ok) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      res.set('Content-Type', imgRes.headers.get('content-type') || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400, immutable');
      res.send(Buffer.from(await imgRes.arrayBuffer()));
      return;
    }
    res.sendFile(target);
  } catch (e) {
    console.error('photo proxy failed:', e);
    res.status(404).json({ error: 'not_found' });
  }
});

router.get('/weekly-top', (_req, res) => {
  try {
    res.json({ ok: true, dishes: weeklyTopDishes(5) });
  } catch (e) {
    console.error('weekly-top failed:', e);
    res.status(500).json({ error: 'server_error' });
  }
});

router.get('/posts', optionalAuth, (req, res) => {
  try {
    const posts = listCommunityPosts({
      limit: Number(req.query.limit) || 30,
      viewerId: req.auth?.userId || null,
    });
    res.json({ ok: true, posts });
  } catch (e) {
    console.error('list posts failed:', e);
    res.status(500).json({ error: 'server_error' });
  }
});

router.post('/posts', authMiddleware, postLimiter, async (req, res) => {
  const recipeId = String(req.body?.recipeId || '').trim().slice(0, 80);
  const recipeName = String(req.body?.recipeName || '').trim().slice(0, 120);
  const caption = String(req.body?.caption || '').trim().slice(0, 200);
  const photoData = req.body?.photo;

  if (!recipeId || !recipeName) {
    res.status(400).json({ error: 'invalid_recipe' });
    return;
  }
  if (!photoData) {
    res.status(400).json({ error: 'photo_required' });
    return;
  }

  let photoUrl;
  try {
    photoUrl = await uploadCommunityPhoto(photoData);
  } catch (e) {
    if (e.code === 'invalid_photo') {
      res.status(400).json({ error: 'invalid_photo' });
      return;
    }
    console.error('photo upload failed:', e);
    res.status(500).json({ error: 'upload_failed' });
    return;
  }

  const id = `p_${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}`;
  try {
    createCommunityPost({
      id,
      userId: req.auth.userId,
      username: req.auth.username,
      recipeId,
      recipeName,
      caption,
      photoUrl,
    });
    await awaitPendingPersist();
  } catch (e) {
    console.error('create post failed:', e);
    res.status(500).json({ error: 'storage_error' });
    return;
  }

  res.status(201).json({
    ok: true,
    post: {
      id,
      userId: req.auth.userId,
      username: req.auth.username,
      recipeId,
      recipeName,
      caption,
      photoUrl,
      likeCount: 0,
      createdAt: Date.now(),
      likedByMe: false,
    },
  });
});

router.post('/posts/:id/like', authMiddleware, likeLimiter, async (req, res) => {
  const post = getCommunityPost(req.params.id);
  if (!post) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  try {
    const result = toggleCommunityLike(post.id, req.auth.userId);
    await awaitPendingPersist();
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error('like failed:', e);
    res.status(500).json({ error: 'server_error' });
  }
});

export default router;
