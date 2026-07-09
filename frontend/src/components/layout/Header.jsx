import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { waLink } from '../../data/data';
import Icons from '../shared/Icons';
import SearchBar from './SearchBar';

const NAV = [
  { to: '/',        label: 'Home' },
  { to: '/shop',    label: 'Shop' },
  { to: '/stencil', label: 'Stencil Tool' },
  { to: '/booking', label: 'Live Demo' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const s        = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [solid, setSolid] = useState(false);
  const [mob,   setMob]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const f = () => setSolid(window.scrollY > 20);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  useEffect(() => { setSearchOpen(false); }, [location.pathname]);

  const close = () => setMob(false);

  return (
    <>
      <header className={`nav ${solid ? 'solid' : ''}`}>
        <div className="nav-inner">

          <Link to="/" className="logo" onClick={close}>
            <img src="/logo.jpeg" alt="Tattoo Center" className="logo-img logo-img-lg" />
          </Link>

          <nav className="nav-menu">
            {NAV.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <button className={`icon-btn ${searchOpen ? 'on' : ''}`} onClick={() => setSearchOpen(v => !v)} aria-label="Search">
              {searchOpen ? <Icons.close /> : <Icons.search />}
            </button>
            <a className="icon-btn hide-mob" href={waLink('Hi Tattoo Center, I have a quick question.')} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <Icons.wa />
            </a>
            <button className="icon-btn" onClick={s.openCart} aria-label="Cart">
              <Icons.cart />
              {s.cartCount > 0 && <span className="cart-count">{s.cartCount}</span>}
            </button>
            {user ? (
              <Link to="/account" className="icon-btn hide-mob" aria-label="Account">
                <Icons.user />
              </Link>
            ) : (
              <button className="btn btn-ghost btn-sm hide-mob" onClick={() => navigate('/login')}>
                Sign In
              </button>
            )}
            <button className="icon-btn burger" onClick={() => setMob(true)} aria-label="Menu">
              <Icons.menu />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-overlay-row">
            <div className="wrap">
              <SearchBar autoFocus onNavigate={() => setSearchOpen(false)} />
            </div>
          </div>
        )}
      </header>

      <div className={`mob-menu ${mob ? 'open' : ''}`}>
        <div className="flex jb ac" style={{ marginBottom: 24 }}>
          <img src="/logo.jpeg" alt="Tattoo Center" className="logo-img logo-img-lg" />
          <button className="icon-btn" onClick={close}><Icons.close /></button>
        </div>
        {NAV.map(({ to, label }) => (
          <Link key={to} to={to} onClick={close}>{label}</Link>
        ))}
        {user ? (
          <Link to="/account" onClick={close}>My Account</Link>
        ) : (
          <Link to="/login" onClick={close}>Sign In / Register</Link>
        )}
      </div>
    </>
  );
}
