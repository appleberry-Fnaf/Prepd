import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { CatMark } from '../Logo';
import { AP_SUBJECTS } from './constants';

const CATEGORY_COLOR: Record<string, string> = {
  'Math & CS':  '#3b82f6',
  'Sciences':   '#60a5fa',
  'English':    '#f5c842',
  'History':    '#f5c842',
  'Languages':  '#60a5fa',
};

const STATS = [
  { value: '15', label: 'AP subjects' },
  { value: '4',  label: 'categories' },
  { value: '∞',  label: 'free, always' },
];

export default function EndingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const animated   = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    // Set initial hidden state for animated elements
    const heading = el.querySelector('.ah-ending-heading');
    const sub     = el.querySelector('.ah-ending-sub');
    const stats   = el.querySelectorAll('.ah-stat');
    const rows    = el.querySelectorAll('.ah-subject-row');
    const buttons = el.querySelectorAll('.ah-cta-btn');

    [heading, sub, ...Array.from(stats), ...Array.from(rows), ...Array.from(buttons)].forEach(node => {
      if (node instanceof HTMLElement) {
        node.style.opacity = '0';
        node.style.transform = 'translateY(20px)';
      }
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animated.current) return;
        animated.current = true;

        if (heading) animate(heading, { translateY: [30, 0], opacity: [0, 1], duration: 800, ease: 'outExpo' });
        if (sub)     animate(sub,     { translateY: [20, 0], opacity: [0, 1], duration: 700, delay: 80,  ease: 'outExpo' });

        animate(stats,   { translateY: [16, 0], opacity: [0, 1], duration: 500, delay: stagger(60,  { start: 160 }), ease: 'outExpo' });
        animate(rows,    { translateY: [14, 0], opacity: [0, 1], duration: 460, delay: stagger(28,  { start: 300 }), ease: 'outExpo' });
        animate(buttons, { translateY: [12, 0], opacity: [0, 1], duration: 480, delay: stagger(60,  { start: 700 }), ease: 'outExpo' });
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="ah-ending" aria-label="Start studying">

      {/* Stats strip — visual bridge from scroll story */}
      <div className="ah-stats-strip" aria-label="Platform stats">
        {STATS.map(({ value, label }) => (
          <div key={label} className="ah-stat">
            <span className="ah-stat-value">{value}</span>
            <span className="ah-stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="ah-ending-inner">
        <h2 className="ah-ending-heading">Start studying.</h2>
        <p className="ah-ending-sub">
          Pick a subject and dive in — completely free, no account required.
        </p>

        <ul className="ah-subjects-grid" role="list">
          {AP_SUBJECTS.map(({ name, slug, category }) => (
            <li key={slug}>
              <Link to={`/subjects/${slug}`} className="ah-subject-row">
                <span className="ah-subject-row-left">
                  <span
                    className="ah-subject-dot"
                    style={{ background: CATEGORY_COLOR[category] ?? '#888' }}
                    aria-hidden="true"
                  />
                  <span className="ah-subject-name">{name}</span>
                </span>
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
          <Link to="/contribute" className="ah-cta-btn ah-cta-btn--ghost">
            Contribute
          </Link>
        </div>
      </div>

      <footer className="ah-footer" aria-label="Site footer">
        <div className="ah-footer-inner">
          <div className="ah-footer-brand">
            <CatMark className="w-7 h-7" />
            <span className="ah-footer-name">Prepd</span>
          </div>
          <p className="ah-footer-mission">
            Free AP preparation, built and maintained by students.
            No ads, no paywall, no nonsense.
          </p>
          <nav className="ah-footer-links" aria-label="Footer navigation">
            <Link to="/subjects">Subjects</Link>
            <Link to="/practice">Practice</Link>
            <Link to="/contribute">Contribute</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/profile">Profile</Link>
          </nav>
          <p className="ah-footer-copy">© 2026 Prepd · Student-run nonprofit</p>
        </div>
      </footer>
    </section>
  );
}
