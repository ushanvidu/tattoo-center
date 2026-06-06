import { useStore } from '../../context/StoreContext';
import { waLink, WA_DISPLAY } from '../../data/data';
import Icons from '../shared/Icons';

export default function Footer() {
  const s = useStore();

  const cols = [
    { h: 'Shop',    links: ['Stencil Printers','Tattoo Machines','Needles & Cartridges','Tattoo Inks','Aftercare','All Categories'] },
    { h: 'Tools',   links: ['Stencil Preview Tool','Live Demo Booking','Testing Lab','Demo Videos','Compatibility Guide'] },
    { h: 'Support', links: ['FAQ & Troubleshooting','Shipping & Delivery','Returns & Warranty','Track Order','Contact Us'] },
  ];

  const handleLink = (l) => {
    if (l === 'Stencil Preview Tool') s.navTo('stencil');
    else if (l === 'Live Demo Booking') s.navTo('booking');
    else s.navTo('shop');
  };

  return (
    <footer id="contact" className="grain" style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-1)', position: 'relative', paddingTop: 'clamp(56px,7vw,90px)' }}>
      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="foot-grid">
          <div>
            <div className="logo" style={{ marginBottom: 16 }}>
              <div className="logo-mark"><b>T</b></div>
              <div className="logo-txt">Tattoo Center<small>PRO EQUIPMENT</small></div>
            </div>
            <p className="text-dim" style={{ maxWidth: '34ch', fontSize: 14 }}>
              Professional tattoo equipment tested by working artists before it reaches your studio. Printers, machines, needles, inks &amp; more.
            </p>
            <div className="flex gap12" style={{ marginTop: 20 }}>
              <a className="btn btn-wa btn-sm" href={waLink('Hi Tattoo Center!')} target="_blank" rel="noreferrer">
                <Icons.wa /> {WA_DISPLAY}
              </a>
            </div>
          </div>
          {cols.map(c => (
            <div key={c.h}>
              <h4 className="h3" style={{ fontSize: 15, marginBottom: 16, letterSpacing: '.06em' }}>{c.h}</h4>
              <div className="col gap12">
                {c.links.map(l => (
                  <a key={l} className="text-dim" style={{ fontSize: 14, cursor: 'pointer' }} onClick={() => handleLink(l)}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="tick-rule" style={{ marginBottom: 22 }} />
        <div className="flex jb ac wrap-flex gap16" style={{ paddingBottom: 34 }}>
          <span className="mono text-dim" style={{ fontSize: 12 }}>© 2026 Tattoo Center · Professional Equipment</span>
          <div className="flex gap16 wrap-flex">
            <span className="chip"><Icons.shield /> Secure · Koko &amp; PayHere</span>
            <span className="chip"><Icons.truck /> Island-wide delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
