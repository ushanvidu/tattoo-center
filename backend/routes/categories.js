const router = require('express').Router();

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

router.get('/', (_req, res) => res.json(CATEGORIES));

module.exports = router;
