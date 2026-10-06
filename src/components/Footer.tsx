import { Link } from 'react-router-dom';
import { CatMark } from './Logo';

export default function Footer() {
  return (
    <footer className="dk-footer">
      <div className="dk-footer-inner">
        <div className="dk-footer-brand">
          <CatMark className="w-6 h-6" />
          <span className="dk-footer-name">Prepd</span>
        </div>
        <p className="dk-footer-mission">
          Free AP preparation, built and maintained by students.
          No ads, no paywall, no nonsense.
        </p>
        <nav className="dk-footer-links" aria-label="Footer navigation">
          <Link to="/subjects">Subjects</Link>
          <Link to="/practice">Practice</Link>
          <Link to="/contribute">Contribute</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/profile">Profile</Link>
        </nav>
        <p className="dk-footer-copy">© 2026 Prepd · Student-run nonprofit</p>
      </div>
    </footer>
  );
}
