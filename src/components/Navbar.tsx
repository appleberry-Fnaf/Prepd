import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CatMark } from './Logo';
import { animate, scrambleText } from 'animejs';
import { Menu, X, ShieldCheck } from 'lucide-react';

const NAV_LINKS = [
  { path: '/subjects',    label: 'Subjects' },
  { path: '/practice',   label: 'Practice' },
  { path: '/contribute', label: 'Contribute' },
  { path: '/leaderboard',label: 'Leaderboard' },
  { path: '/profile',    label: 'Profile' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const brandRef = useRef<HTMLSpanElement>(null);
  const location = useLocation();

  // Scramble brand text on first mount
  useRef<boolean>((() => {
    if (brandRef.current) {
      animate(brandRef.current, {
        textContent: scrambleText({ chars: 'symbols', from: 'left', ease: 'outExpo' }),
        duration: 900,
        delay: 400,
      });
    }
    return true;
  }) as unknown as boolean);

  const links = profile?.is_moderator
    ? [...NAV_LINKS, { path: '/moderate', label: 'Moderate' }]
    : NAV_LINKS;

  const isActive = (p: string) => location.pathname === p;

  return (
    <>
      <nav className="dk-nav">
        <Link to="/" className="dk-nav-brand" aria-label="Prepd home">
          <CatMark className="w-7 h-7" />
          <span ref={brandRef}>Prepd</span>
        </Link>

        <div className="dk-nav-links" role="list">
          {links.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              role="listitem"
              className={`dk-nav-link ${isActive(path) ? 'dk-nav-link-active' : ''}`}
            >
              {path === '/moderate' && <ShieldCheck className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />}
              {label}
            </Link>
          ))}
        </div>

        <div className="dk-nav-actions">
          {user ? (
            <button onClick={signOut} className="dk-nav-signout">
              Sign out
            </button>
          ) : (
            <Link to="/auth" className="dk-nav-signin">
              Sign in
            </Link>
          )}
        </div>

        <button
          className="dk-nav-mobile-toggle"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="dk-nav-mobile-drawer">
          {links.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={`dk-nav-mobile-link ${isActive(path) ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
          <div className="dk-sep" style={{ margin: '8px 0' }} />
          {user ? (
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="dk-nav-mobile-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              Sign out
            </button>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)} className="dk-nav-mobile-link">
              Sign in
            </Link>
          )}
        </div>
      )}
    </>
  );
}
