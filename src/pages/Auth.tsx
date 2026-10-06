import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { CatMark } from '../components/Logo';

function GoogleIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.06 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h6.2a5.3 5.3 0 0 1-2.3 3.48v2.88h3.72c2.18-2 3.44-4.96 3.44-8.37Z" />
      <path fill="#34A853" d="M12 24c3.1 0 5.7-1.03 7.6-2.78l-3.72-2.88c-1.03.7-2.35 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.76v2.97A11.99 11.99 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.6 14.72a7.18 7.18 0 0 1 0-4.44V7.31H1.76a12 12 0 0 0 0 10.38l3.84-2.97Z" />
      <path fill="#EA4335" d="M12 4.76c1.68 0 3.2.58 4.4 1.72l3.3-3.3C17.7 1.2 15.1 0 12 0 7.32 0 3.26 2.69 1.76 6.62l3.84 2.97C6.5 6.77 9.02 4.76 12 4.76Z" />
    </svg>
  );
}

type Mode = 'signin' | 'signup' | 'forgot';

export default function Auth() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const isSignUp = mode === 'signup';
  const isForgot = mode === 'forgot';

  function switchMode(next: Mode) { setMode(next); setError(''); setInfo(''); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    if (isForgot) {
      const { error } = await resetPassword(email);
      if (error) setError(error);
      else setInfo("If an account exists for that email, we've sent a reset link.");
    } else if (isSignUp) {
      const { error, needsConfirmation } = await signUp(email, password, displayName);
      if (error) setError(error);
      else if (needsConfirmation) { setInfo('Check your email for a confirmation link, then sign in.'); setMode('signin'); }
      else navigate('/profile');
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate('/profile');
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setError(''); setInfo(''); setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) { setError(error); setGoogleLoading(false); }
  }

  const heading = isForgot ? 'Reset password' : isSignUp ? 'Create account' : 'Welcome back';
  const subtitle = isForgot
    ? "Enter your email and we'll send a reset link."
    : isSignUp ? 'Join the AP student community.' : 'Sign in to track your progress.';

  const fieldLabel = { fontSize: 11, fontFamily: 'var(--ah-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: 'var(--ah-muted)', marginBottom: 8, display: 'block' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: '32px 20px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--ah-mono)', fontSize: 12, color: 'var(--ah-muted)', textDecoration: 'none', marginBottom: 28, transition: 'color 0.15s' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        <div className="dk-card" style={{ padding: '32px' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <CatMark className="w-9 h-9" />
            <div>
              <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 16, fontWeight: 700, color: 'var(--ah-text)' }}>Prepd</div>
              <div style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'var(--ah-muted)', letterSpacing: '0.04em' }}>AP STUDY PLATFORM</div>
            </div>
          </div>

          <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ah-text)', marginBottom: 6 }}>{heading}</h2>
          <p style={{ fontSize: 13, color: 'var(--ah-muted)', marginBottom: 22, lineHeight: 1.55 }}>{subtitle}</p>

          {error && <div className="dk-alert dk-alert-red" style={{ marginBottom: 16 }}><span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span> {error}</div>}
          {info  && <div className="dk-alert dk-alert-green" style={{ marginBottom: 16 }}><span style={{ flexShrink: 0, marginTop: 1 }}>✓</span> {info}</div>}

          {!isForgot && (
            <>
              <button type="button" onClick={handleGoogle} disabled={googleLoading || loading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', color: 'var(--ah-text)', fontFamily: 'var(--ah-mono)', fontSize: 12.5, cursor: 'pointer', transition: 'all 0.15s', opacity: (googleLoading || loading) ? 0.5 : 1, marginBottom: 16 }}>
                {googleLoading ? <div className="dk-spin" style={{ width: 18, height: 18 }} /> : <GoogleIcon className="w-4 h-4" />}
                Continue with Google
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className="dk-sep" />
                <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or email</span>
                <div className="dk-sep" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {isSignUp && (
              <div>
                <label style={fieldLabel}>Display name</label>
                <div className="dk-input-icon">
                  <User className="w-4 h-4" />
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name" required className="dk-input" style={{ paddingLeft: 40 }} />
                </div>
              </div>
            )}
            <div>
              <label style={fieldLabel}>Email</label>
              <div className="dk-input-icon">
                <Mail className="w-4 h-4" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@school.edu" required className="dk-input" style={{ paddingLeft: 40 }} />
              </div>
            </div>
            {!isForgot && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ ...fieldLabel, marginBottom: 0 }}>Password</label>
                  {!isSignUp && (
                    <button type="button" onClick={() => switchMode('forgot')} style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'var(--ah-muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      Forgot?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <div className="dk-input-icon">
                    <Lock className="w-4 h-4" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters" required minLength={6} className="dk-input" style={{ paddingLeft: 40, paddingRight: 44 }} />
                  </div>
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ah-muted)' }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} className="dk-btn dk-btn-primary" style={{ width: '100%', marginTop: 4 }}>
              {loading ? <div className="dk-spin" style={{ width: 18, height: 18, borderTopColor: '#0a0f1e' }} /> : (isForgot ? 'Send reset link' : isSignUp ? 'Create account' : 'Sign in')}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            {isForgot ? (
              <button onClick={() => switchMode('signin')} style={{ fontFamily: 'var(--ah-mono)', fontSize: 11.5, color: 'var(--ah-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Back to sign in
              </button>
            ) : (
              <button onClick={() => switchMode(isSignUp ? 'signin' : 'signup')} style={{ fontFamily: 'var(--ah-mono)', fontSize: 11.5, color: 'var(--ah-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}>
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
