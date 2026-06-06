import { useStore } from '../../context/StoreContext';
import { fmt, waLink, CATEGORIES } from '../../data/data';
import { ProductMedia } from '../shared/ProductCard';
import Stars from '../shared/Stars';
import Icons from '../shared/Icons';

export default function QuickPreview() {
  const s = useStore();
  const p = s.preview;
  const open = !!p;

  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={s.closePreview} />
      <div className="modal-wrap" style={{ pointerEvents: 'none' }}>
        <div className={`modal modal-wide ${open ? 'show' : ''}`}>
          {p && (
            <div className="qp-grid">
              <div style={{ position: 'relative', borderRight: '1px solid var(--line)' }}>
                <ProductMedia product={p} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, background: 'linear-gradient(transparent, rgba(8,8,10,.9))' }}>
                  <span className="chip chip-acc chip-dot">Hover to morph: artwork → stencil → skin</span>
                </div>
              </div>
              <div style={{ padding: '26px 26px 28px', position: 'relative' }}>
                <button className="icon-btn" style={{ position: 'absolute', top: 16, right: 16 }} onClick={s.closePreview}>
                  <Icons.close />
                </button>
                <span className="pcard-cat">{CATEGORIES.find(c => c.id === p.cat)?.label}</span>
                <h3 className="h2" style={{ fontSize: 30, margin: '8px 0 10px' }}>{p.name}</h3>
                <div className="flex ac gap12" style={{ marginBottom: 14 }}>
                  <Stars value={p.rating} n={p.reviews} />
                </div>
                <p className="text-dim" style={{ fontSize: 14.5, marginBottom: 18 }}>
                  {p.highlight}. Tested by professional artists for vibration, flow and transfer quality before it reaches your studio.
                </p>
                <div className="flex ac gap16" style={{ marginBottom: 18 }}>
                  <div className="price" style={{ fontSize: 34 }}>{fmt(p.price)}{p.old && <s>{fmt(p.old)}</s>}</div>
                  <span className="chip chip-acc chip-dot">{p.stock}</span>
                </div>
                {p.specs && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                    {Object.entries(p.specs).map(([k, v]) => (
                      <div key={k} className="card card-pad" style={{ padding: '10px 12px' }}>
                        <div className="pcard-cat">{k}</div>
                        <div style={{ fontFamily: 'var(--f-disp)', fontWeight: 600, fontSize: 15, marginTop: 2 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap8 wrap-flex">
                  <button className="btn btn-acc" style={{ flex: '1 1 auto' }} onClick={() => s.addToCart(p)}>
                    <Icons.cart /> Add to Cart
                  </button>
                  <a className="btn btn-wa" href={waLink(`Hi Tattoo Center, I'd like to order ${p.name} (${fmt(p.price)}).`)} target="_blank" rel="noreferrer">
                    <Icons.wa />
                  </a>
                  <button className="btn btn-ghost" onClick={() => { s.closePreview(); s.openBooking(p); }}>
                    <Icons.cal /> Demo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
