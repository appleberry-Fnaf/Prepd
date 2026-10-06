import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { APSubject } from '../lib/supabase';
import { animate, createTimeline, scrambleText, stagger } from 'animejs';
import { CatMark } from '../components/Logo';
import {
  ArrowRight,
  BookOpen,
  PenTool,
  Upload,
  GraduationCap,
  Zap,
  ChevronRight,
  ChevronDown,
  Layers,
  Target,
  Award,
  CheckCircle2,
  HeartHandshake,
  Trophy,
} from 'lucide-react';

export default function Home() {
  const [subjects, setSubjects] = useState<APSubject[]>([]);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [displayStats, setDisplayStats] = useState({ subjects: 0, questions: 0, featured: 0 });

  const readyRef = useRef<HTMLSpanElement>(null);
  const prepdRef = useRef<HTMLSpanElement>(null);

  const bookScrollWrapperRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const leftPageContentRef = useRef<HTMLDivElement>(null);
  const featureStaticRef = useRef<HTMLDivElement | null>(null);
  const choicePanelRef = useRef<HTMLDivElement>(null);
  const turningPageRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const featureContentRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const progressDotRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null]);
  const bookTimelineRef = useRef<ReturnType<typeof createTimeline> | null>(null);

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

  useEffect(() => {
    if (readyRef.current) {
      animate(readyRef.current, {
        textContent: scrambleText({ chars: 'symbols', from: 'left', ease: 'outExpo' }),
        duration: 2400,
        delay: 300,
      });
    }
    if (prepdRef.current) {
      animate(prepdRef.current, {
        textContent: scrambleText({ chars: 'symbols', from: 'left', ease: 'outExpo' }),
        duration: 2800,
        delay: 1400,
      });
    }
  }, []);

  useEffect(() => {
    if (subjects.length === 0 && questionCount === 0 && featuredCount === 0) return;
    const targets = { subjects: subjects.length, questions: questionCount, featured: featuredCount };
    const duration = 1400;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplayStats({
        subjects: Math.round(eased * targets.subjects),
        questions: Math.round(eased * targets.questions),
        featured: Math.round(eased * targets.featured),
      });
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [subjects.length, questionCount, featuredCount]);

  useEffect(() => {
    if (!bookRef.current || !coverRef.current) return;

    const tl = createTimeline({ autoplay: false });

    // Book entrance (0–800ms)
    tl.add(bookRef.current, {
      opacity: [0, 1],
      scale: [0.68, 1],
      translateY: [60, 0],
      duration: 800,
      ease: 'outExpo',
    }, 0);

    if (scrollHintRef.current) {
      tl.add(scrollHintRef.current, {
        opacity: [1, 0],
        translateY: [0, -16],
        duration: 500,
        ease: 'outQuad',
      }, 400);
    }

    // Cover opens (800–2600ms) — slow, dramatic
    tl.add(coverRef.current, {
      rotateY: [0, -180],
      duration: 1800,
      ease: 'inOutQuart',
    }, 800);

    // Left page TOC fades in as cover nears open (2000–2600ms)
    if (leftPageContentRef.current) {
      const tocEls = Array.from(leftPageContentRef.current.querySelectorAll('.book-reveal-el'));
      if (tocEls.length) {
        tl.add(tocEls, {
          opacity: [0, 1],
          translateX: [-8, 0],
          delay: stagger(80),
          duration: 400,
          ease: 'outQuad',
        }, 2000);
      }
    }

    // Feature 1: Subjects reveals (2600–3200ms)
    const fc0 = featureContentRefs.current[0];
    if (fc0) {
      tl.add(Array.from(fc0.querySelectorAll('.book-reveal-el')), {
        opacity: [0, 1],
        translateY: [12, 0],
        delay: stagger(70),
        duration: 380,
        ease: 'outQuad',
      }, 2600);
    }

    // Page 1 turns (3400–4300ms)
    const p0 = turningPageRefs.current[0];
    if (p0) {
      tl.add(p0, { rotateY: [0, -180], duration: 900, ease: 'inOutQuart' }, 3400);
    }

    // Feature 2: Practice reveals (4300–4900ms)
    const fc1 = featureContentRefs.current[1];
    if (fc1) {
      tl.add(Array.from(fc1.querySelectorAll('.book-reveal-el')), {
        opacity: [0, 1],
        translateY: [12, 0],
        delay: stagger(70),
        duration: 380,
        ease: 'outQuad',
      }, 4300);
    }

    // Page 2 turns (5100–5900ms)
    const p1 = turningPageRefs.current[1];
    if (p1) {
      tl.add(p1, { rotateY: [0, -180], duration: 800, ease: 'inOutQuart' }, 5100);
    }

    // Feature 3: Contribute reveals (5900–6500ms)
    const fc2 = featureContentRefs.current[2];
    if (fc2) {
      tl.add(Array.from(fc2.querySelectorAll('.book-reveal-el')), {
        opacity: [0, 1],
        translateY: [12, 0],
        delay: stagger(70),
        duration: 380,
        ease: 'outQuad',
      }, 5900);
    }

    // Page 3 turns (6700–7500ms)
    const p2 = turningPageRefs.current[2];
    if (p2) {
      tl.add(p2, { rotateY: [0, -180], duration: 800, ease: 'inOutQuart' }, 6700);
    }

    // Feature 4: Leaderboard fades in (7500–7900ms)
    const fs = featureStaticRef.current;
    if (fs) {
      tl.add(fs, { opacity: [0, 1], duration: 300, ease: 'outQuad' }, 7500);
      const fc3 = featureContentRefs.current[3];
      if (fc3) {
        tl.add(Array.from(fc3.querySelectorAll('.book-reveal-el')), {
          opacity: [0, 1],
          translateY: [12, 0],
          delay: stagger(70),
          duration: 380,
          ease: 'outQuad',
        }, 7600);
      }
    }

    // "Where do you want to start?" panel fades in (8400–9000ms)
    if (choicePanelRef.current) {
      tl.add(choicePanelRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        ease: 'outQuad',
      }, 8400);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(() => tl.seek(tl.duration));
    }

    bookTimelineRef.current = tl;
  }, []);

  useEffect(() => {
    function handleScroll() {
      const wrapper = bookScrollWrapperRef.current;
      const tl = bookTimelineRef.current;
      if (!wrapper || !tl) return;

      const scrolledIn = Math.max(0, -wrapper.getBoundingClientRect().top);
      const scrollable = wrapper.offsetHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, scrolledIn / scrollable) : 0;

      tl.seek(progress * tl.duration);

      const step = Math.min(4, Math.floor(progress * 5));
      progressDotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        if (i <= step) {
          dot.style.background = 'rgb(var(--color-ink-rgb))';
          dot.style.transform = 'scale(1.5)';
        } else {
          dot.style.background = '';
          dot.style.transform = '';
        }
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { label: 'AP Subjects', value: displayStats.subjects, icon: BookOpen },
    { label: 'Practice Questions', value: displayStats.questions, icon: PenTool },
    { label: 'Featured Resources', value: displayStats.featured, icon: GraduationCap },
  ];

  const choices = [
    { to: '/subjects', label: 'Subject Pages', icon: Layers, color: 'bg-blue-500' },
    { to: '/practice', label: 'Practice', icon: Target, color: 'bg-emerald-500' },
    { to: '/contribute', label: 'Contribute', icon: Upload, color: 'bg-amber-500' },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, color: 'bg-violet-500' },
  ];

  return (
    <div>
      {/* Hero */}
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
                Get <span ref={readyRef}>Ready</span>.
                <br />
                <span className="text-wood">Get <span ref={prepdRef}>Prepd</span>.</span>
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

      {/* Cinematic Book Scroll Section */}
      <div ref={bookScrollWrapperRef} className="relative" style={{ height: '600vh' }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden bg-parchment">

          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-stone/12 rounded-full blur-[100px]" />
          </div>

          {/* Section label */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <div className="accent-strip mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-ink tracking-tight">Everything You Need</h2>
          </div>

          {/* Scroll hint */}
          <div
            ref={scrollHintRef}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-taupe-400 text-xs select-none pointer-events-none"
          >
            <span className="tracking-[0.2em] uppercase">Scroll to open</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>

          {/* 3D Book */}
          <div className="book-scene">
            <div ref={bookRef} className="book" style={{ opacity: 0 }}>

              {/* Interior left page */}
              <div className="book-left-page">
                <div ref={leftPageContentRef} className="book-left-page-inner">
                  <div className="book-reveal-el text-[10px] tracking-[0.28em] uppercase text-taupe-400 mb-3 font-semibold" style={{ opacity: 0 }}>Contents</div>
                  <div className="book-reveal-el mb-5" style={{ opacity: 0 }}>
                    <div className="accent-strip" />
                  </div>
                  {[
                    { num: 'I', title: 'Subject Pages' },
                    { num: 'II', title: 'Practice Questions' },
                    { num: 'III', title: 'Contribute' },
                    { num: 'IV', title: 'Leaderboard' },
                  ].map((ch, i) => (
                    <div key={ch.num} className="book-reveal-el flex items-baseline gap-2.5 mb-4" style={{ opacity: 0 }}>
                      <span className="text-[10px] font-bold text-taupe-400 w-6 shrink-0">{ch.num}.</span>
                      <span className="flex-1 text-sm font-medium text-ink">{ch.title}</span>
                      <span className="text-xs text-taupe-300 shrink-0">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="book-page-lines" />
              </div>

              {/* Spine */}
              <div className="book-spine" aria-hidden="true">
                <span className="book-spine-text">Prepd</span>
              </div>

              {/* Interior right background */}
              <div className="book-right-bg" />

              {/* Static page: Feature 4 — Leaderboard */}
              <div
                ref={el => { featureStaticRef.current = el; }}
                className="book-right-page-static"
                style={{ zIndex: 1, opacity: 0 }}
              >
                <div ref={el => { featureContentRefs.current[3] = el; }} className="book-page-inner">
                  <div className="book-reveal-el w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center mb-5" style={{ opacity: 0 }}>
                    <Award className="w-6 h-6 text-violet-600" />
                  </div>
                  <div className="book-reveal-el text-[10px] font-bold tracking-[0.25em] uppercase text-taupe-400 mb-1" style={{ opacity: 0 }}>IV · Leaderboard</div>
                  <h3 className="book-reveal-el text-xl font-bold text-ink mb-3 leading-tight" style={{ opacity: 0 }}>Climb the Ranks</h3>
                  <p className="book-reveal-el text-sm text-taupe-600 leading-relaxed" style={{ opacity: 0 }}>
                    Earn points for every contribution. Climb the leaderboard and unlock rewards as a top contributor.
                  </p>
                </div>
                <div className="book-page-edge" />
                <div className="book-page-lines opacity-30" />
              </div>

              {/* Turning page: Feature 3 — Contribute */}
              <div ref={el => { turningPageRefs.current[2] = el; }} className="book-page-turning" style={{ zIndex: 2 }}>
                <div className="book-page-face book-page-face--front">
                  <div ref={el => { featureContentRefs.current[2] = el; }} className="book-page-inner">
                    <div className="book-reveal-el w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-5" style={{ opacity: 0 }}>
                      <Upload className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="book-reveal-el text-[10px] font-bold tracking-[0.25em] uppercase text-taupe-400 mb-1" style={{ opacity: 0 }}>III · Contribute</div>
                    <h3 className="book-reveal-el text-xl font-bold text-ink mb-3 leading-tight" style={{ opacity: 0 }}>Share Your Work</h3>
                    <p className="book-reveal-el text-sm text-taupe-600 leading-relaxed" style={{ opacity: 0 }}>
                      Share your notes, study guides, and practice tests. Help others while building your own understanding.
                    </p>
                  </div>
                  <div className="book-page-edge" />
                  <div className="book-page-lines opacity-30" />
                </div>
                <div className="book-page-face book-page-face--back">
                  <div className="book-page-lines" />
                  <div className="book-page-back-label">Contribute</div>
                </div>
              </div>

              {/* Turning page: Feature 2 — Practice */}
              <div ref={el => { turningPageRefs.current[1] = el; }} className="book-page-turning" style={{ zIndex: 3 }}>
                <div className="book-page-face book-page-face--front">
                  <div ref={el => { featureContentRefs.current[1] = el; }} className="book-page-inner">
                    <div className="book-reveal-el w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5" style={{ opacity: 0 }}>
                      <Target className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="book-reveal-el text-[10px] font-bold tracking-[0.25em] uppercase text-taupe-400 mb-1" style={{ opacity: 0 }}>II · Practice</div>
                    <h3 className="book-reveal-el text-xl font-bold text-ink mb-3 leading-tight" style={{ opacity: 0 }}>Test Your Knowledge</h3>
                    <p className="book-reveal-el text-sm text-taupe-600 leading-relaxed" style={{ opacity: 0 }}>
                      Real AP-style questions across all subjects. Get instant feedback and detailed explanations.
                    </p>
                  </div>
                  <div className="book-page-edge" />
                  <div className="book-page-lines opacity-30" />
                </div>
                <div className="book-page-face book-page-face--back">
                  <div className="book-page-lines" />
                  <div className="book-page-back-label">Practice</div>
                </div>
              </div>

              {/* Turning page: Feature 1 — Subjects */}
              <div ref={el => { turningPageRefs.current[0] = el; }} className="book-page-turning" style={{ zIndex: 4 }}>
                <div className="book-page-face book-page-face--front">
                  <div ref={el => { featureContentRefs.current[0] = el; }} className="book-page-inner">
                    <div className="book-reveal-el w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5" style={{ opacity: 0 }}>
                      <Layers className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="book-reveal-el text-[10px] font-bold tracking-[0.25em] uppercase text-taupe-400 mb-1" style={{ opacity: 0 }}>I · Subject Pages</div>
                    <h3 className="book-reveal-el text-xl font-bold text-ink mb-3 leading-tight" style={{ opacity: 0 }}>Every AP Subject</h3>
                    <p className="book-reveal-el text-sm text-taupe-600 leading-relaxed" style={{ opacity: 0 }}>
                      Dedicated pages for each AP subject with curated resources, study guides, and practice materials.
                    </p>
                  </div>
                  <div className="book-page-edge" />
                  <div className="book-page-lines opacity-30" />
                </div>
                <div className="book-page-face book-page-face--back">
                  <div className="book-page-lines" />
                  <div className="book-page-back-label">Subjects</div>
                </div>
              </div>

              {/* Cover — full width, starts closed, turns first */}
              <div ref={coverRef} className="book-cover">
                <div className="book-cover-face book-cover-face--front">
                  {/* Spine crease shadow on cover left */}
                  <div className="book-cover-crease" />
                  {/* Inner border frame */}
                  <div className="absolute inset-4 border border-parchment/12 rounded-sm pointer-events-none" />
                  <div className="absolute inset-[18px] border border-parchment/6 rounded-sm pointer-events-none" />
                  {/* Content */}
                  <div className="relative flex flex-col items-center justify-center h-full gap-6 px-8">
                    <CatMark className="w-16 h-16 opacity-80" />
                    <div className="text-center space-y-3">
                      <div className="text-5xl sm:text-6xl font-bold text-parchment tracking-[0.12em] uppercase">Prepd</div>
                      <div className="flex items-center gap-3 justify-center">
                        <div className="h-px w-12 bg-parchment/25" />
                        <div className="text-[11px] text-parchment/45 tracking-[0.3em] uppercase">AP Study Guide</div>
                        <div className="h-px w-12 bg-parchment/25" />
                      </div>
                    </div>
                    <div className="text-[10px] text-parchment/25 tracking-[0.2em] uppercase mt-2">Scroll to Open</div>
                  </div>
                  {/* Bottom metadata */}
                  <div className="absolute bottom-5 left-0 right-0 flex items-center justify-between px-8">
                    <div className="text-[9px] text-parchment/20 tracking-widest uppercase">Nonprofit · Free</div>
                    <div className="text-[9px] text-parchment/20 tracking-widest uppercase">2025 Edition</div>
                  </div>
                </div>
                <div className="book-cover-face book-cover-face--back">
                  <div className="book-page-lines opacity-40" />
                </div>
              </div>

            </div>
          </div>

          {/* "Where do you want to start?" panel — fades in at end */}
          <div
            ref={choicePanelRef}
            className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 pb-10 pointer-events-none"
            style={{ opacity: 0 }}
          >
            <p className="text-sm font-semibold text-ink tracking-wide">Where do you want to start?</p>
            <div className="flex flex-wrap justify-center gap-3 pointer-events-auto">
              {choices.map(({ to, label, icon: Icon, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl card-warm card-warm-hover text-sm font-semibold text-ink shadow-sm hover:shadow-md transition-all"
                >
                  <span className={`w-6 h-6 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </span>
                  {label}
                  <ArrowRight className="w-3.5 h-3.5 text-taupe-400" />
                </Link>
              ))}
            </div>
          </div>

          {/* Progress dots */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                ref={el => { progressDotRefs.current[i] = el; }}
                className="book-progress-dot"
              />
            ))}
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-parchment to-transparent pointer-events-none" />
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-ink dark:bg-[#07111e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-parchment dark:text-[#c8e0ff] mb-4">Ready to start preparing?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students who use Prepd to stay organized and ace their AP exams.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/subjects"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-parchment dark:bg-[#1a3260] text-ink dark:text-[#c8e0ff] font-semibold text-sm hover:bg-cream-200 dark:hover:bg-[#243f78] transition-all"
            >
              Browse All Subjects
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contribute"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-transparent text-parchment dark:text-[#c8e0ff] font-semibold text-sm border-2 border-slate-400 dark:border-[#3a6090] hover:bg-parchment/10 transition-all"
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
