export const CATEGORIES = [
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

export const FEATURED_CATS = ['printers','machines','needles','inks','stencil','glide'];
export const BRANDS = ['Inkbox Pro','Dragonhawk','Cheyenne','Bishop','Critical','FK Irons','Eternal','Solid Ink'];

export const TONE = {
  printers:'#0E2A33', machines:'#241226', needles:'#0E2433', inks:'#2A1010',
  stencil:'#10261f',  skinprep:'#0d2630', numbing:'#1a1030', aftercare:'#102218',
  enhance:'#2a2410',  glide:'#27210f',    accessories:'#1c1c22',
};

let _pid = 0;
const P = (o) => ({ id:`p${++_pid}`, rating:4.7, reviews:40, stock:'In stock', skill:'All', brand:BRANDS[(_pid-1)%BRANDS.length], tags:[], ...o });

export const PRODUCTS = [
  P({ name:'Mirage M1 Stencil Printer',       cat:'printers',    sub:'Stencil Printers',    price:289, old:349, skill:'Professional', rating:4.9, reviews:212, highlight:'Wireless thermal stencil printing in 8 seconds',    tags:['bestseller','artist'], specs:{Connectivity:'Bluetooth + USB-C',Battery:'2200mAh / 40 prints',Weight:'410 g',Resolution:'300 dpi'} }),
  P({ name:'PhantomPrint Thermal Pro',         cat:'printers',    sub:'Thermal Printers',    price:219,          skill:'Professional', rating:4.8, reviews:154, highlight:'High-density thermal lines, smudge-proof',           tags:['new'],                specs:{Connectivity:'USB-C',Battery:'Wired',Weight:'620 g',Resolution:'300 dpi'} }),
  P({ name:'Mirage Carry Case + Roll Kit',     cat:'printers',    sub:'Printer Accessories', price:49,                                rating:4.6, reviews:88,  highlight:'Hard shell case with 100 thermal sheets' }),
  P({ name:'SpiritLine Stencil Paper ×100',    cat:'stencil',     sub:'Stencil Papers',      price:34,                                rating:4.8, reviews:301, highlight:'4-layer purple carbon, crisp transfer',             tags:['bestseller'] }),
  P({ name:'GripFix Stencil Cream 250ml',      cat:'stencil',     sub:'Stencil Creams',      price:21,                                rating:4.7, reviews:142, highlight:'Long open-time, no premature drying' }),
  P({ name:'ClearTransfer Gel 200ml',          cat:'stencil',     sub:'Transfer Gels',       price:18,           skill:'Beginner',    rating:4.5, reviews:97,  highlight:'Beginner-friendly, easy clean-up' }),
  P({ name:'Obsidian Lining Black 4oz',        cat:'inks',        sub:'Black Inks',          price:28,                                rating:4.9, reviews:420, highlight:'Dense outline black, smooth flow',                  tags:['bestseller','artist'] }),
  P({ name:'Spectra 12-Color Set',             cat:'inks',        sub:'Ink Sets',            price:139, old:165, skill:'Professional', rating:4.8, reviews:188, highlight:'Vivid, vegan, high-saturation pigments',           tags:['new'] }),
  P({ name:'Prism Color — Electric Blue 1oz',  cat:'inks',        sub:'Color Inks',          price:16,                                rating:4.6, reviews:73,  highlight:'Bright, stable, heals true' }),
  P({ name:'Volt Rotary Pen',                  cat:'machines',    sub:'Rotary Machines',     price:179, old:210, skill:'Professional', rating:4.9, reviews:266, highlight:'Brushless motor, whisper-quiet, 3.5mm stroke',      tags:['bestseller','artist'] }),
  P({ name:'NomadX Wireless Machine',          cat:'machines',    sub:'Wireless Machines',   price:245,          skill:'Professional', rating:4.8, reviews:198, highlight:'Dual battery, 8-hr runtime, OLED voltage',          tags:['new','artist'] }),
  P({ name:'RCA Cord + Grip Bundle',           cat:'machines',    sub:'Machine Accessories', price:32,                                rating:4.5, reviews:64,  highlight:'Tangle-free cord and 25mm alloy grip' }),
  P({ name:'EdgePro Cartridges — 3RL ×20',     cat:'needles',     sub:'Cartridge Needles',   price:24,                                rating:4.8, reviews:233, highlight:'Membrane safety, ultra-sharp taper',                tags:['bestseller'] }),
  P({ name:'Heritage Traditional 9RM',         cat:'needles',     sub:'Traditional Needles', price:14,                                rating:4.6, reviews:51,  highlight:'Hand-soldered, consistent grouping' }),
  P({ name:'Studio Needle Pack ×50 Mixed',     cat:'needles',     sub:'Needle Packs',        price:59,           skill:'Beginner',    rating:4.7, reviews:120, highlight:'Liners, shaders & magnums starter mix' }),
  P({ name:'Verde Green Soap Concentrate 1L',  cat:'skinprep',    sub:'Green Soap',          price:19,                                rating:4.7, reviews:160, highlight:'Dilutable, gentle, dye-free' }),
  P({ name:'AquaBlue Prep Soap 500ml',         cat:'skinprep',    sub:'Blue Soap',           price:15,                                rating:4.5, reviews:58,  highlight:'Anti-bacterial workspace cleanser' }),
  P({ name:'PureFoam Skin Cleanser',           cat:'skinprep',    sub:'Cleaning Foam',       price:12,           skill:'Beginner',    rating:4.4, reviews:44,  highlight:'No-rinse foaming cleanser' }),
  P({ name:'Calm-9 Numbing Cream 30g',         cat:'numbing',     sub:'Numbing Creams',      price:27,                                rating:4.6, reviews:204, highlight:'5% lidocaine, 2-hr comfort window',                tags:['bestseller'] }),
  P({ name:'FreezeMist Numbing Spray',         cat:'numbing',     sub:'Numbing Sprays',      price:23,                                rating:4.4, reviews:77,  highlight:'During-session secondary numbing' }),
  P({ name:'HealFast Aftercare Cream 50ml',    cat:'aftercare',   sub:'Aftercare Creams',    price:17,           skill:'Beginner',    rating:4.8, reviews:290, highlight:'Vegan, fragrance-free, fast healing',              tags:['bestseller'] }),
  P({ name:'Botanic Healing Balm 30g',         cat:'aftercare',   sub:'Healing Balms',       price:14,                                rating:4.6, reviews:101, highlight:'Shea + panthenol barrier balm' }),
  P({ name:'Lumen Brightening Serum',          cat:'enhance',     sub:'Brightening Products',price:22,                                rating:4.5, reviews:63,  highlight:'Revives faded color, weekly use' }),
  P({ name:'ChromaGuard Color Balm',           cat:'enhance',     sub:'Color Protection Balms',price:19,                              rating:4.6, reviews:71,  highlight:'UV-shield, keeps pigment crisp' }),
  P({ name:'SlideMax Glide Ointment 250ml',    cat:'glide',       sub:'Glide Ointment',      price:16,                                rating:4.7, reviews:118, highlight:'Smooth needle glide, low residue' }),
  P({ name:'ButterWork Tattoo Butter 100g',    cat:'glide',       sub:'Tattoo Butter',       price:18,                                rating:4.8, reviews:142, highlight:'Plant-based, soothes during & after',              tags:['new'] }),
  P({ name:'Pro Nitrile Gloves ×100',          cat:'accessories', sub:'Gloves',              price:11,                                rating:4.6, reviews:330, highlight:'Textured grip, powder-free',                       tags:['bestseller'] }),
  P({ name:'Ink Caps Assorted ×500',           cat:'accessories', sub:'Ink Caps',            price:9,                                 rating:4.5, reviews:150, highlight:'Stable base, mixed sizes' }),
  P({ name:'Barrier Film + Clip Cord Sleeves', cat:'accessories', sub:'Clip Cord Covers',    price:13,                                rating:4.4, reviews:60,  highlight:'Cross-contamination protection roll' }),
];

export const WHATSAPP    = '94760336161';
export const WA_DISPLAY  = '076 033 6161';

export const fmt = (n) => 'Rs. ' + Number(n).toLocaleString('en-LK', { minimumFractionDigits: 0 });
export const waLink = (text) => `https://wa.me/${WHATSAPP}?text=` + encodeURIComponent(text);
