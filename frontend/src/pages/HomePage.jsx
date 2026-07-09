import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, CATEGORIES, FEATURED_CATS, TONE, waLink, fmt } from '../data/data';
import { fetchProducts, fetchCategories } from '../utils/api';
import Reveal from '../components/shared/Reveal';
import Stars from '../components/shared/Stars';
import ProductCard from '../components/shared/ProductCard';
import Icons from '../components/shared/Icons';
import { StencilSection } from './StencilPage';

/* ── Hero showcase: cycles through real product photos instead of a static placeholder ── */
function HeroShowcase({ products }) {
  const shots = products.filter(p => p.thumbnail).slice(0, 6);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (shots.length < 2) return;
    const t = setInterval(() => setI(v => (v + 1) % shots.length), 2800);
    return () => clearInterval(t);
  }, [shots.length]);

  if (!shots.length) {
    return (
      <div className="hero-fallback">
        <img src="/logo.jpeg" alt="Tattoo Center" />
      </div>
    );
  }

  return (
    <div className="hero-showcase">
      {shots.map((p, idx) => (
        <img key={p._id || p.id} src={p.thumbnail} alt={p.name} className={`hero-showcase-img ${idx === i ? 'on' : ''}`} />
      ))}
    </div>
  );
}

/* ── Hero ── */
function Hero({ products }) {
  const s = useStore();
  return (
    <section className="hero grain">
      <div className="hero-bg" />
      <div className="hero-scan" />
      <div className="wrap hero-grid">
        <div>
          <Reveal>
            <div className="flex ac gap16 wrap-flex" style={{ marginBottom: 22 }}>
              <span className="live-tag"><i />Live demos available</span>
              <span className="chip chip-acc chip-dot">Tested by pro artists</span>
            </div>
            <h1 className="h-mega">Print Perfect<br />Stencils in<br /><span className="text-acc">Seconds.</span></h1>
            <p className="lede" style={{ marginTop: 22 }}>
              Premium tattoo equipment for modern artists — stencil printers, machines, needles, inks and transfer supplies, tested in our lab before they reach your studio.
            </p>
            <div className="flex gap12 wrap-flex" style={{ marginTop: 30 }}>
              <Link to="/shop" className="btn btn-acc btn-lg"><Icons.grid /> Shop Equipment</Link>
              <Link to="/stencil" className="btn btn-ghost btn-lg"><Icons.layers /> Try Stencil Preview</Link>
              <button className="btn btn-solid btn-lg" onClick={() => s.openBooking()}><Icons.cal /> Book Live Demo</button>
            </div>
            <div className="flex gap24 wrap-flex" style={{ marginTop: 34 }}>
              {[['8s','Stencil print time'],['2,400+','Artists supplied'],['4.9★','Avg. rating']].map(([n,l]) => (
                <div key={l}>
                  <div className="display" style={{ fontSize: 30 }}>{n}</div>
                  <div className="text-dim mono" style={{ fontSize: 11, letterSpacing: '.12em' }}>{l.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal delay={120} className="hero-stack">
          <div className="hero-vid ph">
            <HeroShowcase products={products} />
            <div className="hero-vid-fade" />
            <div className="printhead" />
            <span className="ph-label">PRINTER › STENCIL › SKIN</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Trust Strip ── */
function TrustStrip() {
  const items = [['bolt','8-second prints'],['shield','Lab-tested gear'],['truck','Island-wide delivery'],['wa','WhatsApp ordering']];
  return (
    <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--bg-1)' }}>
      <div className="wrap trust-strip">
        {items.map(([ic,t]) => (
          <div key={t} className="trust-item flex ac gap12">
            <span style={{ color: 'var(--acc)', flexShrink: 0 }}>{(() => { const Tag = Icons[ic]; return <Tag />; })()}</span>
            <span style={{ fontFamily: 'var(--f-disp)', fontWeight: 600, textTransform: 'uppercase', fontSize: 14, letterSpacing: '.02em' }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Category Grid ── */
function CategoryGrid({ products, categories }) {
  const cats = FEATURED_CATS.map(id => categories.find(c => c.id === id) || CATEGORIES.find(c => c.id === id));
  return (
    <section className="section" style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div className="wrap">
        <Reveal className="section-head flex jb ac wrap-flex" style={{ flexDirection: 'row', gap: 20 }}>
          <div><span className="eyebrow">Quick access</span><h2 className="h1" style={{ marginTop: 14 }}>Shop by Category</h2></div>
          <Link to="/shop" className="btn btn-ghost">All 11 categories <Icons.arrow /></Link>
        </Reveal>
        <div className="cat-grid">
          {cats.map((c, i) => {
            const count = products.filter(p => p.cat === c.id).length;
            return (
              <Reveal key={c.id} delay={i * 60} as={Link} to={`/shop/${c.id}`} className="cat-tile" style={{ textDecoration: 'none', display: 'block' }}>
                {c.imageUrl ? (
                  <>
                    <img src={c.imageUrl} alt={c.short} className="cat-cover-img" />
                    <div className="cat-cover-fade" />
                  </>
                ) : (
                  <div className="ph" style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 100% at 70% 20%, ${TONE[c.id]}, #0a0a0d 75%)` }} />
                )}
                <div className="cat-scan" />
                <div className="cat-body">
                  <div className="flex jb ac">
                    <div className="cat-ico">{(() => { const Tag = Icons[c.icon]; return <Tag />; })()}</div>
                    <Icons.arrowUR style={{ width: 22, height: 22, color: 'var(--faint)' }} />
                  </div>
                  <div>
                    <div className="h3" style={{ fontSize: 21 }}>{c.short}</div>
                    <div className="text-dim mono" style={{ fontSize: 11, letterSpacing: '.1em', marginTop: 6 }}>{count} PRODUCTS · {c.subs.length} TYPES</div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Workflow ── */
function Workflow() {
  const steps = [
    ['upload','Upload Design','Drop your artwork into our preview tool — PNG, JPG or SVG.'],
    ['printer','Print Stencil','Wireless thermal printing gives a crisp transfer in 8 seconds.'],
    ['needle','Apply Tattoo','Smudge-proof lines that hold all session long.'],
  ];
  return (
    <section className="section">
      <div className="wrap">
        <Reveal className="section-head" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span className="eyebrow">The workflow</span>
          <h2 className="h1">From Design to Skin<br />in Seconds</h2>
        </Reveal>
        <Reveal className="steps">
          <div className="step-line" style={{ width: '66%', margin: '0 auto', left: '17%' }}><i /></div>
          {steps.map(([ic, t, d], i) => {
            const Tag = Icons[ic];
            return (
              <div className="step" key={t}>
                <div className="step-num">
                  <Tag />
                  <span style={{ position: 'absolute', top: -6, right: -6, width: 26, height: 26, borderRadius: '50%', background: 'var(--acc)', color: 'var(--acc-ink)', display: 'grid', placeItems: 'center', fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                </div>
                <h3 className="h3">{t}</h3>
                <p className="text-dim" style={{ fontSize: 14, marginTop: 8, maxWidth: '30ch', marginInline: 'auto' }}>{d}</p>
              </div>
            );
          })}
        </Reveal>
        <div className="flex jc" style={{ marginTop: 40 }}>
          <Link to="/stencil" className="btn btn-acc btn-lg"><Icons.play /> Watch Full Demo</Link>
        </div>
      </div>
    </section>
  );
}

/* ── Best Sellers ── */
function BestSellers({ products }) {
  const s = useStore();
  const tagged = products.filter(p => (p.tags || []).length);
  const best = (tagged.length ? tagged : products).slice(0, 8);
  return (
    <section className="section" style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div className="wrap">
        <Reveal className="section-head flex jb ac wrap-flex" style={{ flexDirection: 'row' }}>
          <div><span className="eyebrow">Artist recommended</span><h2 className="h1" style={{ marginTop: 14 }}>Best Sellers</h2></div>
          <Link to="/shop" className="btn btn-ghost">Shop all <Icons.arrow /></Link>
        </Reveal>
      </div>
      <div className="wrap">
        <div className="rail">
          {best.map(p => <ProductCard key={p.id || p._id} product={p} onPreview={s.openPreview} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Testing Lab ── */
function TestingLab() {
  const tests = [
    ['machine','Machine Vibration','Stroke consistency & hum measured on every rotary.','Vibration stability',92],
    ['needle','Needle Precision','Lining grouping checked under magnification.','Lining precision',96],
    ['ink','Ink Spread','Saturation & flow tested on practice skin.','Color saturation',89],
  ];
  return (
    <section className="section">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">Products testing lab</span>
          <h2 className="h1">Tested by Professional<br />Artists Before You Buy</h2>
          <p className="lede">Real scratch-testing, slow-motion machine analysis and ink-spread comparisons — we only stock gear that passes our bench.</p>
        </Reveal>
        <div className="lab-grid">
          {tests.map(([ic, t, d, metric, val], i) => {
            const Tag = Icons[ic];
            return (
              <Reveal key={t} delay={i * 70} className="card">
                <div className="ph ph-video" style={{ aspectRatio: '16/10', position: 'relative' }}>
                  <span className="ph-label">SLOW-MO · {t.toUpperCase()}</span>
                  <div className="play-badge"><i><Icons.play /></i></div>
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--acc)', opacity: .5 }}>
                    <Tag style={{ width: 54, height: 54 }} />
                  </div>
                </div>
                <div className="card-pad">
                  <h3 className="h3">{t}</h3>
                  <p className="text-dim" style={{ fontSize: 13.5, margin: '8px 0 16px' }}>{d}</p>
                  <div className="flex jb" style={{ fontFamily: 'var(--f-mono)', fontSize: 11, marginBottom: 7, color: 'var(--dim)' }}>
                    <span>{metric.toUpperCase()}</span><span className="text-acc">{val}%</span>
                  </div>
                  <div className="meter"><i style={{ width: val + '%' }} /></div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="flex jc" style={{ marginTop: 36 }}>
          <Link to="/shop" className="btn btn-ghost btn-lg">Explore tested equipment <Icons.arrow /></Link>
        </div>
      </div>
    </section>
  );
}

/* ── Live Demo Call ── */
function LiveDemoCall() {
  const s = useStore();
  return (
    <section className="section grain" style={{ background: 'linear-gradient(180deg,var(--bg-1),var(--bg))', borderTop: '1px solid var(--line)', position: 'relative' }}>
      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="ldc-grid">
          <Reveal>
            <span className="eyebrow">Live demo video call</span>
            <h2 className="h1" style={{ margin: '14px 0 16px' }}>See Equipment Live<br />Before You Buy</h2>
            <p className="lede">Jump on a real-time WhatsApp video call and watch our team run the exact machine, needle or printer you're considering — or book a slot to test it in studio.</p>
            <div className="flex gap12 wrap-flex" style={{ marginTop: 26 }}>
              <a className="btn btn-wa btn-lg" href={waLink('Hi Tattoo Center, I want a live WhatsApp video demo.')} target="_blank" rel="noreferrer">
                <Icons.wa /> Start WhatsApp Video Demo
              </a>
              <button className="btn btn-ghost btn-lg" onClick={() => s.openBooking()}><Icons.cal /> Book Studio Demo Slot</button>
            </div>
          </Reveal>
          <Reveal delay={100} className="ph ph-video" style={{ aspectRatio: '4/3', borderRadius: 'var(--r-lg)', border: '1px solid var(--line-2)', position: 'relative' }}>
            <span className="ph-label">● LIVE · WHATSAPP VIDEO</span>
            <div className="play-badge"><i><Icons.play /></i></div>
            <div style={{ position: 'absolute', bottom: 12, right: 12, width: 90, height: 120, borderRadius: 10, border: '1px solid var(--line-2)', background: '#101016', display: 'grid', placeItems: 'center', color: 'var(--faint)' }}>
              <Icons.machine />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Promo Strip ── */
function PromoStrip() {
  const clips = ['Printer demo','Stencil paper demo','Transfer cream demo','Machine scratch test','Needle lining','Ink flow test'];
  const all = [...clips, ...clips];
  return (
    <section className="section" style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div className="wrap">
        <Reveal className="section-head" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span className="eyebrow">Promo reel</span>
          <h2 className="h1">Watch Before You Decide</h2>
        </Reveal>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          {all.map((c, i) => (
            <div className="vstrip ph ph-video" key={i}>
              <span className="ph-label">{c.toUpperCase()}</span>
              <div className="play-badge"><i><Icons.play /></i></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
function Testimonials() {
  const qs = [
    ['Maya R.','Rotary artist','The Volt rotary runs whisper-quiet and the stencils from the M1 printer hold all session. Game changer for my studio.'],
    ['Dilan P.','Studio owner','Being able to do a WhatsApp demo before buying meant zero guesswork. Equipment arrived exactly as shown.'],
    ['Aisha K.','Fine-line artist','The stencil preview tool saves me re-prints — I check darkness and placement before anything touches paper.'],
  ];
  return (
    <section className="section">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">Real customer experience</span>
          <h2 className="h1">Trusted in Studios</h2>
        </Reveal>
        <div className="cat-grid" style={{ gap: 18 }}>
          {qs.map(([n, r, q], i) => (
            <Reveal key={n} delay={i * 70} className="quote">
              <Stars value={5} />
              <p style={{ fontSize: 15.5, margin: '14px 0 20px', lineHeight: 1.55 }}>"{q}"</p>
              <div className="flex ac gap12">
                <div className="avatar">{n[0]}</div>
                <div>
                  <div style={{ fontFamily: 'var(--f-disp)', fontWeight: 600, textTransform: 'uppercase', fontSize: 15 }}>{n}</div>
                  <div className="text-dim mono" style={{ fontSize: 11 }}>{r}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ── */
function FinalCTA() {
  return (
    <section className="section grain" style={{ position: 'relative', background: 'radial-gradient(80% 120% at 50% 0%, rgba(0,224,198,.10), var(--bg) 60%)' }}>
      <div className="wrap" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <h2 className="h-mega" style={{ fontSize: 'clamp(40px,6.5vw,92px)' }}>Equip Your<br /><span className="text-acc">Craft.</span></h2>
          <p className="lede" style={{ marginInline: 'auto', marginTop: 18 }}>Pro-grade tattoo equipment, tested before it ships. Order online, on WhatsApp, or see it live first.</p>
          <div className="flex gap12 jc wrap-flex" style={{ marginTop: 30 }}>
            <Link to="/shop" className="btn btn-acc btn-lg"><Icons.grid /> Shop Equipment</Link>
            <a className="btn btn-wa btn-lg" href={waLink('Hi Tattoo Center!')} target="_blank" rel="noreferrer"><Icons.wa /> Order on WhatsApp</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── HomePage ── */
export default function HomePage() {
  const [products, setProducts] = useState(PRODUCTS);
  const [categories, setCategories] = useState(CATEGORIES);
  useEffect(() => { fetchProducts().then(setProducts).catch(() => {}); }, []);
  useEffect(() => { fetchCategories().then(setCategories).catch(() => {}); }, []);

  return (
    <>
      <Hero products={products} />
      <TrustStrip />
      <CategoryGrid products={products} categories={categories} />
      <Workflow />
      <BestSellers products={products} />
      <TestingLab />
      <StencilSection compact />
      <LiveDemoCall />
      <PromoStrip />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
