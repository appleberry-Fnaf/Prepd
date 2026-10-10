import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { APSubject } from '../lib/supabase';
import { animate, stagger } from 'animejs';
import {
  Search, BookOpen, Calculator, BarChart3, Leaf, FlaskConical,
  Atom, Landmark, Globe, Scale, Brain, Code, Castle, ChevronRight,
  FileText, GraduationCap,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  'calculator': Calculator, 'bar-chart': BarChart3, 'leaf': Leaf,
  'flask-conical': FlaskConical, 'atom': Atom, 'book-open': BookOpen,
  'landmark': Landmark, 'globe': Globe, 'scale': Scale,
  'brain': Brain, 'code': Code, 'castle': Castle,
};

const CATEGORY_COLOR: Record<string, string> = {
  'Math & CS': '#3b82f6', 'Math & Computer Science': '#3b82f6',   // blue
  'Sciences': '#f97316',                                          // orange
  'English': '#f5c842',                                           // yellow
  'History': '#22c55e', 'History & Social Sciences': '#22c55e',   // green
  'Languages': '#a855f7',                                         // purple
};

export default function Subjects() {
  const [subjects, setSubjects] = useState<APSubject[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('ap_subjects').select('*').order('name').then(({ data }) => {
      setSubjects(data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.subject-card');
    if (!cards.length) return;
    animate(cards, { opacity: [0, 1], translateY: [16, 0], delay: stagger(40), duration: 380, ease: 'outExpo' });
  }, [loading, search, activeCategory]);

  const categories = ['All', ...Array.from(new Set(subjects.map(s => s.category)))];
  const filtered = subjects.filter(s => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      && (activeCategory === 'All' || s.category === activeCategory);
  });

  if (loading) {
    return (
      <div className="dk-empty" style={{ minHeight: '60vh' }}>
        <div className="dk-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="dk-header">
        <span className="dk-page-tag">AP Subjects</span>
        <h1 className="dk-heading-xl">Every course,<br />organized.</h1>
        <p className="dk-sub" style={{ maxWidth: 480 }}>
          Browse all 15 AP subjects — curated notes, guides, and practice questions for each.
        </p>
      </div>

      <div className="dk-container" style={{ paddingBottom: 'clamp(64px, 10vh, 100px)' }}>
        {/* Search + filter row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div className="dk-input-icon" style={{ flex: '1 1 240px', minWidth: 0 }}>
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search subjects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="dk-input"
              style={{ paddingLeft: 40 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`dk-filter ${activeCategory === cat ? 'dk-filter-active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map(subject => {
            const Icon = iconMap[subject.icon] || BookOpen;
            const accent = CATEGORY_COLOR[subject.category] ?? '#06b6d4';
            return (
              <Link
                key={subject.id}
                to={`/subjects/${subject.slug}`}
                className="subject-card dk-card dk-card-hover"
                style={{ padding: '20px 22px', display: 'block', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${accent}22`, border: `1px solid ${accent}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon className="w-5 h-5" style={{ color: accent }} />
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--ah-mono)', fontSize: 11, color: 'var(--ah-muted)' }}>
                    <FileText className="w-3.5 h-3.5" />
                    {subject.resource_count}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--ah-sans)', fontSize: 15, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 4, letterSpacing: '-0.01em' }}>
                  {subject.name}
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--ah-muted)', marginBottom: 14, lineHeight: 1.55 }}>
                  {subject.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="dk-badge dk-badge-muted">{subject.category}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--ah-mono)', fontSize: 11, color: accent }}>
                    Explore <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="dk-empty">
            <GraduationCap className="w-10 h-10" />
            <p>No subjects match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
