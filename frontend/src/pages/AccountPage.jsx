import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { fetchAllQuestions, answerQuestion, deleteQuestion } from '../utils/api';
import { fmt } from '../data/data';
import Icons from '../components/shared/Icons';

const ADMIN_EMAIL = 'ushanviduranga123@gmail.com';

function AdminQAPanel() {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [answers,   setAnswers]   = useState({});
  const [saving,    setSaving]    = useState({});
  const [filter,    setFilter]    = useState('pending');

  useEffect(() => {
    fetchAllQuestions()
      .then(setQuestions)
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, []);

  async function submitAnswer(id, makePublic = true) {
    const answer = answers[id];
    if (!answer?.trim()) return;
    setSaving(s => ({ ...s, [id]: true }));
    try {
      const updated = await answerQuestion(id, answer, makePublic);
      setQuestions(qs => qs.map(q => q._id === id ? updated : q));
      setAnswers(a => { const n = { ...a }; delete n[id]; return n; });
    } catch { /* silent */ }
    setSaving(s => { const n = { ...s }; delete n[id]; return n; });
  }

  async function handleDelete(id) {
    if (!confirm('Delete this question?')) return;
    try {
      await deleteQuestion(id);
      setQuestions(qs => qs.filter(q => q._id !== id));
    } catch { /* silent */ }
  }

  const filtered = filter === 'all' ? questions : questions.filter(q => q.status === filter);
  const pending  = questions.filter(q => q.status === 'pending').length;

  if (loading) return <div className="col ac jc" style={{ padding: 48, gap: 12 }}><span className="text-dim mono" style={{ fontSize: 11 }}>LOADING QUESTIONS…</span></div>;

  return (
    <div>
      <div className="flex jb ac" style={{ marginBottom: 20 }}>
        <h3 className="h3" style={{ fontSize: 18 }}>Q&amp;A Management</h3>
        {pending > 0 && <span className="chip chip-acc" style={{ fontSize: 11 }}>{pending} pending</span>}
      </div>

      <div className="flex gap8" style={{ marginBottom: 20 }}>
        {[['pending','Pending'],['answered','Answered'],['all','All']].map(([val, lbl]) => (
          <button key={val} className={`chip ${filter === val ? 'chip-acc' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setFilter(val)}>{lbl}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card card-pad col ac" style={{ padding: '48px 24px', gap: 10, textAlign: 'center' }}>
          <Icons.check style={{ width: 32, height: 32, color: 'var(--acc)' }} />
          <p className="text-dim">No {filter} questions.</p>
        </div>
      )}

      <div className="col gap16">
        {filtered.map(q => (
          <div key={q._id} className="card card-pad col gap14">
            <div className="flex jb ac gap12">
              <div style={{ flex: 1 }}>
                <div className="flex ac gap10" style={{ marginBottom: 6 }}>
                  <span className={`chip ${q.status === 'pending' ? '' : 'chip-acc'}`} style={{ fontSize: 10, padding: '2px 8px' }}>{q.status}</span>
                  {q.category && <span className="chip" style={{ fontSize: 10, padding: '2px 8px' }}>{q.category}</span>}
                  {q.public && <span className="chip chip-acc" style={{ fontSize: 10, padding: '2px 8px' }}>Public</span>}
                </div>
                <p style={{ fontFamily: 'var(--f-disp)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '.02em', marginBottom: 3 }}>{q.question}</p>
                <p className="text-dim mono" style={{ fontSize: 10.5, letterSpacing: '.08em' }}>
                  {q.name} {q.email ? `· ${q.email}` : ''} · {new Date(q.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => handleDelete(q._id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 6 }} title="Delete">
                <Icons.close style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {q.status === 'answered' && q.answer && (
              <div style={{ borderLeft: '2px solid var(--acc)', paddingLeft: 14 }}>
                <div className="mono text-acc" style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Your Answer</div>
                <p style={{ fontSize: 13.5, color: 'var(--dim)', lineHeight: 1.7 }}>{q.answer}</p>
              </div>
            )}

            <div className="col gap10">
              <textarea
                className="inp"
                value={answers[q._id] || (q.status === 'answered' ? q.answer : '')}
                onChange={e => setAnswers(a => ({ ...a, [q._id]: e.target.value }))}
                placeholder={q.status === 'answered' ? 'Edit answer…' : 'Type your answer…'}
                style={{ minHeight: 80, fontSize: 13.5 }}
              />
              <div className="flex gap10">
                <button
                  className="btn btn-acc btn-sm"
                  onClick={() => submitAnswer(q._id, true)}
                  disabled={saving[q._id] || !answers[q._id]?.trim()}
                >
                  {saving[q._id] ? 'Saving…' : 'Publish Answer'}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => submitAnswer(q._id, false)}
                  disabled={saving[q._id] || !answers[q._id]?.trim()}
                >
                  Answer (Private)
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const s = useStore();
  const navigate = useNavigate();
  const [tab,     setTab]     = useState('profile');
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState(user?.fullName || '');
  const [phone,   setPhone]   = useState(profile?.phone || '');
  const [saving,  setSaving]  = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (user) { setName(user.fullName || ''); setPhone(user.phone || ''); }
  }, [user]);

  async function handleSave() {
    setSaving(true);
    try { await updateProfile({ fullName: name, phone }); setEditing(false); }
    catch { /* handle */ }
    setSaving(false);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const tabs = ['profile', 'orders', 'wishlist', ...(isAdmin ? ['qa'] : [])];
  const tabLabels = { profile: 'Profile', orders: 'Orders', wishlist: 'Wishlist', qa: 'Q&A Admin' };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'calc(var(--nav-h) + 40px)', paddingBottom: 80, background: 'var(--bg)' }}>
      <div className="wrap">

        <div className="flex jb ac" style={{ marginBottom: 36 }}>
          <div>
            <span className="eyebrow no-line">My Account</span>
            <h1 className="h1" style={{ fontSize: 36, marginTop: 8 }}>
              {user?.fullName || user?.email?.split('@')[0] || 'Welcome back'}
            </h1>
            <div className="flex ac gap12">
              <p className="text-dim">{user?.email}</p>
              {isAdmin && <span className="chip chip-acc" style={{ fontSize: 10, letterSpacing: '.08em' }}>ADMIN</span>}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={handleSignOut}>
            <Icons.logout /> Sign Out
          </button>
        </div>

        <div className="flex gap8" style={{ marginBottom: 32, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontFamily: 'var(--f-disp)', textTransform: 'uppercase', fontSize: 13, letterSpacing: '.04em', padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', color: tab === t ? 'var(--acc)' : 'var(--dim)', borderBottom: tab === t ? '2px solid var(--acc)' : '2px solid transparent', transition: '.18s' }}>
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div style={{ maxWidth: 520 }}>
            <div className="card card-pad col gap16">
              <div className="flex jb ac">
                <h3 className="h3" style={{ fontSize: 18 }}>Profile Details</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Edit'}
                </button>
              </div>
              <div className="field">
                <label>Full Name</label>
                {editing ? <input className="inp" value={name} onChange={e => setName(e.target.value)} /> : <p style={{ padding: '13px 0', color: name ? 'var(--text)' : 'var(--faint)' }}>{name || 'Not set'}</p>}
              </div>
              <div className="field">
                <label>Email</label>
                <p style={{ padding: '13px 0', color: 'var(--dim)' }}>{user?.email}</p>
              </div>
              <div className="field">
                <label>Phone / WhatsApp</label>
                {editing ? <input className="inp" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07X XXX XXXX" /> : <p style={{ padding: '13px 0', color: phone ? 'var(--text)' : 'var(--faint)' }}>{phone || 'Not set'}</p>}
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <div className="col ac jc" style={{ padding: '60px 0', textAlign: 'center', gap: 14, color: 'var(--faint)' }}>
              <Icons.truck style={{ width: 44, height: 44 }} />
              <p className="mono" style={{ fontSize: 12, letterSpacing: '.1em' }}>NO ORDERS YET</p>
              <p className="text-dim" style={{ maxWidth: '32ch' }}>Your completed orders will appear here.</p>
              <Link to="/shop" className="btn btn-acc">Browse Equipment</Link>
            </div>
          </div>
        )}

        {tab === 'wishlist' && (
          <div>
            {s.wishlist.length === 0 ? (
              <div className="col ac jc" style={{ padding: '60px 0', textAlign: 'center', gap: 14, color: 'var(--faint)' }}>
                <Icons.heart style={{ width: 44, height: 44 }} />
                <p className="mono" style={{ fontSize: 12, letterSpacing: '.1em' }}>WISHLIST IS EMPTY</p>
                <Link to="/shop" className="btn btn-ghost">Browse Products</Link>
              </div>
            ) : (
              <p className="text-dim">{s.wishlist.length} saved items — visit the <Link to="/shop" style={{ color: 'var(--acc)' }}>shop</Link> to manage them.</p>
            )}
          </div>
        )}

        {tab === 'qa' && isAdmin && <AdminQAPanel />}

      </div>
    </div>
  );
}
