/**
 * Upload community dish photos to Vercel Blob (public),
 * or to local disk when no blob token is configured.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { put } from '@vercel/blob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localUploadDir = path.join(__dirname, '..', 'data', 'uploads');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 1.5 * 1024 * 1024;

function parseDataUrl(dataUrl) {
  const m = String(dataUrl || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return null;
  const mime = m[1];
  const buf = Buffer.from(m[2], 'base64');
  if (!ALLOWED_MIME.has(mime) || buf.length < 32 || buf.length > MAX_BYTES) return null;
  return { mime, buffer: buf };
}

function extForMime(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

export async function uploadCommunityPhoto(dataUrl) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    const err = new Error('invalid_photo');
    err.code = 'invalid_photo';
    throw err;
  }

  const id = crypto.randomBytes(12).toString('hex');
  const ext = extForMime(parsed.mime);
  const key = `community/${id}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, parsed.buffer, {
      access: 'public',
      contentType: parsed.mime,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  fs.mkdirSync(localUploadDir, { recursive: true });
  const filename = `${id}.${ext}`;
  fs.writeFileSync(path.join(localUploadDir, filename), parsed.buffer);
  return `/uploads/${filename}`;
}

export function localUploadsDir() {
  return localUploadDir;
}
