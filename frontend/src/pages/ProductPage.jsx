import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, CATEGORIES, fmt, waLink } from '../data/data';
import { fetchProducts } from '../utils/api';
import ProductCard, { ProductMedia } from '../components/shared/ProductCard';
import BeforeAfter from '../components/shared/BeforeAfter';
import Stars from '../components/shared/Stars';
import Reveal from '../components/shared/Reveal';
import Icons from '../components/shared/Icons';

export default function ProductPage() {
  const { id }     = useParams();
  const s          = useStore();
  const navigate   = useNavigate();
  const [products, setProducts] = useState(PRODUCTS);
  const [qty,      setQty]      = useState(1);
  const [imgIdx,   setImgIdx]   = useState(0);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => {});
    setQty(1); setImgIdx(0); window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  const product = products.find(p => p.id === id) || PRODUCTS.find(p => p.id === id);
  if (!product) return (
    <div className="wrap section col ac jc" style={{ gap: 16, textAlign: 'center', paddingTop: 'calc(var(--nav-h) + 60px)' }}>
      <h2 className="h2">Product not found</h2>
      <Link to="/shop" className="btn btn-acc">Back to Shop</Link>
    </div>
  );

  const cat      = CATEGORIES.find(c => c.id === product.cat);
  const related  = products.filter(p => p.cat === product.cat && p.id !== product.id).slice(0, 4);
  const specs    = product.specs || {};
  const hasSpecs = Object.keys(specs).length > 0;
  const isWished = s.wishlist.includes(product.id);

  const images   = [null, null, null]; // placeholders — swap with real image URLs

  const waMsg = `Hi Tattoo Center, I would like to order:\n• ${product.name} — ${fmt(product.price)}\nPlease confirm availability.`;

  return (
    <div style={{ paddingTop: 'var(--nav-h)', background: 'var(--bg)' }}>

      {/* breadcrumb */}
      <div className="wrap" style={{ paddingTop: 20, paddingBottom: 10 }}>
        <div className="flex ac gap8" style={{ fontSize: 12, color: 'var(--faint)', fontFamily: 'var(--f-mono)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
          <Link to="/shop" style={{ color: 'var(--dim)' }}>Shop</Link>
          <span>/</span>
          <Link to={`/shop/${product.cat}`} style={{ color: 'var(--dim)' }}>{cat?.short || product.cat}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text)' }}>{product.name}</span>
        </div>
      </div>

      {/* main layout */}
      <div className="wrap section" style={{ paddingTop: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }} className="product-grid">

          {/* Left: image gallery */}
          <div>
            <div className="ph" style={{ borderRadius: 'var(--r-lg)', aspectRatio: '1/1', border: '1px solid var(--line-2)' }}>
              <span className="ph-label">{product.name}</span>
              <div className="printhead" />
              <div className="morph-host morph" style={{ width: '100%', height: '100%' }}>
                <MorphArtInline cat={product.cat} />
              </div>
            </div>
            <div className="flex gap8" style={{ marginTop: 12 }}>
              {images.map((_, i) => (
                <div key={i} onClick={() => setImgIdx(i)} className="ph" style={{ flex: '0 0 80px', height: 80, borderRadius: 10, border: `1px solid ${imgIdx === i ? 'var(--acc)' : 'var(--line)'}`, cursor: 'pointer' }}>
                  <span className="ph-label" style={{ fontSize: 8, padding: '2px 5px' }}>img {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: product info */}
          <div className="col gap16">
            <div>
              {product.tags?.includes('bestseller') && <span className="chip chip-acc chip-dot" style={{ marginBottom: 10 }}>Bestseller</span>}
              {product.tags?.includes('new')        && <span className="chip" style={{ marginBottom: 10, marginLeft: 6 }}>New Arrival</span>}
              <h1 className="h1" style={{ fontSize: 'clamp(22px,3vw,36px)', marginBottom: 8 }}>{product.name}</h1>
              <div className="flex ac gap10" style={{ marginBottom: 12 }}>
                <Stars rating={product.rating} />
                <span className="text-dim mono" style={{ fontSize: 11.5 }}>{product.rating} · {product.reviews} reviews</span>
              </div>
              <div className="flex ac gap12">
                <span className="price" style={{ fontSize: 34 }}>{fmt(product.price)}</span>
                {product.old && <span style={{ fontFamily: 'var(--f-body)', fontSize: 14, color: 'var(--faint)', textDecoration: 'line-through' }}>{fmt(product.old)}</span>}
              </div>
            </div>

            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '14px 16px', fontSize: 14, color: 'var(--dim)' }}>
              {product.highlight}
            </div>

            {/* stock + skill */}
            <div className="flex gap10 wrap-flex">
              <span className="chip chip-acc chip-dot">{product.stock}</span>
              <span className="chip">{product.skill}</span>
              <span className="chip">{product.brand}</span>
            </div>

            {/* qty + add to cart */}
            <div className="flex gap12 ac">
              <div className="qty" style={{ height: 48 }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}><Icons.minus /></button>
                <span style={{ width: 44, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}><Icons.plus /></button>
              </div>
              <button className="btn btn-acc" style={{ flex: 1, height: 48 }} onClick={() => { s.addToCart(product, qty); }}>
                <Icons.cart /> Add to Cart
              </button>
              <button className={`icon-btn ${isWished ? 'on' : ''}`} style={{ width: 48, height: 48, flexShrink: 0, borderColor: isWished ? 'var(--danger)' : undefined, color: isWished ? 'var(--danger)' : undefined }} onClick={() => s.toggleWish(product.id)}>
                <Icons.heart />
              </button>
            </div>

            <a className="btn btn-wa btn-block" href={waLink(waMsg)} target="_blank" rel="noreferrer">
              <Icons.wa /> Buy via WhatsApp
            </a>
            <button className="btn btn-ghost btn-block" onClick={() => s.openBooking(product)}>
              <Icons.cal /> Book Live Demo for This Product
            </button>

            {/* specs */}
            {hasSpecs && (
              <div>
                <h3 className="h3" style={{ fontSize: 14, marginBottom: 12 }}>Specifications</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  {Object.entries(specs).map(([k, v]) => (
                    <div key={k} style={{ padding: '10px 14px', background: 'var(--card)', fontSize: 13 }}>
                      <span className="text-dim mono" style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Before / After stencil clarity */}
      <div className="wrap section" style={{ paddingTop: 0 }}>
        <Reveal>
          <h2 className="h2" style={{ marginBottom: 24 }}>See the Difference</h2>
          <BeforeAfter />
        </Reveal>
      </div>

      {/* related */}
      {related.length > 0 && (
        <div className="wrap section" style={{ paddingTop: 0 }}>
          <Reveal>
            <h2 className="h2" style={{ marginBottom: 24 }}>Related Products</h2>
            <div className="pgrid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
}

function MorphArtInline({ cat }) {
  const colors = { printers: '#00E0C6', machines: '#7C5CFF', needles: '#00E0C6', inks: '#FF5D5D', stencil: '#00E0C6' };
  const accent = colors[cat] || '#00E0C6';
  return (
    <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .35 }}>
      <defs><radialGradient id="rg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={accent} stopOpacity=".6" /><stop offset="100%" stopColor={accent} stopOpacity="0" /></radialGradient></defs>
      <circle cx="100" cy="100" r="80" fill="url(#rg)" />
      <circle cx="100" cy="100" r="50" fill="none" stroke={accent} strokeWidth=".8" strokeDasharray="4 3" opacity=".5" />
    </svg>
  );
}
