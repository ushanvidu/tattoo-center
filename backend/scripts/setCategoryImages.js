// One-off: set a representative cover photo per category (CategoryMedia.imageUrl),
// used by the "Shop by Category" tiles. Stored as base64 data URIs in Mongo,
// consistent with how product images are stored. Safe to re-run (upserts).
//
// Usage: node scripts/setCategoryImages.js <images_dir>
// images_dir should contain <catId>.jpg for each category id.

require('dotenv').config();
const fs       = require('fs');
const path     = require('path');
const mongoose = require('mongoose');
const CategoryMedia = require('../models/CategoryMedia');

const imagesDir = process.argv[2];
if (!imagesDir || !fs.existsSync(imagesDir)) {
  console.error('Usage: node scripts/setCategoryImages.js <images_dir>');
  process.exit(1);
}

const CAT_IDS = ['printers','stencil','inks','machines','needles','skinprep','numbing','aftercare','enhance','glide','accessories'];

function toDataUri(filePath) {
  const buf = fs.readFileSync(filePath);
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

(async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tattoo-center';
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected.');

  for (const catId of CAT_IDS) {
    const filePath = path.join(imagesDir, `${catId}.jpg`);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ! no image file for ${catId}, skipping`);
      continue;
    }
    const imageUrl = toDataUri(filePath);
    await CategoryMedia.findOneAndUpdate(
      { catId },
      { $set: { imageUrl } },
      { upsert: true, new: true }
    );
    console.log(`  ✓ ${catId}`);
  }

  console.log('Done.');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
