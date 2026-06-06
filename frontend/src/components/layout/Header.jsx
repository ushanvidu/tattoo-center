import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { waLink } from '../../data/data';
import Icons from '../shared/Icons';

export default function Header() {
  const s = useStore();
  const [solid, setSolid] = useState(false);
  const [mob,   setMob]   = useState(false);

  useEffect(() => {
    const f = () => setSolid(window.scrollY > 20);
    f();
    window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);

  const go = (where) => { setMob(false); s.navTo(where); };

  const items = [
    { k: 'home',    label: 'Home' },
    { k: 'shop',    label: 'Shop' },
    { k: 'stencil', label: 'Stencil Preview Tool' },
    { k: 'booking', label: 'Live / Virtual Demo' },
    { k: 'contact', label: 'Contact' },
  ];

  return (
    <>
      <header className={`nav ${solid ? 'solid' : ''}`}>
        <div className="nav-inner">
          <div className="logo" onClick={() => go('home')}>
            <div className="logo-mark"><b>T</b></div>
            <div className="logo-txt">Tattoo Center<small>PRO EQUIPMENT</small></div>
          </div>
          <nav className="nav-menu">
            {items.map(it => (
              <a key={it.k} className={`nav-link ${s.route === it.k ? 'active' : ''}`} onClick={() => go(it.k)}>
                {it.label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <a className="icon-btn hide-mob" href={waLink('Hi Tattoo Center, I have a quick question.')} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <Icons.wa />
            </a>
            <button className="icon-btn" onClick={s.openCart} aria-label="Cart">
              <Icons.cart />
              {s.cartCount > 0 && <span className="cart-count">{s.cartCount}</span>}
            </button>
            <button className="icon-btn burger" onClick={() => setMob(true)} aria-label="Menu">
              <Icons.menu />
            </button>
          </div>
        </div>
      </header>

      <div className={`mob-menu ${mob ? 'open' : ''}`}>
        <div className="flex jb ac" style={{ marginBottom: 18 }}>
          <div className="logo">
            <div className="logo-mark"><b>T</b></div>
            <div className="logo-txt">Tattoo Center</div>
          </div>
          <button className="icon-btn" onClick={() => setMob(false)}><Icons.close /></button>
        </div>
        {items.map(it => <a key={it.k} onClick={() => go(it.k)}>{it.label}</a>)}
      </div>
    </>
  );
}
