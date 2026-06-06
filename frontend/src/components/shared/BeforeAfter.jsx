import { useState, useRef } from 'react';
import Icons from './Icons';

export default function BeforeAfter({ before, after, beforeLabel = 'Before', afterLabel = 'After', style }) {
  const [x, setX] = useState(50);
  const ref  = useRef(null);
  const drag = useRef(false);

  const move = (clientX) => {
    const r = ref.current.getBoundingClientRect();
    const p = ((clientX - r.left) / r.width) * 100;
    setX(Math.max(0, Math.min(100, p)));
  };

  return (
    <div className="ba" ref={ref} style={style}
      onMouseDown={e  => { drag.current = true; move(e.clientX); }}
      onMouseMove={e  => { if (drag.current) move(e.clientX); }}
      onMouseUp={() => drag.current = false}
      onMouseLeave={() => drag.current = false}
      onTouchStart={e => move(e.touches[0].clientX)}
      onTouchMove={e  => move(e.touches[0].clientX)}
    >
      <div className="ba-layer">{before}</div>
      <div className="ba-layer ba-after" style={{ '--x': x + '%' }}>{after}</div>
      <div className="ba-tag" style={{ left: 12 }}>{beforeLabel}</div>
      <div className="ba-tag" style={{ right: 12 }}>{afterLabel}</div>
      <div className="ba-handle" style={{ '--x': x + '%' }} />
      <div className="ba-knob"   style={{ '--x': x + '%' }}><Icons.compare /></div>
    </div>
  );
}
