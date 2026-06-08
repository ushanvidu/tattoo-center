import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORIES, PRODUCTS } from '../data/data';
import { fetchProducts } from '../utils/api';
import ProductCard from '../components/shared/ProductCard';
import Reveal from '../components/shared/Reveal';
import Icons from '../components/shared/Icons';

export default function CategoryPage() {
  const { cat }    = useParams();
  const [products, setProducts] = useState([]);
  const [sort,     setSort]     = useState('default');
  const [loading,  setLoading]  = useState(true);

  const category = CATEGORIES.find(c => c.id === cat);

  useEffect(() => {
    setLoading(true);
    fetchProducts({ cat })
      .then(data => { setProducts(data.filter ? data.filter(p => p.cat === cat) : data); })
      .catch(() => { setProducts(PRODUCTS.filter(p => p.cat === cat)); })
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [cat]);

  const sorted = [...products].sort((a, b) => {
    if (sort === 'low')    return a.price - b.price;
    if (sort === 'high')   return b.price - a.price;
    if (sort === 'rating') return b.rating - a.rating;
    return (b.tags?.length || 0) - (a.tags?.length || 0);
  });

  const benefits = {
    printers:    ['Wireless Printing', 'Smudge-proof Output', 'Fast 8-second Print', 'Portable Design'],
    machines:    ['Professional Grade', 'Whisper-quiet Motor', 'Long Battery Life', 'Precision Control'],
    needles:     ['Membrane Safety', 'Ultra-sharp Taper', 'Consistent Grouping', 'Sterile Packaging'],
    inks:        ['Vegan Formula', 'High Saturation', 'Heals True to Color', 'REACH Compliant'],
    stencil:     ['4-Layer Carbon', 'Long Open-time', 'Crisp Transfer', 'Easy Clean-up'],
    accessories: ['Pro Quality', 'Powder-free', 'Mixed Sizes', 'Cross-contamination Protection'],
  };
  const bens = benefits[cat] || ['Professional Grade', 'Artist Tested', 'Fast Delivery', 'Quality Guaranteed'];

  return (
    <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)' }}>

      {/* banner */}
      <div className="shop-banner">
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex ac gap8" style={{ marginBottom: 12, fontSize: 11, fontFamily: 'var(--f-mono)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--faint)' }}>
            <Link to="/shop" style={{ color: 'var(--dim)' }}>Shop</Link>
            <span>/</span>
            <span style={{ color: 'var(--text)' }}>{category?.short || cat}</span>
          </div>
          <h1 className="h1" style={{ marginBottom: 16 }}>{category?.label || cat}</h1>
          <p className="lede">{category?.subs?.join(' · ')}</p>

          <div className="flex gap8 wrap-flex" style={{ marginTop: 28 }}>
            {bens.map((b, i) => (
              <span key={i} className="chip chip-accent" style={{ padding: '7px 13px' }}>
                <Icons.check style={{ width: 12, height: 12, color: 'var(--acc)', marginRight: 5 }} />{b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* product grid */}
      <div className="wrap section">
        <div className="sortbar">
          <span className="text-dim mono" style={{ fontSize: 12 }}>{sorted.length} PRODUCTS</span>
          <select className="inp" value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto', padding: '8px 12px' }}>
            <option value="default">Featured</option>
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {loading ? (
          <div className="pgrid">{[...Array(6)].map((_, i) => <div key={i} className="card" style={{ height: 340, background: 'var(--card-2)', animation: 'shimmer 1.4s infinite', opacity: .6 }} />)}</div>
        ) : sorted.length === 0 ? (
          <div className="col ac jc" style={{ padding: '80px 0', gap: 14, textAlign: 'center', color: 'var(--faint)' }}>
            <Icons.search style={{ width: 44, height: 44 }} />
            <p>No products in this category yet.</p>
            <Link to="/shop" className="btn btn-ghost">Browse All Products</Link>
          </div>
        ) : (
          <div className="pgrid">
            {sorted.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      {/* CTA */}
      <Reveal>
        <div className="wrap" style={{ paddingBottom: 80 }}>
          <div className="card card-pad" style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--card) 0%, rgba(0,224,198,.06) 100%)', padding: '48px 24px' }}>
            <h2 className="h2" style={{ marginBottom: 12 }}>Not sure which to pick?</h2>
            <p className="lede" style={{ margin: '0 auto 28px' }}>Book a live demo and see the equipment in action before you buy.</p>
            <div className="flex ac jc gap12 wrap-flex">
              <Link to="/booking" className="btn btn-acc btn-lg"><Icons.cal /> Book Live Demo</Link>
              <Link to="/stencil" className="btn btn-ghost btn-lg"><Icons.layers /> Try Stencil Tool</Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
