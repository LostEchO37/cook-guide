#!/usr/bin/env node
/**
 * One-time: download ember-analytics.sqlite from Vercel Blob to ./data/analytics.sqlite
 * Requires BLOB_READ_WRITE_TOKEN in server/.env or environment.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { restoreDbFromBlob } from '../src/blob-persist.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '..', 'data', 'analytics.sqlite');

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Set BLOB_READ_WRITE_TOKEN (Vercel Blob) first.');
  process.exit(1);
}

fs.mkdirSync(path.dirname(out), { recursive: true });
const ok = await restoreDbFromBlob(out);
if (!ok) {
  console.error('Blob restore failed — is ember-analytics.sqlite present in Blob?');
  process.exit(1);
}
console.log('Saved', out, fs.statSync(out).size, 'bytes');
console.log('Next: sqlite3', out, '.dump > ember.dump.sql');
console.log('Then: turso db shell YOUR_DB < ember.dump.sql');
