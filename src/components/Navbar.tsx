import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CatMark } from './Logo';
import {
  BookOpen,
  PenTool,
  Upload,
  Trophy,
  User,
  Menu,
  X,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Sparkles },
  { path: '/subjects', label: 'Subjects', icon: BookOpen },
  { path: '/practice', label: 'Practice', icon: PenTool },
  { path: '/contribute', label: 'Contribute', icon: Upload },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const items = profile?.is_moderator
    ? [...navItems, { path: '/moderate', label: 'Moderate', icon: ShieldCheck }]
    : navItems;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-warm border-b border-taupe-300/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <CatMark className="w-9 h-9 group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold text-ink tracking-tight">Prepd</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-ink/8 text-ink'
                      : 'text-taupe-600 hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            {user ? (
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-taupe-600 hover:bg-ink/5 hover:text-ink transition-all duration-200 ml-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-ink text-parchment hover:bg-ink/90 transition-all duration-200 ml-1 shadow-md shadow-ink/15 hover:shadow-lg hover:shadow-ink/25"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-ink hover:bg-ink/5"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-warm border-b border-taupe-300/30">
          <div className="px-4 py-3 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-ink/8 text-ink'
                      : 'text-taupe-600 hover:bg-ink/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            {user ? (
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-taupe-600 hover:bg-ink/5 w-full"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-ink text-parchment shadow-md shadow-ink/15"
              >
                <User className="w-5 h-5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
