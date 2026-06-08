import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchAnnouncements } from '../../utils/api';

const DISMISS_KEY = 'tc_bar_dismissed';
const TYPE_COLOR  = {
  promo:  { bg: 'linear-gradient(90deg,#00c48c,#00b4d8)', dot: '#fff' },
  new:    { bg: 'linear-gradient(90deg,#b17ed4,#7c5cbf)', dot: '#ffe' },
  urgent: { bg: 'linear-gradient(90deg,#e05c5c,#c43b3b)', dot: '#fff' },
  info:   { bg: 'linear-gradient(90deg,#1a1a22,#23232f)', dot: '#00e0c6' },
};

const FALLBACK = [
  { _id:'f1', text:'Free island-wide delivery on orders over Rs 5,000', type:'promo', link:'/shop', linkLabel:'Shop Now' },
  { _id:'f2', text:'New: Mirage M1 Stencil Printer — wireless & ultra-fast', type:'new',  link:'/product/p1', linkLabel:'View' },
  { _id:'f3', text:'Book a free live demo — see equipment before you buy', type:'info', link:'/booking', linkLabel:'Book Now' },
];

export default function AnnouncementBar() {
  const [items,     setItems]     = useState([]);
  const [index,     setIndex]     = useState(0);
  const [visible,   setVisible]   = useState(true);
  const [animDir,   setAnimDir]   = useState('up');
  const [animating, setAnimating] = useState(false);
  const timerRef  = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) { setVisible(false); return; }
    fetchAnnouncements().then(d => setItems(d?.length ? d : FALLBACK)).catch(() => setItems(FALLBACK));
  }, []);

  const go = useCallback((dir) => {
    if (animating || items.length <= 1) return;
    setAnimDir(dir > 0 ? 'up' : 'down');
    setAnimating(true);
    setTimeout(() => {
      setIndex(i => (i + dir + items.length) % items.length);
      setAnimating(false);
    }, 280);
  }, [animating, items.length]);

  useEffect(() => {
    if (!visible || items.length <= 1) return;
    timerRef.current = setInterval(() => go(1), 4500);
    return () => clearInterval(timerRef.current);
  }, [visible, items.length, go]);

  if (!visible || items.length === 0) return null;

  const item  = items[index];
  const theme = TYPE_COLOR[item.type] || TYPE_COLOR.info;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  }

  const isExternal = item.link?.startsWith('http');
  const LinkEl = ({ children, className }) => isExternal
    ? <a href={item.link} target="_blank" rel="noreferrer" className={className}>{children}</a>
    : <Link to={item.link || '/'} className={className}>{children}</Link>;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
      background: theme.bg,
      height: 40,
      display: 'flex', alignItems: 'center',
      boxShadow: '0 1px 0 rgba(0,0,0,.18)',
      userSelect: 'none',
    }}>
      {/* left arrow */}
      {items.length > 1 && (
        <button onClick={() => { clearInterval(timerRef.current); go(-1); }} aria-label="Previous"
          style={{ width: 36, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.6)', flexShrink: 0, transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color='#fff'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.6)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      )}

      {/* content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div key={`${index}-${animating}`} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          animation: animating ? `barSlide${animDir} .28s ease forwards` : 'none',
          width: '100%',
        }}>
          {/* type dot */}
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.dot, opacity: .85, flexShrink: 0 }} />

          <span style={{ fontSize: 12.5, color: '#fff', fontFamily: "'Space Grotesk','Inter',sans-serif", fontWeight: 450, letterSpacing: '.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 'min(580px,60vw)' }}>
            {item.text}
          </span>

          {item.link && item.linkLabel && (
            <LinkEl className="ann-cta">
              {item.linkLabel} →
            </LinkEl>
          )}

          {items.length > 1 && (
            <span style={{ display: 'flex', gap: 4, marginLeft: 6 }}>
              {items.map((_, i) => (
                <span key={i} style={{ width: i === index ? 14 : 5, height: 5, borderRadius: 3, background: i === index ? '#fff' : 'rgba(255,255,255,.35)', transition: 'all .3s', cursor: 'pointer' }} onClick={() => setIndex(i)} />
              ))}
            </span>
          )}
        </div>
      </div>

      {/* right arrow */}
      {items.length > 1 && (
        <button onClick={() => { clearInterval(timerRef.current); go(1); }} aria-label="Next"
          style={{ width: 36, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.6)', flexShrink: 0, transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color='#fff'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.6)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      )}

      {/* close */}
      <button onClick={dismiss} aria-label="Dismiss"
        style={{ width: 36, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.5)', flexShrink: 0, transition: 'color .15s' }}
        onMouseEnter={e => e.currentTarget.style.color='#fff'}
        onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.5)'}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
  );
}
