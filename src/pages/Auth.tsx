import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, User, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle,
} from 'lucide-react';
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

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
    setInfo('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    if (isForgot) {
      const { error } = await resetPassword(email);
      if (error) setError(error);
      else setInfo("If an account exists for that email, we've sent a password reset link. Check your inbox.");
    } else if (isSignUp) {
      const { error, needsConfirmation } = await signUp(email, password, displayName);
      if (error) setError(error);
      else if (needsConfirmation) {
        setInfo('Account created! Check your email for a confirmation link, then sign in.');
        setMode('signin');
      } else {
        navigate('/profile');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate('/profile');
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setError('');
    setInfo('');
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setGoogleLoading(false);
    }
  }

  const heading = isForgot ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back';
  const subtitle = isForgot
    ? "Enter your email and we'll send you a link to reset your password."
    : isSignUp
      ? 'Join the AP student community today.'
      : 'Sign in to access your study progress and submissions.';
  const submitLabel = isForgot ? 'Send reset link' : isSignUp ? 'Create Account' : 'Sign In';

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-taupe-600 hover:text-ink mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to home
        </Link>

        <div className="bg-white rounded-2xl border border-taupe-300/50 p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6">
            <CatMark className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-ink">Prepd</h1>
              <p className="text-xs text-taupe-500">AP Study Platform</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-ink mb-2">{heading}</h2>
          <p className="text-sm text-taupe-500 mb-6">{subtitle}</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {info && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-sm text-green-800">{info}</p>
            </div>
          )}

          {!isForgot && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border border-taupe-300/60 bg-white text-ink font-semibold text-sm hover:bg-parchment/60 transition-all disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-taupe-300 border-t-ink rounded-full animate-spin" />
                ) : (
                  <GoogleIcon className="w-5 h-5" />
                )}
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-taupe-300/50" />
                <span className="text-xs text-taupe-400">or use email</span>
                <div className="h-px flex-1 bg-taupe-300/50" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-taupe-400" />
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-taupe-300/50 text-ink placeholder-taupe-400 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-taupe-400" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-taupe-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-taupe-300/50 text-ink placeholder-taupe-400 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-taupe-400" />
              </div>
            </div>
            {!isForgot && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-ink">Password</label>
                  {!isSignUp && (
                    <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-ink hover:text-ink/70 font-medium">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-taupe-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-taupe-300/50 text-ink placeholder-taupe-400 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-taupe-400" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe-400 hover:text-ink">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ink text-parchment font-semibold text-sm hover:bg-ink/90 transition-all disabled:opacity-50 shadow-md shadow-ink/15">
              {loading ? <div className="w-5 h-5 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" /> : submitLabel}
            </button>
          </form>

          <div className="mt-6 text-center">
            {isForgot ? (
              <button onClick={() => switchMode('signin')} className="text-sm text-ink hover:text-ink/80 font-medium">
                Back to sign in
              </button>
            ) : (
              <button onClick={() => switchMode(isSignUp ? 'signin' : 'signup')} className="text-sm text-ink hover:text-ink/80 font-medium">
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
