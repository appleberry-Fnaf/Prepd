import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass, Mail, Lock, User, ArrowLeft, Eye, EyeOff, AlertCircle,
} from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (isSignUp) {
      const { error } = await signUp(email, password, displayName);
      if (error) setError(error);
      else navigate('/profile');
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate('/profile');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-taupe-600 hover:text-ink mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to home
        </Link>

        <div className="bg-white rounded-2xl border border-taupe-300/50 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center shadow-md shadow-ink/15">
              <Compass className="w-5 h-5 text-parchment" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink">Prepd</h1>
              <p className="text-xs text-taupe-500">AP Study Platform</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-ink mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-sm text-taupe-500 mb-6">
            {isSignUp ? 'Join the AP student community today.' : 'Sign in to access your study progress and submissions.'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
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
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-taupe-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-taupe-300/50 text-ink placeholder-taupe-400 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-taupe-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe-400 hover:text-ink">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ink text-parchment font-semibold text-sm hover:bg-ink/90 transition-all disabled:opacity-50 shadow-md shadow-ink/15">
              {loading ? <div className="w-5 h-5 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-sm text-ink hover:text-ink/80 font-medium">
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
