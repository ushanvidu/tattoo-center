import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { fmt, waLink } from '../../data/data';
import { TONE } from '../../data/data';
import Icons from './Icons';
import Stars from './Stars';
import MorphArt from './MorphArt';

function ProductMedia({ product, style }) {
  const seed = parseInt((product._id || product.id || '').replace(/\D/g, '')) || 0;
  const tone = TONE[product.cat] || '#1a1a21';
  return (
    <div className="morph-host" style={{ position: 'relative', ...style }}>
      <MorphArt seed={seed} tone={tone} />
    </div>
  );
}

export { ProductMedia };

export default function ProductCard({ product, onPreview }) {
  const s = useStore();
  const fav = s.wishlist.includes(product.id || product._id);
  const id  = product.id || product._id;

  const tagEl = (t) =>
    t === 'bestseller' ? <span key={t} className="tag tag-best">Best Seller</span> :
    t === 'new'        ? <span key={t} className="tag tag-new">New</span> :
    t === 'artist'     ? <span key={t} className="tag tag-artist">Artist Pick</span> : null;

  return (
    <div className="pcard">
      <div className="pcard-media">
        <div className="pcard-tags">{(product.tags || []).map(tagEl)}</div>
        <button
          className={`pcard-fav ${fav ? 'on' : ''}`}
          onClick={e => { e.stopPropagation(); s.toggleWish(id); }}
          aria-label="Save"
        >
          <Icons.heart />
        </button>
        <Link to={`/product/${id}`} style={{ display: 'block' }}>
          <ProductMedia product={product} />
        </Link>
        <div className="pcard-quick">
          <button className="btn btn-solid btn-sm" style={{ flex: 1 }}
            onClick={e => { e.stopPropagation(); onPreview && onPreview(product); }}>
            <Icons.eye /> Quick View
          </button>
        </div>
      </div>
      <div className="pcard-body">
        <div className="flex ac jb">
          <span className="pcard-cat">{product.sub}</span>
          <Stars value={product.rating} />
        </div>
        <Link to={`/product/${id}`} className="pcard-name" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          {product.name}
        </Link>
        <div className="pcard-hl">{product.highlight}</div>
        <div className="pcard-foot">
          <div className="price">
            {fmt(product.price)}
            {product.old && <s>{fmt(product.old)}</s>}
          </div>
          <div className="pcard-btns">
            <a
              className="mini-btn wa"
              href={waLink(`Hi Tattoo Center, I'd like to order: ${product.name} (${fmt(product.price)}).`)}
              target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              aria-label="Order on WhatsApp"
            >
              <Icons.wa />
            </a>
            <button className="mini-btn add" onClick={e => { e.stopPropagation(); s.addToCart(product); }} aria-label="Add to cart">
              <Icons.plus />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
