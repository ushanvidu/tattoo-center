import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { waLink, WA_DISPLAY } from '../../data/data';
import Icons from '../shared/Icons';

export default function WhatsAppFAB() {
  const s = useStore();
  const [open, setOpen] = useState(false);

  const rows = [
    { ic: <Icons.search />, t: 'Quick product inquiry', d: 'Ask about specs & stock', text: 'Hi Tattoo Center, I have a question about a product.' },
    { ic: <Icons.cart />,   t: 'Quick order',           d: 'Order via WhatsApp',     text: 'Hi Tattoo Center, I would like to place a quick order.' },
    { ic: <Icons.cal />,    t: 'Request a live demo',   d: 'See equipment before buying', text: 'Hi Tattoo Center, I would like to book a live demo.' },
  ];

  return (
    <div className="fab">
      <div className={`fab-pop ${open ? 'open' : ''}`}>
        <div className="fab-pop-head">
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', color: '#1EBE5D' }}>
            <Icons.wa />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--f-disp)', fontWeight: 600, textTransform: 'uppercase', fontSize: 15, color: '#fff' }}>Quick Order</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.85)' }}>Typically replies in minutes</div>
          </div>
        </div>
        {rows.map((r, i) => (
          <a key={i} className="fab-row" href={waLink(r.text)} target="_blank" rel="noreferrer">
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--card-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--acc)' }}>
              {r.ic}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--f-disp)', fontWeight: 600, fontSize: 14, textTransform: 'uppercase' }}>{r.t}</div>
              <div className="text-dim" style={{ fontSize: 11.5 }}>{r.d}</div>
            </div>
          </a>
        ))}
        <div style={{ padding: '11px 15px' }} className="text-dim mono">{WA_DISPLAY}</div>
      </div>
      <button className="fab-btn" onClick={() => setOpen(o => !o)} aria-label="WhatsApp quick order">
        {open ? <Icons.close /> : <Icons.wa />}
      </button>
    </div>
  );
}
