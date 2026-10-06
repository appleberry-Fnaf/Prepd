import { useEffect, useRef } from 'react';
import { Calculator, FlaskConical, Landmark, BookOpen, Globe, Code } from 'lucide-react';

const FACES = [
  {
    id: 'front',
    label: 'Mathematics',
    sub: 'Calc · Stats · Precalc',
    Icon: Calculator,
    bg: 'linear-gradient(145deg, #0c1f42 0%, #162d60 100%)',
    glow: '#3b82f6',
    accent: '#60a5fa',
    transform: 'translateZ(110px)',
  },
  {
    id: 'right',
    label: 'Sciences',
    sub: 'Bio · Chem · Physics',
    Icon: FlaskConical,
    bg: 'linear-gradient(145deg, #082018 0%, #0d3022 100%)',
    glow: '#22c55e',
    accent: '#4ade80',
    transform: 'rotateY(90deg) translateZ(110px)',
  },
  {
    id: 'back',
    label: 'History',
    sub: 'US · World · Gov & Politics',
    Icon: Landmark,
    bg: 'linear-gradient(145deg, #281400 0%, #3a1e00 100%)',
    glow: '#f59e0b',
    accent: '#fbbf24',
    transform: 'rotateY(180deg) translateZ(110px)',
  },
  {
    id: 'left',
    label: 'English',
    sub: 'Lang & Comp · Lit & Comp',
    Icon: BookOpen,
    bg: 'linear-gradient(145deg, #18082e 0%, #260f48 100%)',
    glow: '#8b5cf6',
    accent: '#a78bfa',
    transform: 'rotateY(-90deg) translateZ(110px)',
  },
  {
    id: 'top',
    label: 'Languages',
    sub: 'Spanish · French · Latin',
    Icon: Globe,
    bg: 'linear-gradient(145deg, #280a18 0%, #3a1028 100%)',
    glow: '#f43f5e',
    accent: '#fb7185',
    transform: 'rotateX(90deg) translateZ(110px)',
  },
  {
    id: 'bottom',
    label: 'Computer Science',
    sub: 'CS A · CS Principles',
    Icon: Code,
    bg: 'linear-gradient(145deg, #051520 0%, #091f2e 100%)',
    glow: '#06b6d4',
    accent: '#22d3ee',
    transform: 'rotateX(-90deg) translateZ(110px)',
  },
] as const;

export default function SubjectCube() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId: number;
    let angle = 0;
    let mx = 0, my = 0;
    let lx = 0, ly = 0;

    function onMouseMove(e: MouseEvent) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    function tick() {
      if (!reduced) angle += 0.28;
      lx += (mx - lx) * 0.055;
      ly += (my - ly) * 0.055;
      const tiltX = ly * -22;
      const tiltY = lx * 22;
      cube.style.transform = `rotateX(${-14 + tiltX}deg) rotateY(${angle + tiltY}deg)`;
      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="cube-container" aria-hidden="true">
      <div className="cube-wrapper">
        <div className="cube-bloom" />
        <div ref={cubeRef} className="cube-body">
          {FACES.map(({ id, label, sub, Icon, bg, glow, accent, transform }) => (
            <div
              key={id}
              className="cube-face"
              style={{
                transform,
                background: bg,
                ['--face-glow' as string]: glow,
              }}
            >
              <Icon className="w-11 h-11 flex-shrink-0" style={{ color: accent }} />
              <span className="cube-face-label">{label}</span>
              <span className="cube-face-sub">{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
