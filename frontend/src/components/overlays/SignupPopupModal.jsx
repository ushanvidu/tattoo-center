import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import Icons from '../shared/Icons';

const SEEN_KEY = 'tc_signup_popup_seen';
const SHOW_DELAY_MS = 3000;

export default function SignupPopupModal() {
  const s = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const open = s.signupPopup;

  // First-visit trigger: signed-out visitor, hasn't dismissed/signed up before.
  useEffect(() => {
    if (user) return;
    if (localStorage.getItem(SEEN_KEY)) return;
    const t = setTimeout(() => s.openSignupPopup(), SHOW_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const dismiss = () => {
    localStorage.setItem(SEEN_KEY, '1');
    s.closeSignupPopup();
  };

  const goSignUp = () => {
    localStorage.setItem(SEEN_KEY, '1');
    s.closeSignupPopup();
    navigate('/login#register');
  };

  if (user) return null;

  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={dismiss} />
      <div className="modal-wrap" style={{ pointerEvents: 'none' }}>
        <div className={`modal ${open ? 'show' : ''}`} style={{ maxWidth: 440 }}>
          <button className="icon-btn" onClick={dismiss} style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
            <Icons.close />
          </button>
          <div style={{ textAlign: 'center', padding: '44px 32px 36px' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#00e0c6,#00b4d8)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', color: '#042522' }}>
              <Icons.sparkle style={{ width: 28, height: 28 }} />
            </div>
            <span className="eyebrow no-line" style={{ justifyContent: 'center', marginBottom: 10 }}>New here?</span>
            <h3 className="h2" style={{ fontSize: 26, marginBottom: 12 }}>Get 10% Off Your First Order</h3>
            <p className="text-dim" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              Sign up in seconds and we'll apply a one-time 10% discount automatically at checkout.
            </p>
            <button className="btn btn-acc btn-lg btn-block" onClick={goSignUp}>
              <Icons.user /> Sign Up &amp; Claim 10% Off
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 12, fontSize: 13 }} onClick={dismiss}>
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
