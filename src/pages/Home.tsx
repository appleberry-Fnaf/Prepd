import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { APSubject } from '../lib/supabase';
import {
  ArrowRight,
  BookOpen,
  PenTool,
  Upload,
  GraduationCap,
  Users,
  Zap,
  ChevronRight,
  Layers,
  Target,
  Compass,
  Award,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';

export default function Home() {
  const [subjects, setSubjects] = useState<APSubject[]>([]);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      const { data: subjectsData } = await supabase.from('ap_subjects').select('*');
      const { data: resourcesData } = await supabase.from('resources').select('*');
      const { data: questionsData } = await supabase.from('practice_questions').select('*');
      setSubjects(subjectsData || []);
      setFeaturedCount((resourcesData || []).filter(r => r.is_featured).length);
      setQuestionCount(questionsData?.length || 0);
    }
    loadData();
  }, []);

  const stats = [
    { label: 'AP Subjects', value: subjects.length, icon: BookOpen },
    { label: 'Practice Questions', value: questionCount, icon: PenTool },
    { label: 'Featured Resources', value: featuredCount, icon: GraduationCap },
  ];

  const features = [
    {
      title: 'Subject Pages',
      description: 'Dedicated pages for each AP subject with curated resources, study guides, and practice materials.',
      icon: Layers,
    },
    {
      title: 'Practice Questions',
      description: 'Test your knowledge with real AP-style questions across all subjects. Get instant feedback and explanations.',
      icon: Target,
    },
    {
      title: 'Contribute',
      description: 'Share your notes, study guides, and practice tests. Help others while building your own understanding.',
      icon: Upload,
    },
    {
      title: 'Leaderboard',
      description: 'Earn points for every contribution. Climb the leaderboard and unlock rewards as a top contributor.',
      icon: Award,
    },
  ];

  const categories = [
    { name: 'Math & CS', count: subjects.filter(s => s.category === 'Math & Computer Science').length, icon: Zap },
    { name: 'Sciences', count: subjects.filter(s => s.category === 'Sciences').length, icon: Compass },
    { name: 'English', count: subjects.filter(s => s.category === 'English').length, icon: BookOpen },
    { name: 'History & Social', count: subjects.filter(s => s.category === 'History & Social Sciences').length, icon: Users },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-parchment overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-stone/20 rounded-bl-[100px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-stone/15 rounded-tr-[80px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone/40 text-ink text-sm font-medium">
                <Zap className="w-4 h-4" />
                The #1 AP Study Platform
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-ink leading-[1.1] tracking-tight">
                Get Ready.
                <br />
                <span className="text-wood">Get Prepd.</span>
              </h1>
              <p className="text-lg text-taupe-600 leading-relaxed max-w-lg">
                Making AP preparation more accessible, organized, and effective for students. Find resources, practice questions, and a community that helps you succeed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/subjects" className="btn-warm inline-flex items-center gap-2">
                  Explore Subjects
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/practice" className="btn-warm-outline inline-flex items-center gap-2">
                  Start Practicing
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <stat.icon className="w-5 h-5 text-taupe-400" />
                    <div>
                      <div className="text-lg font-bold text-ink">{stat.value}</div>
                      <div className="text-xs text-taupe-500">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-stone/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-wood/20 rounded-full blur-3xl" />
                <div className="relative card-warm p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-ink/8 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-ink" />
                    </div>
                    <div>
                      <div className="font-semibold text-ink">Everything in one place</div>
                      <div className="text-xs text-taupe-500">Made for AP students</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: Layers, text: 'Notes & study guides for every AP subject' },
                      { icon: CheckCircle2, text: 'Community resources, checked by moderators' },
                      { icon: HeartHandshake, text: 'Earn verified volunteer hours' },
                      { icon: Award, text: 'Points, tiers & a leaderboard' },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl bg-parchment/60 border border-taupe-300/20">
                        <div className="w-8 h-8 rounded-lg bg-ink/8 flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-ink" />
                        </div>
                        <span className="text-sm text-ink font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-cream-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="accent-strip mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-ink mb-3">Browse by Category</h2>
            <p className="text-taupe-600 max-w-2xl mx-auto">
              Explore AP subjects organized by category. Find the right resources for your exams.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/subjects`}
                className="group p-6 card-warm card-warm-hover text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-ink/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-ink/12 transition-colors">
                  <cat.icon className="w-6 h-6 text-ink" />
                </div>
                <h3 className="font-semibold text-ink mb-1">{cat.name}</h3>
                <p className="text-sm text-taupe-500">{cat.count} subjects</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-parchment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="accent-strip mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-ink mb-3">Everything You Need to Succeed</h2>
            <p className="text-taupe-600 max-w-2xl mx-auto">
              Prepd brings together all the tools AP students need in one modern, easy-to-use platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 card-warm card-warm-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-ink/8 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-ink" />
                </div>
                <h3 className="text-xl font-semibold text-ink mb-2">{feature.title}</h3>
                <p className="text-taupe-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-ink">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-parchment mb-4">Ready to start preparing?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students who use Prepd to stay organized and ace their AP exams.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/subjects"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-parchment text-ink font-semibold text-sm hover:bg-cream-200 transition-all"
            >
              Browse All Subjects
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contribute"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-transparent text-parchment font-semibold text-sm border-2 border-slate-400 hover:bg-parchment/10 transition-all"
            >
              <Upload className="w-4 h-4" />
              Share Your Notes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
