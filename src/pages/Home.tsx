import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { APSubject } from '../lib/supabase';
import { animate, createTimeline, scrambleText, stagger } from 'animejs';
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
} from 'lucide-react';

export default function Home() {
  const [subjects, setSubjects] = useState<APSubject[]>([]);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [displayStats, setDisplayStats] = useState({ subjects: 0, questions: 0, featured: 0 });

  // Hero scramble refs
  const readyRef = useRef<HTMLSpanElement>(null);
  const prepdRef = useRef<HTMLSpanElement>(null);

  // Book scroll refs
  const bookScrollWrapperRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const featureStaticRef = useRef<HTMLDivElement | null>(null);
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

  // Scramble "Ready" then "Prepd" — longer durations for theatrical reveal
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

  // Counter animation when data arrives
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

  // Build the paused book timeline (runs once after mount)
  useEffect(() => {
    if (!bookRef.current || !coverRef.current) return;

    const tl = createTimeline({ autoplay: false });

    // ACT 0: Book appears (0–900ms)
    tl.add(bookRef.current, {
      opacity: [0, 1],
      scale: [0.72, 1],
      translateY: [48, 0],
      duration: 900,
      ease: 'outExpo',
    }, 0);

    // Scroll hint fades out (300–800ms)
    if (scrollHintRef.current) {
      tl.add(scrollHintRef.current, {
        opacity: [1, 0],
        translateY: [0, -14],
        duration: 500,
        ease: 'outQuad',
      }, 300);
    }

    // ACT 1: Cover opens (900–1900ms)
    tl.add(coverRef.current, {
      rotateY: [0, -180],
      duration: 1000,
      ease: 'inOutQuart',
    }, 900);

    // ACT 2a: Feature 1 (Subjects) content reveals (1900–2460ms)
    const fc0 = featureContentRefs.current[0];
    if (fc0) {
      const els = Array.from(fc0.querySelectorAll('.book-reveal-el'));
      if (els.length) {
        tl.add(els, {
          opacity: [0, 1],
          translateY: [10, 0],
          delay: stagger(70),
          duration: 350,
          ease: 'outQuad',
        }, 1900);
      }
    }

    // ACT 2b: Page 1 (Subjects) turns (2600–3500ms)
    const p0 = turningPageRefs.current[0];
    if (p0) {
      tl.add(p0, {
        rotateY: [0, -180],
        duration: 900,
        ease: 'inOutQuart',
      }, 2600);
    }

    // ACT 3a: Feature 2 (Practice) content reveals (3500–4060ms)
    const fc1 = featureContentRefs.current[1];
    if (fc1) {
      const els = Array.from(fc1.querySelectorAll('.book-reveal-el'));
      if (els.length) {
        tl.add(els, {
          opacity: [0, 1],
          translateY: [10, 0],
          delay: stagger(70),
          duration: 350,
          ease: 'outQuad',
        }, 3500);
      }
    }

    // ACT 3b: Page 2 (Practice) turns (4200–5000ms)
    const p1 = turningPageRefs.current[1];
    if (p1) {
      tl.add(p1, {
        rotateY: [0, -180],
        duration: 800,
        ease: 'inOutQuart',
      }, 4200);
    }

    // ACT 4a: Feature 3 (Contribute) content reveals (5000–5560ms)
    const fc2 = featureContentRefs.current[2];
    if (fc2) {
      const els = Array.from(fc2.querySelectorAll('.book-reveal-el'));
      if (els.length) {
        tl.add(els, {
          opacity: [0, 1],
          translateY: [10, 0],
          delay: stagger(70),
          duration: 350,
          ease: 'outQuad',
        }, 5000);
      }
    }

    // ACT 4b: Page 3 (Contribute) turns (5700–6500ms)
    const p2 = turningPageRefs.current[2];
    if (p2) {
      tl.add(p2, {
        rotateY: [0, -180],
        duration: 800,
        ease: 'inOutQuart',
      }, 5700);
    }

    // ACT 5: Static page (Leaderboard) fades in (6500–6800ms)
    const fs = featureStaticRef.current;
    if (fs) {
      tl.add(fs, {
        opacity: [0, 1],
        duration: 300,
        ease: 'outQuad',
      }, 6500);
      const fc3 = featureContentRefs.current[3];
      if (fc3) {
        const els = Array.from(fc3.querySelectorAll('.book-reveal-el'));
        if (els.length) {
          tl.add(els, {
            opacity: [0, 1],
            translateY: [10, 0],
            delay: stagger(70),
            duration: 350,
            ease: 'outQuad',
          }, 6600);
        }
      }
    }

    // ACT 5b: Completion flourish (6900–7200ms)
    tl.add(bookRef.current, {
      scale: [1, 1.018, 1],
      duration: 300,
      ease: 'inOutSine',
    }, 6900);

    // Skip to end for reduced-motion users
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(() => tl.seek(tl.duration));
    }

    bookTimelineRef.current = tl;
  }, []);

  // Scroll handler — seeks the book timeline
  useEffect(() => {
    function handleScroll() {
      const wrapper = bookScrollWrapperRef.current;
      const tl = bookTimelineRef.current;
      if (!wrapper || !tl) return;

      const scrolledIn = Math.max(0, -wrapper.getBoundingClientRect().top);
      const scrollable = wrapper.offsetHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, scrolledIn / scrollable) : 0;

      tl.seek(progress * tl.duration);

      // Update progress dots imperatively
      const step = Math.min(4, Math.floor(progress * 5));
      progressDotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        if (i <= step) {
          dot.style.background = 'rgb(var(--color-ink-rgb))';
          dot.style.transform = 'scale(1.4)';
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
      <div ref={bookScrollWrapperRef} className="relative" style={{ height: '500vh' }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden bg-parchment">

          {/* Ambient depth glow */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[440px] bg-stone/15 rounded-full blur-[90px]" />
          </div>

          {/* Section label — sits above the book */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <div className="accent-strip mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-ink tracking-tight">Everything You Need</h2>
          </div>

          {/* Scroll hint — fades out early in the timeline */}
          <div
            ref={scrollHintRef}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-taupe-400 text-xs select-none pointer-events-none"
          >
            <span className="tracking-widest uppercase">Scroll to explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>

          {/* 3D book scene */}
          <div className="book-scene">
            <div ref={bookRef} className="book" style={{ opacity: 0 }}>

              {/* Left half background */}
              <div className="book-half--left" />

              {/* Spine */}
              <div className="book-spine" aria-hidden="true">
                <span className="book-spine-text">Prepd</span>
              </div>

              {/* Right half background */}
              <div className="book-half--right" />

              {/* Static page: Feature 4 — Leaderboard (never turns, fades in) */}
              <div
                ref={el => { featureStaticRef.current = el; }}
                className="book-right-page-static"
                style={{ zIndex: 1, opacity: 0 }}
              >
                <div
                  ref={el => { featureContentRefs.current[3] = el; }}
                  className="book-page-inner"
                >
                  <div className="book-reveal-el w-10 h-10 rounded-xl bg-ink/8 flex items-center justify-center mb-4" style={{ opacity: 0 }}>
                    <Award className="w-5 h-5 text-ink" />
                  </div>
                  <div className="book-reveal-el text-[10px] font-semibold tracking-widest uppercase text-taupe-400 mb-1" style={{ opacity: 0 }}>4 of 4</div>
                  <h3 className="book-reveal-el text-lg font-bold text-ink mb-2" style={{ opacity: 0 }}>Leaderboard</h3>
                  <p className="book-reveal-el text-sm text-taupe-600 leading-relaxed" style={{ opacity: 0 }}>
                    Earn points for every contribution. Climb the leaderboard and unlock rewards as a top contributor.
                  </p>
                </div>
                <div className="book-page-edge" />
              </div>

              {/* Turning page: Feature 3 — Contribute */}
              <div
                ref={el => { turningPageRefs.current[2] = el; }}
                className="book-page-turning"
                style={{ zIndex: 2 }}
              >
                <div className="book-page-face book-page-face--front">
                  <div
                    ref={el => { featureContentRefs.current[2] = el; }}
                    className="book-page-inner"
                  >
                    <div className="book-reveal-el w-10 h-10 rounded-xl bg-ink/8 flex items-center justify-center mb-4" style={{ opacity: 0 }}>
                      <Upload className="w-5 h-5 text-ink" />
                    </div>
                    <div className="book-reveal-el text-[10px] font-semibold tracking-widest uppercase text-taupe-400 mb-1" style={{ opacity: 0 }}>3 of 4</div>
                    <h3 className="book-reveal-el text-lg font-bold text-ink mb-2" style={{ opacity: 0 }}>Contribute</h3>
                    <p className="book-reveal-el text-sm text-taupe-600 leading-relaxed" style={{ opacity: 0 }}>
                      Share your notes, study guides, and practice tests. Help others while building your own understanding.
                    </p>
                  </div>
                  <div className="book-page-edge" />
                </div>
                <div className="book-page-face book-page-face--back">
                  <div className="book-page-lines" />
                  <div className="book-page-back-label">Contribute</div>
                </div>
              </div>

              {/* Turning page: Feature 2 — Practice Questions */}
              <div
                ref={el => { turningPageRefs.current[1] = el; }}
                className="book-page-turning"
                style={{ zIndex: 3 }}
              >
                <div className="book-page-face book-page-face--front">
                  <div
                    ref={el => { featureContentRefs.current[1] = el; }}
                    className="book-page-inner"
                  >
                    <div className="book-reveal-el w-10 h-10 rounded-xl bg-ink/8 flex items-center justify-center mb-4" style={{ opacity: 0 }}>
                      <Target className="w-5 h-5 text-ink" />
                    </div>
                    <div className="book-reveal-el text-[10px] font-semibold tracking-widest uppercase text-taupe-400 mb-1" style={{ opacity: 0 }}>2 of 4</div>
                    <h3 className="book-reveal-el text-lg font-bold text-ink mb-2" style={{ opacity: 0 }}>Practice Questions</h3>
                    <p className="book-reveal-el text-sm text-taupe-600 leading-relaxed" style={{ opacity: 0 }}>
                      Test your knowledge with real AP-style questions across all subjects. Get instant feedback and explanations.
                    </p>
                  </div>
                  <div className="book-page-edge" />
                </div>
                <div className="book-page-face book-page-face--back">
                  <div className="book-page-lines" />
                  <div className="book-page-back-label">Practice</div>
                </div>
              </div>

              {/* Turning page: Feature 1 — Subject Pages */}
              <div
                ref={el => { turningPageRefs.current[0] = el; }}
                className="book-page-turning"
                style={{ zIndex: 4 }}
              >
                <div className="book-page-face book-page-face--front">
                  <div
                    ref={el => { featureContentRefs.current[0] = el; }}
                    className="book-page-inner"
                  >
                    <div className="book-reveal-el w-10 h-10 rounded-xl bg-ink/8 flex items-center justify-center mb-4" style={{ opacity: 0 }}>
                      <Layers className="w-5 h-5 text-ink" />
                    </div>
                    <div className="book-reveal-el text-[10px] font-semibold tracking-widest uppercase text-taupe-400 mb-1" style={{ opacity: 0 }}>1 of 4</div>
                    <h3 className="book-reveal-el text-lg font-bold text-ink mb-2" style={{ opacity: 0 }}>Subject Pages</h3>
                    <p className="book-reveal-el text-sm text-taupe-600 leading-relaxed" style={{ opacity: 0 }}>
                      Dedicated pages for each AP subject with curated resources, study guides, and practice materials.
                    </p>
                  </div>
                  <div className="book-page-edge" />
                </div>
                <div className="book-page-face book-page-face--back">
                  <div className="book-page-lines" />
                  <div className="book-page-back-label">Subjects</div>
                </div>
              </div>

              {/* Cover — topmost, turns first */}
              <div
                ref={coverRef}
                className="book-page-turning"
                style={{ zIndex: 5 }}
              >
                <div className="book-page-face book-page-face--front book-cover-front">
                  <div className="flex flex-col items-center justify-center h-full gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-parchment/15 border border-parchment/25 flex items-center justify-center">
                      <BookOpen className="w-7 h-7 text-parchment" />
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-parchment tracking-tight">Prepd</div>
                      <div className="text-[10px] text-parchment/55 mt-1.5 tracking-[0.18em] uppercase">AP Study Guide</div>
                    </div>
                  </div>
                  <div className="absolute bottom-5 right-5 text-parchment/25 text-[10px] tracking-widest">2025 Edition</div>
                  <div className="absolute left-4 top-6 bottom-6 w-px bg-parchment/10" />
                </div>
                <div className="book-page-face book-page-face--back">
                  <div className="book-page-lines" />
                </div>
              </div>

            </div>
          </div>

          {/* Progress dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                ref={el => { progressDotRefs.current[i] = el; }}
                className="book-progress-dot"
              />
            ))}
          </div>

          {/* Bottom fade into CTA */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-parchment to-transparent pointer-events-none" />
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
