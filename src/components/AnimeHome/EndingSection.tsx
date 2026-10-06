import { Link } from 'react-router-dom';
import { CatMark } from '../Logo';
import { AP_SUBJECTS } from './constants';

export default function EndingSection() {
  return (
    <section className="ah-ending" aria-label="Start studying">
      <div className="ah-ending-inner">
        <h2 className="ah-ending-heading">Start studying.</h2>
        <p className="ah-ending-sub">Pick a subject and dive in — completely free.</p>

        <ul className="ah-subjects-grid" role="list">
          {AP_SUBJECTS.map(({ name, slug, category }) => (
            <li key={slug}>
              <Link to={`/subjects/${slug}`} className="ah-subject-row">
                <span className="ah-subject-name">{name}</span>
                <span className="ah-subject-cat">{category}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="ah-cta-buttons">
          <Link to="/subjects" className="ah-cta-btn ah-cta-btn--primary">
            Browse all subjects
          </Link>
          <Link to="/practice" className="ah-cta-btn ah-cta-btn--ghost">
            Start practicing
          </Link>
        </div>
      </div>

      <footer className="ah-footer" aria-label="Site footer">
        <div className="ah-footer-inner">
          <div className="ah-footer-brand">
            <CatMark className="w-8 h-8" />
            <span>Prepd</span>
            <span className="ah-footer-tagline">Free AP prep, built by students.</span>
          </div>
          <nav className="ah-footer-links" aria-label="Footer navigation">
            <Link to="/subjects">Subjects</Link>
            <Link to="/practice">Practice</Link>
            <Link to="/contribute">Contribute</Link>
            <Link to="/leaderboard">Leaderboard</Link>
          </nav>
          <p className="ah-footer-copy">© 2026 Prepd. Student-run nonprofit.</p>
        </div>
      </footer>
    </section>
  );
}
