import { Link } from 'react-router-dom';
import { waLink, WA_DISPLAY } from '../../data/data';
import Icons from '../shared/Icons';

const COLS = [
  {
    h: 'Shop',
    links: [
      { label: 'Stencil Printers',      to: '/shop/printers' },
      { label: 'Tattoo Machines',        to: '/shop/machines' },
      { label: 'Needles & Cartridges',   to: '/shop/needles' },
      { label: 'Tattoo Inks',            to: '/shop/inks' },
      { label: 'Aftercare',              to: '/shop/aftercare' },
      { label: 'All Products',           to: '/shop' },
    ],
  },
  {
    h: 'Tools',
    links: [
      { label: 'Stencil Preview Tool',   to: '/stencil' },
      { label: 'Live Demo Booking',      to: '/booking' },
      { label: 'About Us',               to: '/about' },
      { label: 'Contact Us',             to: '/contact' },
    ],
  },
  {
    h: 'Support',
    links: [
      { label: 'FAQ & Troubleshooting',  to: '/faq' },
      { label: 'Ask a Question',         to: '/faq' },
      { label: 'Returns & Warranty',     to: '/faq' },
      { label: 'Track Order',            to: '/account' },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="grain" style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-1)', position: 'relative', paddingTop: 'clamp(56px,7vw,90px)' }}>
      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="foot-grid">
          <div>
            <Link to="/" className="logo" style={{ marginBottom: 16, display: 'inline-flex' }}>
              <img src="/logo.jpeg" alt="Tattoo Center" className="logo-img" />
              <div className="logo-txt">TATTOO CENTER<small>PRO EQUIPMENT</small></div>
            </Link>
            <p className="text-dim" style={{ maxWidth: '34ch', fontSize: 14, marginTop: 16 }}>
              Professional tattoo equipment tested by working artists before it reaches your studio. Printers, machines, needles, inks &amp; more.
            </p>
            <div className="flex gap12" style={{ marginTop: 20 }}>
              <a className="btn btn-wa btn-sm" href={waLink('Hi Tattoo Center!')} target="_blank" rel="noreferrer">
                <Icons.wa /> {WA_DISPLAY}
              </a>
            </div>
          </div>

          {COLS.map(c => (
            <div key={c.h}>
              <h4 className="h3" style={{ fontSize: 15, marginBottom: 16, letterSpacing: '.06em' }}>{c.h}</h4>
              <div className="col gap12">
                {c.links.map(({ label, to }) => (
                  <Link key={label} to={to} className="text-dim" style={{ fontSize: 14, textDecoration: 'none' }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="tick-rule" style={{ marginBottom: 22 }} />
        <div className="flex jb ac wrap-flex gap16" style={{ paddingBottom: 34 }}>
          <span className="mono text-dim" style={{ fontSize: 12 }}>© 2026 Tattoo Center · Professional Equipment</span>
          <div className="flex gap16 wrap-flex">
            <span className="chip"><Icons.shield /> PayHere · Koko</span>
            <span className="chip"><Icons.truck /> Island-wide delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
