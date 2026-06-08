const router        = require('express').Router();
const CategoryMedia = require('../models/CategoryMedia');
const adminAuth     = require('../middleware/adminAuth');

const CATEGORIES = [
  { id:'printers',    icon:'printer', label:'Printers & Stencil Equipment', short:'Stencil Printers', subs:['Stencil Printers','Thermal Printers','Printer Accessories'] },
  { id:'stencil',     icon:'paper',   label:'Stencil Products',             short:'Stencil Papers',   subs:['Stencil Papers','Stencil Creams','Transfer Gels'] },
  { id:'inks',        icon:'ink',     label:'Tattoo Inks',                  short:'Tattoo Inks',      subs:['Black Inks','Color Inks','Ink Sets'] },
  { id:'machines',    icon:'machine', label:'Tattoo Machines',              short:'Tattoo Machines',  subs:['Rotary Machines','Wireless Machines','Machine Accessories'] },
  { id:'needles',     icon:'needle',  label:'Needles & Cartridges',         short:'Tattoo Needles',   subs:['Cartridge Needles','Traditional Needles','Needle Packs'] },
  { id:'skinprep',    icon:'soap',    label:'Skin Preparation',             short:'Skin Prep',        subs:['Green Soap','Blue Soap','Cleaning Foam','Skin Cleansers'] },
  { id:'numbing',     icon:'drop',    label:'Numbing Products',             short:'Numbing',          subs:['Numbing Creams','Numbing Sprays','Numbing Gels'] },
  { id:'aftercare',   icon:'shield',  label:'Tattoo Aftercare',             short:'Aftercare',        subs:['Aftercare Creams','Healing Balms','Tattoo Washes'] },
  { id:'enhance',     icon:'sparkle', label:'Tattoo Enhancement',           short:'Enhancement',      subs:['Enhance Balms','Brightening Products','Color Protection Balms'] },
  { id:'glide',       icon:'cream',   label:'Glide & Ointments',            short:'Glide & Ointments',subs:['Glide Ointment','Tattoo Butter'] },
  { id:'accessories', icon:'glove',   label:'Accessories',                  short:'Accessories',      subs:['Ink Caps','Grip Covers','Machine Covers','Gloves','Clip Cord Covers'] },
];

// GET /api/categories — return categories merged with DB media
router.get('/', async (_req, res) => {
  try {
    const mediaList = await CategoryMedia.find({});
    const mediaMap  = Object.fromEntries(mediaList.map(m => [m.catId, m]));
    const result    = CATEGORIES.map(c => ({
      ...c,
      imageUrl:    mediaMap[c.id]?.imageUrl    || '',
      videoUrl:    mediaMap[c.id]?.videoUrl    || '',
      bannerText:  mediaMap[c.id]?.bannerText  || '',
      description: mediaMap[c.id]?.description || '',
    }));
    res.json(result);
  } catch {
    res.json(CATEGORIES);
  }
});

// PATCH /api/categories/:id — admin updates category media
router.patch('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  if (!CATEGORIES.find(c => c.id === id)) return res.status(404).json({ error: 'Category not found' });
  try {
    const { imageUrl, videoUrl, bannerText, description } = req.body;
    const media = await CategoryMedia.findOneAndUpdate(
      { catId: id },
      { $set: { imageUrl: imageUrl||'', videoUrl: videoUrl||'', bannerText: bannerText||'', description: description||'' } },
      { upsert: true, new: true }
    );
    res.json(media);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update category media' });
  }
});

module.exports = router;
