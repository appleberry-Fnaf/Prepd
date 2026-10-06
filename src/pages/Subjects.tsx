import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { APSubject } from '../lib/supabase';
import { animate, stagger } from 'animejs';
import {
  Search,
  BookOpen,
  Calculator,
  BarChart3,
  Leaf,
  FlaskConical,
  Atom,
  Landmark,
  Globe,
  Scale,
  Brain,
  Code,
  Castle,
  ChevronRight,
  FileText,
  GraduationCap,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  'calculator': Calculator,
  'bar-chart': BarChart3,
  'leaf': Leaf,
  'flask-conical': FlaskConical,
  'atom': Atom,
  'book-open': BookOpen,
  'landmark': Landmark,
  'globe': Globe,
  'scale': Scale,
  'brain': Brain,
  'code': Code,
  'castle': Castle,
};

export default function Subjects() {
  const [subjects, setSubjects] = useState<APSubject[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSubjects() {
      const { data } = await supabase.from('ap_subjects').select('*').order('name');
      setSubjects(data || []);
      setLoading(false);
    }
    loadSubjects();
  }, []);

  // Stagger cards each time the visible set changes (initial load + filter)
  useEffect(() => {
    if (loading || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.subject-card');
    if (cards.length === 0) return;
    animate(cards, {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(50),
      duration: 400,
      ease: 'outQuad',
    });
  }, [loading, search, activeCategory]);

  const categories = ['All', ...Array.from(new Set(subjects.map(s => s.category)))];

  const filtered = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-stone/40 border-t-ink rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="accent-strip mb-4" />
        <h1 className="text-4xl font-bold text-ink mb-3">AP Subjects</h1>
        <p className="text-lg text-taupe-600 max-w-2xl">
          Browse all available AP subjects. Click on any subject to find resources, practice questions, and study guides.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-taupe-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-taupe-300/50 bg-white text-ink placeholder-taupe-400 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-taupe-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-ink text-parchment'
                  : 'bg-white text-taupe-600 border border-taupe-300/50 hover:bg-parchment'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((subject) => {
          const Icon = iconMap[subject.icon] || BookOpen;
          return (
            <Link
              key={subject.id}
              to={`/subjects/${subject.slug}`}
              className="subject-card group p-6 card-warm card-warm-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-sm text-taupe-400">
                  <FileText className="w-4 h-4" />
                  <span>{subject.resource_count}</span>
                </div>
              </div>
              <h3 className="font-semibold text-ink text-lg mb-1">{subject.name}</h3>
              <p className="text-sm text-taupe-500 mb-3">{subject.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-taupe-500 bg-parchment px-2 py-1 rounded-md">
                  {subject.category}
                </span>
                <span className="flex items-center gap-1 text-sm text-ink font-medium group-hover:translate-x-1 transition-transform">
                  Explore
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <GraduationCap className="w-12 h-12 text-taupe-300 mx-auto mb-4" />
          <p className="text-taupe-500">No subjects found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
