import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  adminFetchProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminFetchAnnouncements, adminCreateAnnouncement, adminUpdateAnnouncement, adminDeleteAnnouncement,
  adminFetchOrders, adminUpdateOrderStatus,
  adminFetchBookings,
  fetchAllQuestions, answerQuestion, deleteQuestion,
  fetchCategories, adminUpdateCategoryMedia,
  uploadFile,
} from '../../utils/api';
import { CATEGORIES } from '../../data/data';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt   = (n) => `$${Number(n).toFixed(2)}`;

function StatusBadge({ status }) {
  const colors = { pending:'#f59e0b', processing:'#3b82f6', shipped:'#8b5cf6', delivered:'#22c55e', cancelled:'#ef4444', answered:'#22c55e' };
  return (
    <span style={{ background:`${colors[status]||'#888'}22`, color:colors[status]||'#888', border:`1px solid ${colors[status]||'#888'}44`, borderRadius:20, padding:'3px 10px', fontSize:11, fontFamily:'monospace', letterSpacing:'.06em', textTransform:'uppercase' }}>
      {status}
    </span>
  );
}

function Stat({ label, value, sub, color='#00e0c6' }) {
  return (
    <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:'20px 22px' }}>
      <div style={{ color, fontSize:28, fontFamily:"'Oswald',sans-serif", fontWeight:700, lineHeight:1 }}>{value}</div>
      <div style={{ color:'rgba(255,255,255,.7)', fontSize:13, marginTop:4 }}>{label}</div>
      {sub && <div style={{ color:'rgba(255,255,255,.35)', fontSize:11, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV = [
  { id:'overview',      icon:'⊞',  label:'Overview' },
  { id:'products',      icon:'📦', label:'Products' },
  { id:'categories',    icon:'🗂',  label:'Categories' },
  { id:'announcements', icon:'📢', label:'Announcements' },
  { id:'orders',        icon:'🧾', label:'Orders' },
  { id:'bookings',      icon:'📅', label:'Bookings' },
  { id:'qa',            icon:'💬', label:'Q&A' },
];

function Sidebar({ active, setActive, admin, logout }) {
  return (
    <div style={{ width:220, flexShrink:0, height:'100vh', position:'sticky', top:0, display:'flex', flexDirection:'column', background:'rgba(255,255,255,.03)', borderRight:'1px solid rgba(255,255,255,.07)' }}>
      <div style={{ padding:'24px 20px 20px', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#00e0c6,#00b4d8)', display:'grid', placeItems:'center', fontWeight:900, color:'#000', fontSize:16 }}>T</div>
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, letterSpacing:'.1em', color:'#fff', textTransform:'uppercase' }}>Tattoo Center</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,.3)', letterSpacing:'.18em', textTransform:'uppercase', fontFamily:'monospace' }}>Admin Panel</div>
          </div>
        </div>
      </div>
      <div style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
        {NAV.map(({ id, icon, label }) => (
          <button key={id} onClick={() => setActive(id)}
            style={{ width:'100%', textAlign:'left', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, border:'none', cursor:'pointer', marginBottom:3, transition:'.15s',
              background: active===id ? 'rgba(0,224,198,.12)' : 'none',
              color: active===id ? '#00e0c6' : 'rgba(255,255,255,.55)',
              fontFamily:"'Space Grotesk',sans-serif", fontSize:13.5, fontWeight: active===id ? 600 : 400,
            }}>
            <span style={{ fontSize:15, width:20, textAlign:'center' }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>
      <div style={{ padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,.06)' }}>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:2, fontFamily:'monospace' }}>Signed in as</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.7)', marginBottom:10 }}>{admin?.username}</div>
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/" style={{ fontSize:11, color:'rgba(0,224,198,.6)', textDecoration:'none', letterSpacing:'.08em' }}>← Site</Link>
          <span style={{ color:'rgba(255,255,255,.15)' }}>|</span>
          <button onClick={logout} style={{ fontSize:11, color:'rgba(255,100,100,.7)', background:'none', border:'none', cursor:'pointer', letterSpacing:'.08em', padding:0 }}>Logout</button>
        </div>
      </div>
    </div>
  );
}

// ─── FILE UPLOAD BUTTON ───────────────────────────────────────────────────────

function UploadBtn({ onUploaded, accept = 'image/*', label = 'Upload File', style: extraStyle }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr('');
    try {
      const result = await uploadFile(file);
      onUploaded(result.url);
    } catch (ex) {
      setErr(ex?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4, ...extraStyle }}>
      <input ref={ref} type="file" accept={accept} onChange={handleChange} style={{ display:'none' }} />
      <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
        style={{ ...btnGhost, padding:'7px 14px', fontSize:12, opacity: uploading ? .6 : 1 }}>
        {uploading ? '⏳ Uploading…' : `⬆ ${label}`}
      </button>
      {err && <span style={{ fontSize:11, color:'#ff7070' }}>{err}</span>}
    </div>
  );
}

// ─── IMAGE PREVIEW ────────────────────────────────────────────────────────────

function ImgPreview({ src, size = 60 }) {
  if (!src) return null;
  return (
    <img src={src} alt="" style={{ width:size, height:size, objectFit:'cover', borderRadius:8, border:'1px solid rgba(255,255,255,.1)', flexShrink:0 }} />
  );
}

// ─── IMAGE GALLERY EDITOR ─────────────────────────────────────────────────────

function ImageGalleryEditor({ images, onChange }) {
  const [urlInput, setUrlInput] = useState('');

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    onChange([...images, url]);
    setUrlInput('');
  }

  function remove(i) {
    onChange(images.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {/* Current images */}
      {images.length > 0 && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {images.map((src, i) => (
            <div key={i} style={{ position:'relative' }}>
              <img src={src} alt="" style={{ width:72, height:72, objectFit:'cover', borderRadius:9, border:'1px solid rgba(255,255,255,.12)' }} />
              <button type="button" onClick={() => remove(i)}
                style={{ position:'absolute', top:-6, right:-6, width:18, height:18, borderRadius:'50%', background:'#ef4444', border:'none', cursor:'pointer', color:'#fff', fontSize:11, display:'grid', placeItems:'center', lineHeight:1 }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Add via URL */}
      <div style={{ display:'flex', gap:8 }}>
        <input className="inp" style={darkInp} value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Paste image URL…" onKeyDown={e => e.key==='Enter' && (e.preventDefault(), addUrl())} />
        <button type="button" onClick={addUrl} style={btnEdit}>+ URL</button>
      </div>
      {/* Upload from device */}
      <UploadBtn accept="image/*" label="Upload Image" onUploaded={url => onChange([...images, url])} />
      {images.length === 0 && <p style={{ fontSize:12, color:'rgba(255,255,255,.3)', margin:0 }}>No images yet. Add a URL or upload from your device.</p>}
    </div>
  );
}

// ─── VIDEO FIELD ──────────────────────────────────────────────────────────────

function VideoField({ value, onChange }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <input className="inp" style={darkInp} value={value} onChange={e => onChange(e.target.value)}
        placeholder="YouTube URL or /uploads/video.mp4" />
      {value && (
        <div style={{ fontSize:11, color:'rgba(0,224,198,.6)', wordBreak:'break-all' }}>
          {value.includes('youtube') || value.includes('youtu.be')
            ? '▶ YouTube video linked'
            : `▶ File: ${value}`}
        </div>
      )}
      <UploadBtn accept="video/*,video/mp4,video/webm" label="Upload Video" onUploaded={onChange} />
    </div>
  );
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

const CAT_OPTIONS = CATEGORIES.map(c => ({ value: c.id, label: c.label, short: c.short }));
const BLANK_PRODUCT = { name:'', cat:'printers', sub:'', price:'', old:'', brand:'', highlight:'', skill:'All', tags:'', stock:'In stock', rating:4.7, thumbnail:'', images:[], videoUrl:'' };

function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(BLANK_PRODUCT);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState('');

  const load = useCallback(() => {
    adminFetchProducts().then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing('new'); setForm(BLANK_PRODUCT); setErr(''); }
  function openEdit(p) {
    setEditing(p);
    setForm({ ...BLANK_PRODUCT, ...p, tags: (p.tags||[]).join(','), old: p.old||'', images: p.images||[], videoUrl: p.videoUrl||'', thumbnail: p.thumbnail||'' });
    setErr('');
  }

  async function save() {
    if (!form.name || !form.price) { setErr('Name and price are required.'); return; }
    setSaving(true); setErr('');
    const payload = {
      ...form,
      price:    Number(form.price),
      old:      form.old ? Number(form.old) : undefined,
      rating:   Number(form.rating) || 4.7,
      tags:     form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      images:   form.images || [],
      thumbnail:form.thumbnail || (form.images?.[0] || ''),
    };
    try {
      if (editing === 'new') await adminCreateProduct(payload);
      else await adminUpdateProduct(editing._id, payload);
      setEditing(null); load();
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to save product');
    }
    setSaving(false);
  }

  async function del(id) {
    if (!confirm('Delete this product?')) return;
    await adminDeleteProduct(id); load();
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.cat?.includes(search.toLowerCase())
  );

  const catLabel = (id) => CAT_OPTIONS.find(c => c.value === id)?.short || id;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h2 style={headStyle}>Products</h2>
          <p style={subStyle}>{products.length} total products in database</p>
        </div>
        <button onClick={openCreate} style={btnAcc}>+ Add Product</button>
      </div>

      <input className="inp" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or category…" style={darkInp} />

      {loading ? <p style={subStyle}>Loading…</p> : (
        <div style={{ overflowX:'auto', marginTop:16 }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,.07)' }}>
                {['','Name','Category','Price','Old Price','Stock','Media',''].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'10px 10px', fontSize:10.5, color:'rgba(255,255,255,.35)', letterSpacing:'.1em', textTransform:'uppercase', fontFamily:'monospace', fontWeight:400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id} style={{ borderBottom:'1px solid rgba(255,255,255,.04)', transition:'.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.03)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}>
                  <td style={{ ...tdStyle, width:52 }}>
                    {p.thumbnail
                      ? <img src={p.thumbnail} alt="" style={{ width:40, height:40, objectFit:'cover', borderRadius:7, border:'1px solid rgba(255,255,255,.1)' }} />
                      : <div style={{ width:40, height:40, borderRadius:7, background:'rgba(255,255,255,.05)', display:'grid', placeItems:'center', fontSize:16 }}>📦</div>
                    }
                  </td>
                  <td style={tdStyle}><span style={{ color:'#fff', fontWeight:500 }}>{p.name}</span></td>
                  <td style={tdStyle}>
                    <span style={{ color:'#00e0c6', fontSize:11, fontFamily:'monospace', background:'rgba(0,224,198,.1)', borderRadius:6, padding:'3px 8px' }}>
                      {catLabel(p.cat)}
                    </span>
                  </td>
                  <td style={tdStyle}>{fmt(p.price)}</td>
                  <td style={tdStyle}>{p.old ? <s style={{ color:'rgba(255,255,255,.3)' }}>{fmt(p.old)}</s> : '—'}</td>
                  <td style={tdStyle}><StatusBadge status={p.stock==='In stock'?'delivered':'pending'} /></td>
                  <td style={tdStyle}>
                    <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                      {(p.images||[]).length > 0 && <span title={`${p.images.length} image(s)`} style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>🖼 {p.images.length}</span>}
                      {p.videoUrl && <span title="Has video" style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>▶</span>}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign:'right' }}>
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      <button onClick={() => openEdit(p)} style={btnEdit}>Edit</button>
                      <button onClick={() => del(p._id)} style={btnDel}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{ ...subStyle, textAlign:'center', padding:'32px 0' }}>No products found.</p>}
        </div>
      )}

      {/* Modal */}
      {editing && (
        <Modal title={editing==='new'?'Add New Product':'Edit Product'} onClose={() => setEditing(null)} wide>
          {/* ── Basic info ── */}
          <SectionHead>Basic Information</SectionHead>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
            <ModalField label="Product Name *" colSpan>
              <input className="inp" style={darkInp} value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Mirage M1 Stencil Printer" />
            </ModalField>
            <ModalField label="Category *">
              <select className="inp" style={darkInp} value={form.cat} onChange={e => setForm(f=>({...f,cat:e.target.value}))}>
                {CAT_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </ModalField>
            <ModalField label="Sub-category">
              <input className="inp" style={darkInp} value={form.sub} onChange={e => setForm(f=>({...f,sub:e.target.value}))} placeholder="e.g. Stencil Printers" />
            </ModalField>
            <ModalField label="Brand">
              <input className="inp" style={darkInp} value={form.brand||''} onChange={e => setForm(f=>({...f,brand:e.target.value}))} placeholder="Brand name" />
            </ModalField>
            <ModalField label="Highlight / Tagline" colSpan>
              <input className="inp" style={darkInp} value={form.highlight||''} onChange={e => setForm(f=>({...f,highlight:e.target.value}))} placeholder="One-line selling point shown on cards" />
            </ModalField>
          </div>

          {/* ── Pricing & stock ── */}
          <SectionHead>Pricing & Stock</SectionHead>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:14, marginBottom:20 }}>
            <ModalField label="Price ($) *">
              <input className="inp" style={darkInp} type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} placeholder="0.00" />
            </ModalField>
            <ModalField label="Original Price ($)">
              <input className="inp" style={darkInp} type="number" min="0" step="0.01" value={form.old} onChange={e => setForm(f=>({...f,old:e.target.value}))} placeholder="Before discount" />
            </ModalField>
            <ModalField label="Stock Status">
              <select className="inp" style={darkInp} value={form.stock||'In stock'} onChange={e => setForm(f=>({...f,stock:e.target.value}))}>
                {['In stock','Low stock','Out of stock','Pre-order'].map(s=><option key={s}>{s}</option>)}
              </select>
            </ModalField>
            <ModalField label="Rating (0–5)">
              <input className="inp" style={darkInp} type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm(f=>({...f,rating:e.target.value}))} />
            </ModalField>
          </div>

          {/* ── Tags & skill ── */}
          <SectionHead>Tags & Skill Level</SectionHead>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
            <ModalField label="Skill Level">
              <select className="inp" style={darkInp} value={form.skill||'All'} onChange={e => setForm(f=>({...f,skill:e.target.value}))}>
                {['All','Beginner','Intermediate','Professional'].map(s=><option key={s}>{s}</option>)}
              </select>
            </ModalField>
            <ModalField label="Tags (comma separated)">
              <input className="inp" style={darkInp} value={form.tags||''} onChange={e => setForm(f=>({...f,tags:e.target.value}))} placeholder="bestseller, new, artist" />
            </ModalField>
          </div>

          {/* ── Product images ── */}
          <SectionHead>Product Images</SectionHead>
          <div style={{ marginBottom:20 }}>
            <p style={{ ...subStyle, marginBottom:12 }}>
              Upload or link product images. The first image becomes the thumbnail shown in cards.
            </p>
            <ImageGalleryEditor
              images={form.images||[]}
              onChange={imgs => setForm(f=>({...f, images:imgs, thumbnail:imgs[0]||f.thumbnail}))}
            />
            {/* Manual thumbnail URL fallback */}
            <div style={{ marginTop:12 }}>
              <ModalField label="Thumbnail URL override (optional)">
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input className="inp" style={darkInp} value={form.thumbnail||''} onChange={e => setForm(f=>({...f,thumbnail:e.target.value}))} placeholder="Leave blank to auto-use first image" />
                  {form.thumbnail && <ImgPreview src={form.thumbnail} size={44} />}
                </div>
              </ModalField>
            </div>
          </div>

          {/* ── Product video ── */}
          <SectionHead>Product Demo Video</SectionHead>
          <div style={{ marginBottom:20 }}>
            <p style={{ ...subStyle, marginBottom:12 }}>
              Add a YouTube link or upload a video file (mp4/webm). Shown on the product detail page.
            </p>
            <VideoField value={form.videoUrl||''} onChange={v => setForm(f=>({...f,videoUrl:v}))} />
          </div>

          {err && <p style={{ color:'#ff8080', fontSize:13, marginTop:4 }}>{err}</p>}
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <button onClick={save} disabled={saving} style={btnAcc}>{saving?'Saving…':editing==='new'?'Create Product':'Save Changes'}</button>
            <button onClick={() => setEditing(null)} style={btnGhost}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

const CAT_ICONS = {
  printers:'🖨', stencil:'📄', inks:'🎨', machines:'⚙', needles:'🪡',
  skinprep:'🧴', numbing:'💊', aftercare:'🛡', enhance:'✨', glide:'🧈', accessories:'🧤',
};

function CategoriesPanel() {
  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // category object
  const [form,    setForm]    = useState({ imageUrl:'', videoUrl:'', bannerText:'', description:'' });
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  useEffect(() => {
    fetchCategories()
      .then(setCats)
      .catch(() => setCats(CATEGORIES))
      .finally(() => setLoading(false));
  }, []);

  function openEdit(cat) {
    setEditing(cat);
    setForm({ imageUrl: cat.imageUrl||'', videoUrl: cat.videoUrl||'', bannerText: cat.bannerText||'', description: cat.description||'' });
    setErr('');
  }

  async function save() {
    setSaving(true); setErr('');
    try {
      await adminUpdateCategoryMedia(editing.id, form);
      // refresh
      const updated = await fetchCategories();
      setCats(updated);
      setEditing(null);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to save. Is the backend running?');
    }
    setSaving(false);
  }

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h2 style={headStyle}>Categories</h2>
        <p style={subStyle}>Add banner images, demo videos, and descriptions for each product category shown on the site.</p>
      </div>

      {loading ? <p style={subStyle}>Loading…</p> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {cats.map(cat => (
            <div key={cat.id} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, overflow:'hidden' }}>
              {/* Image preview */}
              <div style={{ position:'relative', height:140, background:'rgba(255,255,255,.03)', overflow:'hidden' }}>
                {cat.imageUrl
                  ? <img src={cat.imageUrl} alt={cat.label} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : (
                    <div style={{ width:'100%', height:'100%', display:'grid', placeItems:'center', flexDirection:'column', gap:8 }}>
                      <span style={{ fontSize:44 }}>{CAT_ICONS[cat.id] || '📦'}</span>
                      <span style={{ fontSize:10, color:'rgba(255,255,255,.25)', fontFamily:'monospace', letterSpacing:'.1em', textTransform:'uppercase', position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap' }}>
                        No image yet — click Edit
                      </span>
                    </div>
                  )
                }
                {cat.videoUrl && (
                  <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,.6)', borderRadius:6, padding:'3px 8px', fontSize:10, color:'#00e0c6', fontFamily:'monospace' }}>
                    ▶ Video
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                  <div>
                    <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase', color:'#fff', marginBottom:3 }}>
                      {CAT_ICONS[cat.id]} {cat.short}
                    </div>
                    <div style={{ fontSize:11.5, color:'rgba(255,255,255,.4)', marginBottom:6 }}>{cat.label}</div>
                    {cat.description && <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', lineHeight:1.5, marginBottom:6 }}>{cat.description.slice(0,80)}{cat.description.length>80?'…':''}</div>}
                    <div style={{ display:'flex', gap:8 }}>
                      <StatusBadge status={cat.imageUrl ? 'delivered' : 'pending'} />
                    </div>
                  </div>
                  <button onClick={() => openEdit(cat)} style={{ ...btnEdit, flexShrink:0, marginTop:2 }}>Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={`Edit: ${editing.label}`} onClose={() => setEditing(null)} wide>
          <div style={{ display:'flex', gap:16, alignItems:'flex-start', marginBottom:20 }}>
            <div style={{ width:56, height:56, borderRadius:12, background:'rgba(255,255,255,.06)', display:'grid', placeItems:'center', fontSize:28, flexShrink:0 }}>
              {CAT_ICONS[editing.id] || '📦'}
            </div>
            <div>
              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, textTransform:'uppercase', color:'#fff' }}>{editing.short}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,.4)' }}>{editing.label}</div>
            </div>
          </div>

          <SectionHead>Category Banner Image</SectionHead>
          <div style={{ marginBottom:20 }}>
            <p style={{ ...subStyle, marginBottom:10 }}>
              This image is shown as the category tile background and on the category landing page.
            </p>
            <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ flex:1 }}>
                <ModalField label="Image URL">
                  <input className="inp" style={darkInp} value={form.imageUrl} onChange={e=>setForm(f=>({...f,imageUrl:e.target.value}))} placeholder="https://… or /uploads/cat-image.jpg" />
                </ModalField>
              </div>
              {form.imageUrl && <img src={form.imageUrl} alt="" style={{ width:80, height:60, objectFit:'cover', borderRadius:8, border:'1px solid rgba(255,255,255,.1)', flexShrink:0, marginTop:22 }} />}
            </div>
            <UploadBtn accept="image/*" label="Upload Category Image" onUploaded={url => setForm(f=>({...f,imageUrl:url}))} />
          </div>

          <SectionHead>Category Demo Video</SectionHead>
          <div style={{ marginBottom:20 }}>
            <p style={{ ...subStyle, marginBottom:10 }}>
              Shown on the category page. Use a YouTube link or upload a short video (mp4/webm).
            </p>
            <VideoField value={form.videoUrl} onChange={v => setForm(f=>({...f,videoUrl:v}))} />
          </div>

          <SectionHead>Description & Banner Text</SectionHead>
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
            <ModalField label="Short Description">
              <textarea className="inp" style={{ ...darkInp, minHeight:70 }} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief category description shown on the landing page…" />
            </ModalField>
            <ModalField label="Banner Text (optional promo message)">
              <input className="inp" style={darkInp} value={form.bannerText} onChange={e=>setForm(f=>({...f,bannerText:e.target.value}))} placeholder="e.g. New arrivals — Free shipping on all printers" />
            </ModalField>
          </div>

          {err && <p style={{ color:'#ff8080', fontSize:13 }}>{err}</p>}
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <button onClick={save} disabled={saving} style={btnAcc}>{saving?'Saving…':'Save Category'}</button>
            <button onClick={() => setEditing(null)} style={btnGhost}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────

const BLANK_ANN = { text:'', link:'', linkLabel:'', type:'info', active:true, order:0 };

function AnnouncementsPanel() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(BLANK_ANN);
  const [saving,  setSaving]  = useState(false);

  const load = useCallback(() => {
    adminFetchAnnouncements().then(setItems).catch(()=>setItems([])).finally(()=>setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    try {
      if (editing==='new') await adminCreateAnnouncement(form);
      else await adminUpdateAnnouncement(editing._id, form);
      setEditing(null); load();
    } catch { }
    setSaving(false);
  }

  const TYPE_LABELS = { info:'Info', promo:'Promotion', new:'New Product', urgent:'Urgent' };
  const TYPE_COLORS = { info:'#00e0c6', promo:'#f59e0b', new:'#a78bfa', urgent:'#ef4444' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h2 style={headStyle}>Announcements</h2>
          <p style={subStyle}>Manage the sliding bar at the top of every page</p>
        </div>
        <button onClick={() => { setEditing('new'); setForm(BLANK_ANN); }} style={btnAcc}>+ New</button>
      </div>
      {loading ? <p style={subStyle}>Loading…</p> : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {items.length===0 && <p style={{ ...subStyle, textAlign:'center', padding:'32px 0' }}>No announcements yet.</p>}
          {items.map(item => (
            <div key={item._id} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, padding:'16px 18px', display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:TYPE_COLORS[item.type]||'#888', marginTop:5, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ color:'#fff', fontSize:14, marginBottom:4 }}>{item.text}</div>
                <span style={{ fontSize:10.5, color:TYPE_COLORS[item.type], fontFamily:'monospace', letterSpacing:'.08em', textTransform:'uppercase' }}>{TYPE_LABELS[item.type]}</span>
              </div>
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                <button onClick={() => adminUpdateAnnouncement(item._id,{active:!item.active}).then(load)} style={{ ...btnEdit, background:item.active?'rgba(34,197,94,.15)':'none', color:item.active?'#22c55e':'rgba(255,255,255,.4)' }}>{item.active?'Live':'Off'}</button>
                <button onClick={() => { setEditing(item); setForm({...item}); }} style={btnEdit}>Edit</button>
                <button onClick={() => confirm('Delete?') && adminDeleteAnnouncement(item._id).then(load)} style={btnDel}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <Modal title={editing==='new'?'New Announcement':'Edit Announcement'} onClose={() => setEditing(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <ModalField label="Message *"><textarea className="inp" style={{...darkInp,minHeight:76}} value={form.text} onChange={e=>setForm(f=>({...f,text:e.target.value}))} placeholder="Announcement text…" /></ModalField>
            <ModalField label="Type">
              <select className="inp" style={darkInp} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                {Object.entries(TYPE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </ModalField>
            <ModalField label="Link URL (optional)"><input className="inp" style={darkInp} value={form.link||''} onChange={e=>setForm(f=>({...f,link:e.target.value}))} placeholder="/shop or https://…" /></ModalField>
            <ModalField label="Link Button Label"><input className="inp" style={darkInp} value={form.linkLabel||''} onChange={e=>setForm(f=>({...f,linkLabel:e.target.value}))} placeholder="e.g. Shop Now" /></ModalField>
            <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', color:'rgba(255,255,255,.6)', fontSize:13.5 }}>
              <input type="checkbox" checked={!!form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))} />
              Active (show on site)
            </label>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <button onClick={save} disabled={saving} style={btnAcc}>{saving?'Saving…':editing==='new'?'Create':'Save'}</button>
            <button onClick={() => setEditing(null)} style={btnGhost}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading,setLoading]= useState(true);

  useEffect(() => {
    adminFetchOrders().then(setOrders).catch(()=>setOrders([])).finally(()=>setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    await adminUpdateOrderStatus(id, status);
    setOrders(os => os.map(o => o._id===id ? {...o,status} : o));
  }

  return (
    <div>
      <h2 style={headStyle}>Orders</h2>
      <p style={{...subStyle,marginBottom:24}}>{orders.length} orders total</p>
      {loading ? <p style={subStyle}>Loading…</p> : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {orders.length===0 && <p style={{...subStyle,textAlign:'center',padding:'32px 0'}}>No orders yet.</p>}
          {orders.map(o => (
            <div key={o._id} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, padding:'16px 18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                <div>
                  <div style={{ color:'rgba(255,255,255,.35)', fontSize:10, fontFamily:'monospace', letterSpacing:'.1em', marginBottom:4 }}>ORDER #{o._id?.slice(-8).toUpperCase()}</div>
                  <div style={{ color:'#fff', fontWeight:500, marginBottom:2 }}>{o.contact?.name||'Unknown'}</div>
                  <div style={{ color:'rgba(255,255,255,.4)', fontSize:12 }}>{o.contact?.email} · {o.contact?.phone}</div>
                  <div style={{ color:'rgba(255,255,255,.3)', fontSize:11, marginTop:4 }}>{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ textAlign:'right', marginRight:4 }}>
                    <div style={{ color:'#00e0c6', fontFamily:"'Oswald',sans-serif", fontSize:22, fontWeight:700 }}>{fmt(o.total||0)}</div>
                    <div style={{ color:'rgba(255,255,255,.35)', fontSize:11 }}>{(o.items||[]).length} item(s)</div>
                  </div>
                  <StatusBadge status={o.status||'pending'} />
                  <select style={{...darkInp,width:'auto',padding:'6px 10px',fontSize:12}} value={o.status||'pending'} onChange={e=>updateStatus(o._id,e.target.value)}>
                    {['pending','processing','shipped','delivered','cancelled'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────

function BookingsPanel() {
  const [bookings,setBookings]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{ adminFetchBookings().then(setBookings).catch(()=>setBookings([])).finally(()=>setLoading(false)); },[]);

  return (
    <div>
      <h2 style={headStyle}>Demo Bookings</h2>
      <p style={{...subStyle,marginBottom:24}}>{bookings.length} bookings received</p>
      {loading?<p style={subStyle}>Loading…</p>:(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {bookings.length===0&&<p style={{...subStyle,textAlign:'center',padding:'32px 0'}}>No bookings yet.</p>}
          {bookings.map(b=>(
            <div key={b._id} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:'16px 18px'}}>
              <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
                <div>
                  <div style={{color:'#fff',fontWeight:500,marginBottom:2}}>{b.name}</div>
                  <div style={{color:'rgba(255,255,255,.4)',fontSize:12}}>{b.phone} {b.email?`· ${b.email}`:''}</div>
                  <div style={{color:'rgba(255,255,255,.3)',fontSize:11,marginTop:4}}>{b.date} at {b.time} · {b.mode==='studio'?'Studio':'WhatsApp'}</div>
                  {b.product&&<div style={{color:'rgba(0,224,198,.6)',fontSize:11,marginTop:3}}>Product: {b.product}</div>}
                </div>
                <div style={{color:'rgba(255,255,255,.25)',fontSize:11,fontFamily:'monospace'}}>{new Date(b.createdAt).toLocaleDateString()}</div>
              </div>
              {b.message&&<div style={{marginTop:10,paddingTop:10,borderTop:'1px solid rgba(255,255,255,.06)',color:'rgba(255,255,255,.4)',fontSize:13}}>{b.message}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Q&A ──────────────────────────────────────────────────────────────────────

function QAPanel() {
  const [questions,setQuestions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [answers,setAnswers]=useState({});
  const [saving,setSaving]=useState({});
  const [filter,setFilter]=useState('pending');

  useEffect(()=>{ fetchAllQuestions().then(setQuestions).catch(()=>setQuestions([])).finally(()=>setLoading(false)); },[]);

  async function submitAnswer(id,makePublic=true){
    const answer=answers[id];
    if(!answer?.trim())return;
    setSaving(s=>({...s,[id]:true}));
    try{
      const updated=await answerQuestion(id,answer,makePublic);
      setQuestions(qs=>qs.map(q=>q._id===id?updated:q));
      setAnswers(a=>{const n={...a};delete n[id];return n;});
    }catch{}
    setSaving(s=>{const n={...s};delete n[id];return n;});
  }

  const filtered=filter==='all'?questions:questions.filter(q=>q.status===filter);
  const pending=questions.filter(q=>q.status==='pending').length;

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h2 style={headStyle}>Customer Q&amp;A</h2>
          <p style={subStyle}>{questions.length} total · {pending} pending answers</p>
        </div>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[['pending','Pending'],['answered','Answered'],['all','All']].map(([val,lbl])=>(
          <button key={val} onClick={()=>setFilter(val)} style={{...btnGhost,background:filter===val?'rgba(0,224,198,.15)':'none',color:filter===val?'#00e0c6':'rgba(255,255,255,.45)',borderColor:filter===val?'rgba(0,224,198,.3)':'rgba(255,255,255,.1)'}}>
            {lbl}{val==='pending'&&pending>0?` (${pending})`:''}
          </button>
        ))}
      </div>
      {loading?<p style={subStyle}>Loading…</p>:(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {filtered.length===0&&<p style={{...subStyle,textAlign:'center',padding:'32px 0'}}>No {filter} questions.</p>}
          {filtered.map(q=>(
            <div key={q._id} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:'18px'}}>
              <div style={{display:'flex',justifyContent:'space-between',gap:12,marginBottom:10}}>
                <div style={{flex:1}}>
                  <StatusBadge status={q.status||'pending'} />
                  <div style={{color:'#fff',fontWeight:500,fontSize:14,marginTop:8}}>{q.question}</div>
                  <div style={{color:'rgba(255,255,255,.35)',fontSize:11,marginTop:4}}>{q.name} {q.email?`· ${q.email}`:''} · {new Date(q.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={()=>{ if(confirm('Delete?')) deleteQuestion(q._id).then(()=>setQuestions(qs=>qs.filter(x=>x._id!==q._id))); }} style={{...btnDel,flexShrink:0}}>Del</button>
              </div>
              {q.answer&&<div style={{borderLeft:'2px solid #00e0c6',paddingLeft:12,color:'rgba(255,255,255,.5)',fontSize:13,lineHeight:1.7,marginBottom:10}}>{q.answer}</div>}
              <textarea className="inp" style={{...darkInp,minHeight:70,fontSize:13}}
                value={answers[q._id]||(q.status==='answered'?q.answer:'')}
                onChange={e=>setAnswers(a=>({...a,[q._id]:e.target.value}))}
                placeholder={q.status==='answered'?'Edit answer…':'Type answer…'}
              />
              <div style={{display:'flex',gap:8,marginTop:10}}>
                <button onClick={()=>submitAnswer(q._id,true)} disabled={saving[q._id]||!answers[q._id]?.trim()} style={btnAcc}>{saving[q._id]?'Saving…':'Publish'}</button>
                <button onClick={()=>submitAnswer(q._id,false)} disabled={saving[q._id]||!answers[q._id]?.trim()} style={btnGhost}>Private</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

function OverviewPanel() {
  const [stats,setStats]=useState({products:0,orders:0,bookings:0,questions:0});
  useEffect(()=>{
    Promise.allSettled([adminFetchProducts(),adminFetchOrders(),adminFetchBookings(),fetchAllQuestions()])
      .then(([p,o,b,q])=>setStats({
        products:p.value?.length||0, orders:o.value?.length||0,
        bookings:b.value?.length||0, questions:q.value?.filter(x=>x.status==='pending').length||0,
      }));
  },[]);
  return(
    <div>
      <h2 style={headStyle}>Overview</h2>
      <p style={{...subStyle,marginBottom:28}}>Welcome back, Admin.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:32}}>
        <Stat label="Products in DB"       value={stats.products}  sub="Managed via admin" />
        <Stat label="Total Orders"         value={stats.orders}    sub="All time"          color="#f59e0b" />
        <Stat label="Demo Bookings"        value={stats.bookings}  sub="Received"          color="#a78bfa" />
        <Stat label="Pending Questions"    value={stats.questions} sub="Need your reply"   color="#ef4444" />
      </div>
      <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:14,padding:'22px 24px'}}>
        <h3 style={{...headStyle,fontSize:16,marginBottom:12}}>Quick Actions</h3>
        <span style={{fontSize:12,color:'rgba(255,255,255,.4)'}}>Use the sidebar to manage products, categories, announcements, orders, bookings, and customer Q&A.</span>
      </div>
    </div>
  );
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'36px 20px',overflowY:'auto' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(6px)' }} />
      <div style={{ position:'relative',background:'#16161f',border:'1px solid rgba(255,255,255,.1)',borderRadius:18,padding:'28px 28px',width:'100%',maxWidth:wide?760:600,zIndex:1,boxShadow:'0 24px 80px rgba(0,0,0,.6)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
          <h3 style={{ margin:0,color:'#fff',fontFamily:"'Oswald',sans-serif",fontSize:20,letterSpacing:'.04em',textTransform:'uppercase' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,.4)',fontSize:22,lineHeight:1,padding:4 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SectionHead({ children }) {
  return (
    <div style={{ fontSize:10.5, letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(0,224,198,.7)', fontFamily:'monospace', marginBottom:10, paddingBottom:6, borderBottom:'1px solid rgba(0,224,198,.15)', display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ width:20, height:1, background:'rgba(0,224,198,.4)', display:'inline-block' }} />
      {children}
    </div>
  );
}

function ModalField({ label, children, colSpan }) {
  return (
    <div style={ colSpan ? { gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:5 } : { display:'flex',flexDirection:'column',gap:5 } }>
      <label style={{ fontSize:10.5,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.35)',fontFamily:'monospace' }}>{label}</label>
      {children}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const headStyle = { margin:0,color:'#fff',fontFamily:"'Oswald','Arial Narrow',sans-serif",fontSize:24,fontWeight:600,letterSpacing:'.03em',textTransform:'uppercase' };
const subStyle  = { margin:'4px 0 0',color:'rgba(255,255,255,.4)',fontSize:13 };
const tdStyle   = { padding:'12px 10px',color:'rgba(255,255,255,.65)',fontSize:13,verticalAlign:'middle' };
const darkInp   = { background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',color:'#fff',width:'100%' };
const btnAcc    = { padding:'10px 18px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#00e0c6,#00b4d8)',color:'#000',fontFamily:"'Oswald',sans-serif",fontWeight:600,fontSize:12.5,letterSpacing:'.06em',textTransform:'uppercase',cursor:'pointer',whiteSpace:'nowrap' };
const btnGhost  = { padding:'9px 16px',borderRadius:9,border:'1px solid rgba(255,255,255,.15)',background:'none',color:'rgba(255,255,255,.6)',fontFamily:"'Oswald',sans-serif",fontSize:12,letterSpacing:'.06em',textTransform:'uppercase',cursor:'pointer',whiteSpace:'nowrap' };
const btnEdit   = { padding:'5px 12px',borderRadius:7,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.06)',color:'rgba(255,255,255,.6)',cursor:'pointer',fontSize:11.5,fontFamily:'monospace' };
const btnDel    = { padding:'5px 12px',borderRadius:7,border:'1px solid rgba(220,60,60,.2)',background:'rgba(220,60,60,.08)',color:'#ff7070',cursor:'pointer',fontSize:11.5,fontFamily:'monospace' };

// ─── Main dashboard ───────────────────────────────────────────────────────────

const PANELS = { overview:OverviewPanel, products:ProductsPanel, categories:CategoriesPanel, announcements:AnnouncementsPanel, orders:OrdersPanel, bookings:BookingsPanel, qa:QAPanel };

export default function AdminDashboard() {
  const { admin, loading, logout } = useAdmin();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');

  useEffect(() => {
    if (!loading && !admin) navigate('/admin/login');
  }, [admin, loading, navigate]);

  if (loading || !admin) return (
    <div style={{ minHeight:'100vh',display:'grid',placeItems:'center',background:'#0d0d12',color:'rgba(255,255,255,.4)',fontFamily:'monospace',fontSize:12 }}>
      LOADING…
    </div>
  );

  const Panel = PANELS[active] || OverviewPanel;

  return (
    <div style={{ display:'flex',minHeight:'100vh',background:'#0d0d12',color:'#fff',fontFamily:"'Space Grotesk','Inter',sans-serif" }}>
      <Sidebar active={active} setActive={setActive} admin={admin} logout={logout} />
      <main style={{ flex:1,padding:'32px 36px',overflowY:'auto',minHeight:'100vh' }}>
        <Panel />
      </main>
    </div>
  );
}
