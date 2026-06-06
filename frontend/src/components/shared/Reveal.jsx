import { useRef, useState, useEffect } from 'react';

export default function Reveal({ children, as: El = 'div', delay = 0, className = '', style, ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen) return;
    const el = ref.current;
    if (!el) return;
    let done = false;
    const reveal = () => { if (!done) { done = true; setSeen(true); } };
    let io;
    try {
      io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { reveal(); io.disconnect(); } }), { threshold: .08 });
      io.observe(el);
    } catch { reveal(); }
    const t = setTimeout(reveal, 700);
    return () => { io?.disconnect(); clearTimeout(t); };
  }, [seen]);

  return (
    <El
      ref={ref}
      className={`reveal ${seen ? 'in' : ''} ${className}`}
      style={{ transitionDelay: delay + 'ms', ...style }}
      {...rest}
    >
      {children}
    </El>
  );
}
