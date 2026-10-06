import { Link } from 'react-router-dom';
import { CatMark } from '../Logo';

export default function HomeNavbar() {
  return (
    <nav className="ah-nav" aria-label="Site navigation">
      <Link to="/" className="ah-nav-brand" aria-label="Prepd home">
        <CatMark className="w-7 h-7" />
        <span>Prepd</span>
      </Link>
      <div className="ah-nav-links" role="list">
        <Link to="/subjects" role="listitem">Subjects</Link>
        <Link to="/practice" role="listitem">Practice</Link>
        <Link to="/contribute" role="listitem">Contribute</Link>
      </div>
      <Link to="/subjects" className="ah-nav-cta">
        Start free
      </Link>
    </nav>
  );
}
