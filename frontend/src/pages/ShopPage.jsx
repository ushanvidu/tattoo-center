import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS, CATEGORIES, BRANDS, fmt } from '../data/data';
import ProductCard from '../components/shared/ProductCard';
import Icons from '../components/shared/Icons';

function FOpt({ on, onClick, label, count }) {
  return (
    <div className={`fopt ${on ? 'on' : ''}`} onClick={onClick}>
      <span className="cbox"><Icons.check /></span>
      <span>{label}</span>
      {count != null && <span className="cnt">{count}</span>}
    </div>
  );
}

export default function ShopPage() {
  const s = useStore();
  const init = s.routeParams?.cat ? [s.routeParams.cat] : [];

  const [cats,    setCats]    = useState(init);
  const [brands,  setBrands]  = useState([]);
  const [skill,   setSkill]   = useState([]);
  const [inStock, setInStock] = useState(false);
  const [maxPrice,setMaxPrice]= useState(300);
  const [sort,    setSort]    = useState('featured');
  const [openF,   setOpenF]   = useState(false);

  useEffect(() => { if (s.routeParams?.cat) setCats([s.routeParams.cat]); }, [s.routeParams?.cat]);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const filtered = useMemo(() => {
    let r = PRODUCTS.filter(p =>
      (cats.length   ? cats.includes(p.cat)     : true) &&
      (brands.length ? brands.includes(p.brand) : true) &&
      (skill.length  ? skill.includes(p.skill)  : true) &&
      (inStock ? p.stock === 'In stock' : true) &&
      p.price <= maxPrice
    );
    if (sort === 'low')    r = [...r].sort((a,b) => a.price - b.price);
    else if (sort === 'high')   r = [...r].sort((a,b) => b.price - a.price);
    else if (sort === 'rating') r = [...r].sort((a,b) => b.rating - a.rating);
    else r = [...r].sort((a,b) => (b.tags?.length||0) - (a.tags?.length||0));
    return r;
  }, [cats, brands, skill, inStock, maxPrice, sort]);

  const catCount = (id) => PRODUCTS.filter(p => p.cat === id).length;
  const reset = () => { setCats([]); setBrands([]); setSkill([]); setInStock(false); setMaxPrice(300); };

  const newArrivals = PRODUCTS.filter(p => (p.tags||[]).includes('new')).concat(PRODUCTS.slice(0,4)).slice(0,6);

  return (
    <>
      <section className="shop-banner">
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow">The store</span>
          <h1 className="h1" style={{ margin: '14px 0 14px', maxWidth: '18ch' }}>Professional Tattoo Equipment for Modern Artists</h1>
          <p className="lede">Stencil printers, tattoo machines, needles, inks, stencil papers and transfer cream — tested by professionals.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 'clamp(34px,4vw,50px)' }}>
        <div className="wrap shop-layout">
          {/* FILTERS */}
          <aside className={`filters ${openF ? '' : 'collapsed'}`}>
            <div className="flex jb ac" style={{ marginBottom: 16 }}>
              <span className="eyebrow no-line">Filters</span>
              <button className="text-acc mono" style={{ fontSize: 11, letterSpacing: '.1em', cursor: 'pointer' }} onClick={reset}>RESET</button>
            </div>

            <div className="fgroup">
              <h4>Category</h4>
              {CATEGORIES.map(c => <FOpt key={c.id} on={cats.includes(c.id)} onClick={() => toggle(cats, setCats, c.id)} label={c.short} count={catCount(c.id)} />)}
            </div>

            <div className="fgroup">
              <h4>Price range <span className="mono text-acc" style={{ fontSize: 12 }}>≤ {fmt(maxPrice)}</span></h4>
              <input type="range" min="9" max="300" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} style={{ width: '100%' }} />
              <div className="flex jb mono text-dim" style={{ fontSize: 11, marginTop: 8 }}><span>$9</span><span>$300</span></div>
            </div>

            <div className="fgroup">
              <h4>Skill level</h4>
              {['Beginner','Professional','All'].map(k => <FOpt key={k} on={skill.includes(k)} onClick={() => toggle(skill, setSkill, k)} label={k} />)}
            </div>

            <div className="fgroup">
              <h4>Brand</h4>
              {BRANDS.map(b => <FOpt key={b} on={brands.includes(b)} onClick={() => toggle(brands, setBrands, b)} label={b} />)}
            </div>

            <div className="fgroup">
              <h4>Availability</h4>
              <FOpt on={inStock} onClick={() => setInStock(v => !v)} label="In stock only" />
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div>
            <div className="sortbar">
              <div className="flex ac gap12">
                <button className="btn btn-solid btn-sm mob-filter-btn" onClick={() => setOpenF(v => !v)}><Icons.filter /> Filters</button>
                <span className="text-dim mono" style={{ fontSize: 12 }}>{filtered.length} PRODUCTS</span>
              </div>
              <div className="flex ac gap8">
                <span className="text-dim mono hide-mob" style={{ fontSize: 11, letterSpacing: '.12em' }}>SORT</span>
                <select className="inp" style={{ width: 'auto', padding: '10px 14px' }} value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {cats.length > 0 && (
              <div className="flex gap8 wrap-flex" style={{ marginBottom: 18 }}>
                {cats.map(id => (
                  <span key={id} className="chip chip-acc" style={{ cursor: 'pointer' }} onClick={() => toggle(cats, setCats, id)}>
                    {CATEGORIES.find(c => c.id === id)?.short} <Icons.close style={{ width: 13, height: 13 }} />
                  </span>
                ))}
              </div>
            )}

            {filtered.length ? (
              <div className="pgrid">
                {filtered.map(p => <ProductCard key={p.id} product={p} onPreview={s.openPreview} />)}
              </div>
            ) : (
              <div className="card card-pad" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--faint)' }}>
                <Icons.search style={{ width: 36, height: 36, margin: '0 auto 14px' }} />
                <p className="mono" style={{ letterSpacing: '.1em', fontSize: 12 }}>NO PRODUCTS MATCH YOUR FILTERS</p>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={reset}>Clear filters</button>
              </div>
            )}

            <div style={{ marginTop: 60 }}>
              <div className="flex jb ac" style={{ marginBottom: 18 }}><h3 className="h2" style={{ fontSize: 24 }}>New Arrivals</h3></div>
              <div className="rail">
                {newArrivals.map(p => <ProductCard key={'n' + p.id} product={p} onPreview={s.openPreview} />)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
