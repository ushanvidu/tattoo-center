import { useState, useEffect } from 'react';
import { fetchPublicQuestions, submitQuestion } from '../utils/api';
import { waLink } from '../data/data';
import Reveal from '../components/shared/Reveal';
import Icons from '../components/shared/Icons';

const TOPICS = [
  'Stencil Printers',
  'Tattoo Machines',
  'Inks & Needles',
  'Orders & Delivery',
  'Returns & Warranty',
  'Other',
];

function QuestionCard({ item }) {
  const [open, setOpen] = useState(false);
  const date = item.answeredAt ? new Date(item.answeredAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  return (
    <div style={{ borderBottom: '1px solid var(--line)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', padding: '18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--f-disp)', textTransform: 'uppercase', fontSize: 13.5, letterSpacing: '.02em', marginBottom: 4 }}>
            {item.question}
          </div>
          <div className="flex ac gap12" style={{ fontSize: 11 }}>
            <span className="text-dim mono" style={{ letterSpacing: '.08em' }}>Asked by {item.name}</span>
            {item.category && <span className="chip" style={{ fontSize: 10, padding: '2px 8px' }}>{item.category}</span>}
          </div>
        </div>
        <Icons.chevD style={{ width: 18, height: 18, flexShrink: 0, color: 'var(--acc)', marginTop: 2, transform: open ? 'rotate(180deg)' : 'none', transition: '.2s' }} />
      </button>
      {open && (
        <div style={{ paddingBottom: 20, paddingLeft: 16, borderLeft: '2px solid var(--acc)' }}>
          <div className="flex ac gap10" style={{ marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--acc)', color: 'var(--acc-ink)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>TC</div>
            <span className="mono text-acc" style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase' }}>Tattoo Center · {date}</span>
          </div>
          <p style={{ color: 'var(--dim)', fontSize: 14, lineHeight: 1.75, margin: 0 }}>{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('All');

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [topic,    setTopic]    = useState(TOPICS[0]);
  const [text,     setText]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [formErr,    setFormErr]    = useState('');

  useEffect(() => {
    fetchPublicQuestions()
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(questions.map(q => q.category).filter(Boolean)))];

  const visible = filter === 'All' ? questions : questions.filter(q => q.category === filter);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) { setFormErr('Please enter your question.'); return; }
    setFormErr('');
    setSubmitting(true);
    try {
      await submitQuestion({ name: name || 'Anonymous', email, category: topic, question: text });
      setSubmitted(true);
      setName(''); setEmail(''); setText(''); setTopic(TOPICS[0]);
    } catch {
      setFormErr('Could not submit. Please try WhatsApp instead.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)' }}>

      <div className="shop-banner">
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow no-line" style={{ marginBottom: 14 }}>Community Q&amp;A</span>
          <h1 className="h1" style={{ marginBottom: 16 }}>Ask Us Anything</h1>
          <p className="lede">Got a question about equipment, stencils, or orders? Ask below — we answer every question personally.</p>
        </div>
      </div>

      <div className="wrap section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48, alignItems: 'start' }}>

          {/* Q&A list */}
          <div>
            <Reveal>
              <div className="flex jb ac" style={{ marginBottom: 24 }}>
                <h2 className="h2" style={{ fontSize: 22 }}>Answered Questions</h2>
                <span className="text-dim mono" style={{ fontSize: 11 }}>{questions.length} answered</span>
              </div>

              {/* category filter */}
              {categories.length > 1 && (
                <div className="flex gap8 wrap-flex" style={{ marginBottom: 20 }}>
                  {categories.map(c => (
                    <button key={c} className={`chip ${filter === c ? 'chip-acc' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter(c)}>{c}</button>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="col ac jc" style={{ padding: '60px 0', gap: 12 }}>
                  <span className="text-dim mono" style={{ fontSize: 11, letterSpacing: '.1em' }}>LOADING…</span>
                </div>
              ) : visible.length === 0 ? (
                <div className="card card-pad col ac" style={{ padding: '48px 24px', gap: 12, textAlign: 'center' }}>
                  <Icons.mail style={{ width: 36, height: 36, color: 'var(--faint)' }} />
                  <p className="text-dim">No answered questions yet. Be the first to ask!</p>
                </div>
              ) : (
                visible.map(q => <QuestionCard key={q._id} item={q} />)
              )}
            </Reveal>
          </div>

          {/* ask a question form */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 20px)' }}>
            <Reveal>
              <div className="card card-pad" style={{ marginBottom: 16 }}>
                {submitted ? (
                  <div className="col ac" style={{ gap: 14, padding: '32px 0', textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--acc)', color: 'var(--acc-ink)', display: 'grid', placeItems: 'center' }}>
                      <Icons.check style={{ width: 28, height: 28 }} />
                    </div>
                    <h3 className="h3" style={{ fontSize: 18 }}>Question Received!</h3>
                    <p className="text-dim" style={{ fontSize: 13.5 }}>We'll answer your question and publish it here. Check back soon — or watch your email if you added one.</p>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSubmitted(false)}>Ask Another</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="col gap14">
                    <h3 className="h3" style={{ fontSize: 17, marginBottom: 4 }}>Ask a Question</h3>
                    <p className="text-dim" style={{ fontSize: 12.5, marginBottom: 4 }}>All questions are answered by our team. Approved answers appear publicly to help other artists.</p>
                    <div className="field">
                      <label>Your Name (optional)</label>
                      <input className="inp" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kasun, or leave blank" />
                    </div>
                    <div className="field">
                      <label>Email (optional)</label>
                      <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="We'll notify you when answered" />
                    </div>
                    <div className="field">
                      <label>Topic</label>
                      <select className="inp" value={topic} onChange={e => setTopic(e.target.value)}>
                        {TOPICS.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Your Question *</label>
                      <textarea className="inp" required value={text} onChange={e => setText(e.target.value)} placeholder="What would you like to know?" style={{ minHeight: 100 }} />
                    </div>
                    {formErr && <p style={{ color: 'var(--danger)', fontSize: 12.5 }}>{formErr}</p>}
                    <button className="btn btn-acc" type="submit" disabled={submitting}>
                      {submitting ? 'Submitting…' : 'Submit Question'}
                    </button>
                  </form>
                )}
              </div>

              <div className="card card-pad flex gap14 ac" style={{ background: 'rgba(0,224,198,.04)', borderColor: 'rgba(0,224,198,.18)' }}>
                <Icons.wa style={{ width: 28, height: 28, color: '#1EBE5D', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontFamily: 'var(--f-disp)', textTransform: 'uppercase', marginBottom: 3 }}>Need a fast answer?</div>
                  <div className="text-dim" style={{ fontSize: 12 }}>WhatsApp us for instant support.</div>
                </div>
                <a href={waLink('Hi Tattoo Center, I have a quick question!')} target="_blank" rel="noreferrer" className="btn btn-wa btn-sm">Chat</a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
