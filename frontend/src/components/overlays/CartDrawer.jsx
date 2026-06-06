import { useStore } from '../../context/StoreContext';
import { fmt, WHATSAPP } from '../../data/data';
import { ProductMedia } from '../shared/ProductCard';
import Icons from '../shared/Icons';

export default function CartDrawer() {
  const s = useStore();

  const waText = () =>
    'Hi Tattoo Center, I would like to order:%0A' +
    s.cart.map(i => `• ${i.name} ×${i.qty} — ${fmt(i.price * i.qty)}`).join('%0A') +
    `%0A%0ATotal: ${fmt(s.cartTotal)}`;

  return (
    <>
      <div className={`scrim ${s.cartOpen ? 'show' : ''}`} onClick={s.closeCart} />
      <aside className={`drawer ${s.cartOpen ? 'show' : ''}`} aria-hidden={!s.cartOpen}>
        <div className="drawer-head">
          <div className="flex ac gap12">
            <Icons.cart />
            <span className="h3" style={{ fontSize: 18 }}>Your Cart</span>
            <span className="chip">{s.cartCount} items</span>
          </div>
          <button className="icon-btn" onClick={s.closeCart}><Icons.close /></button>
        </div>

        <div className="drawer-body">
          {s.cart.length === 0 ? (
            <div className="col ac jc" style={{ height: '100%', textAlign: 'center', gap: 14, color: 'var(--faint)', paddingTop: 60 }}>
              <Icons.cart style={{ width: 40, height: 40 }} />
              <p className="mono" style={{ fontSize: 12, letterSpacing: '.1em' }}>YOUR CART IS EMPTY</p>
              <button className="btn btn-ghost btn-sm" onClick={() => { s.closeCart(); s.navTo('shop'); }}>Browse Equipment</button>
            </div>
          ) : s.cart.map(i => (
            <div className="cline" key={i.id || i._id}>
              <div className="cline-media"><ProductMedia product={i} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex jb gap8">
                  <span className="pcard-name" style={{ fontSize: 14 }}>{i.name}</span>
                  <button onClick={() => s.removeFromCart(i.id || i._id)} style={{ color: 'var(--faint)' }} aria-label="Remove">
                    <Icons.close style={{ width: 16, height: 16 }} />
                  </button>
                </div>
                <div className="pcard-cat" style={{ margin: '4px 0 9px' }}>{i.sub}</div>
                <div className="flex jb ac">
                  <div className="qty">
                    <button onClick={() => s.setQty(i.id || i._id, i.qty - 1)}><Icons.minus /></button>
                    <span>{i.qty}</span>
                    <button onClick={() => s.setQty(i.id || i._id, i.qty + 1)}><Icons.plus /></button>
                  </div>
                  <span className="price" style={{ fontSize: 18 }}>{fmt(i.price * i.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {s.cart.length > 0 && (
          <div className="drawer-foot">
            <div className="flex jb ac" style={{ marginBottom: 6 }}>
              <span className="text-dim mono" style={{ fontSize: 12 }}>SUBTOTAL</span>
              <span className="price">{fmt(s.cartTotal)}</span>
            </div>
            <p className="text-dim" style={{ fontSize: 11.5, marginBottom: 14 }}>
              Shipping &amp; taxes calculated at checkout · Pay with Koko or PayHere
            </p>
            <button className="btn btn-acc btn-block" style={{ marginBottom: 9 }}
              onClick={() => s.toast('Checkout demo — Koko / PayHere connects here')}>
              Checkout · {fmt(s.cartTotal)}
            </button>
            <a className="btn btn-wa btn-block" href={`https://wa.me/${WHATSAPP}?text=${waText()}`} target="_blank" rel="noreferrer">
              <Icons.wa /> Order all via WhatsApp
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
