import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/data';
import { createBooking } from '../../utils/api';
import Icons from '../shared/Icons';

export default function BookingModal() {
  const s = useStore();
  const open = s.booking.open;
  const [mode,   setMode]   = useState('whatsapp');
  const [done,   setDone]   = useState(false);
  const [date,   setDate]   = useState('');
  const [time,   setTime]   = useState('');
  const [name,   setName]   = useState('');
  const [phone,  setPhone]  = useState('');
  const [product,setProduct]= useState('Any — recommend for me');

  useEffect(() => { if (open) setDone(false); }, [open]);

  const days = [];
  const base = new Date(2026, 5, 8);
  for (let i = 0; i < 8; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i * 2);
    days.push(d);
  }
  const times = ['10:00','11:30','14:00','15:30','17:00'];

  const submit = async () => {
    try {
      await createBooking({ name, phone, mode, date, time, product });
    } catch { /* backend may be offline */ }
    setDone(true);
  };

  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={s.closeBooking} />
      <div className="modal-wrap" style={{ pointerEvents: 'none' }}>
        <div className={`modal ${open ? 'show' : ''}`}>
          <div style={{ padding: '24px 26px', borderBottom: '1px solid var(--line)' }} className="flex jb ac">
            <div>
              <span className="eyebrow no-line">Trust before you buy</span>
              <h3 className="h2" style={{ fontSize: 26, marginTop: 6 }}>See Equipment Live</h3>
            </div>
            <button className="icon-btn" onClick={s.closeBooking}><Icons.close /></button>
          </div>

          {done ? (
            <div className="col ac jc" style={{ padding: '48px 26px', textAlign: 'center', gap: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--acc)', color: 'var(--acc-ink)', display: 'grid', placeItems: 'center' }}>
                <Icons.check style={{ width: 32, height: 32 }} />
              </div>
              <h3 className="h2" style={{ fontSize: 26 }}>Demo Requested</h3>
              <p className="text-dim" style={{ maxWidth: '40ch' }}>
                We'll confirm your {mode === 'whatsapp' ? 'WhatsApp video' : 'studio visit'} demo {date && `for ${date} ${time}`} shortly. Check your WhatsApp for confirmation.
              </p>
              <button className="btn btn-ghost" onClick={s.closeBooking}>Close</button>
            </div>
          ) : (
            <div style={{ padding: '22px 26px 26px' }}>
              <div className="flex gap8" style={{ marginBottom: 20 }}>
                <button className={`btn ${mode === 'whatsapp' ? 'btn-acc' : 'btn-solid'}`} style={{ flex: 1 }} onClick={() => setMode('whatsapp')}>
                  <Icons.wa /> WhatsApp Video Demo
                </button>
                <button className={`btn ${mode === 'studio' ? 'btn-acc' : 'btn-solid'}`} style={{ flex: 1 }} onClick={() => setMode('studio')}>
                  <Icons.pin /> Studio Visit Demo
                </button>
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label>Choose a date</label>
                <div className="flex gap8 wrap-flex">
                  {days.map((d, i) => {
                    const lbl = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
                    const sel = date === lbl;
                    return (
                      <button key={i} className={`chip ${sel ? 'chip-acc' : ''}`} style={{ cursor: 'pointer', padding: '9px 12px' }} onClick={() => setDate(lbl)}>
                        {d.toLocaleDateString('en', { weekday: 'short' })} {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label>Time slot</label>
                <div className="flex gap8 wrap-flex">
                  {times.map(t => (
                    <button key={t} className={`chip ${time === t ? 'chip-acc' : ''}`} style={{ cursor: 'pointer', padding: '9px 12px' }} onClick={() => setTime(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="form-grid-2" style={{ marginBottom: 14 }}>
                <div className="field"><label>Name</label><input className="inp" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="field"><label>Phone / WhatsApp</label><input className="inp" placeholder="07X XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              </div>
              <div className="field" style={{ marginBottom: 14 }}>
                <label>Product of interest</label>
                <select className="inp" value={product} onChange={e => setProduct(e.target.value)}>
                  <option>Any — recommend for me</option>
                  {PRODUCTS.filter(p => ['printers','machines','needles','inks'].includes(p.cat)).map(p => (
                    <option key={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-acc btn-block btn-lg" onClick={submit}>
                <Icons.cal /> Request {mode === 'whatsapp' ? 'Video' : 'Studio'} Demo
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
