// One-off migration: the 23 real products already in MongoDB reference their
// images as filesystem paths (e.g. "/uploads/xxx.jpg", served from
// backend/public/uploads/). This rewrites thumbnail/images on each existing
// document to base64 data URIs, embedding the actual image bytes in Mongo
// itself so they survive independent of this machine's disk. Does NOT touch
// price, name, specs, or any other field, and does not delete/re-insert docs.
//
// Usage: node scripts/migrateImagesToBase64.js

require('dotenv').config();
const fs       = require('fs');
const path     = require('path');
const mongoose = require('mongoose');
const Product  = require('../models/Product');

const UPLOAD_DIR = path.join(__dirname, '../public/uploads');

function toDataUri(urlPath) {
  if (!urlPath || urlPath.startsWith('data:')) return urlPath; // already migrated / empty
  const filename = path.basename(urlPath);
  const filePath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ! missing file on disk, left as-is: ${urlPath}`);
    return urlPath;
  }
  const ext = path.extname(filename).toLowerCase().replace('.', '') || 'jpeg';
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  const buf = fs.readFileSync(filePath);
  return `data:image/${mime};base64,${buf.toString('base64')}`;
}

async function connectWithRetry(uri, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      return;
    } catch (err) {
      console.log(`connect attempt ${i}/${attempts} failed: ${err.message}`);
      if (i === attempts) throw err;
    }
  }
}

(async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tattoo-center';
  await connectWithRetry(MONGO_URI);
  console.log('Connected.');

  const products = await Product.find();
  console.log(`Found ${products.length} products.`);

  let migrated = 0, skipped = 0;
  for (const p of products) {
    const newImages = (p.images || []).map(toDataUri);
    const newThumb  = toDataUri(p.thumbnail);

    const changed = newThumb !== p.thumbnail || JSON.stringify(newImages) !== JSON.stringify(p.images);
    if (!changed) { skipped++; continue; }

    p.thumbnail = newThumb;
    p.images = newImages;
    await p.save();
    migrated++;
    console.log(`  ✓ ${p.name} — ${newImages.length} image(s) embedded`);
  }

  console.log(`\nDone. Migrated: ${migrated}, already OK/skipped: ${skipped}, total: ${products.length}`);
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
