import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { animate } from 'animejs';
import { createThreeScene, ThreeScene } from './ThreeObject';
import Ring from './Ring';
import ProgressTicker from './ProgressTicker';
import { SCENES, SCROLL_VH, BG_LIGHT } from './constants';

function getScrollProg(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const traveled = -rect.top;
  const total = el.offsetHeight - window.innerHeight;
  return total > 0 ? Math.max(0, Math.min(1, traveled / total)) : 0;
}

function sceneAtProgress(p: number): number {
  return Math.min(SCENES.length - 1, Math.floor(p * SCENES.length));
}

export default function HeroStage() {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const threeRef     = useRef<ThreeScene | null>(null);
  const rafRef       = useRef<number>(0);
  const sceneIdxRef  = useRef<number>(-1);
  const transitRef   = useRef<boolean>(false);
  const pendingRef   = useRef<number | null>(null);
  const textRef      = useRef<HTMLDivElement>(null);

  // Only lightweight state that drives non-animated elements
  const [scrollP,  setScrollP]  = useState(0);
  const [bg,       setBg]       = useState('#1e1c1a');
  const [ringData, setRingData] = useState({ active: [0,1,2,3,4,5] as number[], accent: null as string | null });
  const [sceneIdx, setSceneIdx] = useState(0);

  // ── Animate scene text out → swap content → animate in ──────────────────
  function transitionTo(newIdx: number) {
    const textEl = textRef.current;
    if (!textEl) return;

    // If mid-transition, queue and return
    if (transitRef.current) {
      pendingRef.current = newIdx;
      return;
    }

    transitRef.current = true;

    // Phase 1: exit current text
    animate(textEl, {
      opacity:    [1, 0],
      translateY: [0, -8],
      duration: 160,
      ease: 'inQuad',
    }).then(() => {
      // Phase 2: swap React content
      setSceneIdx(newIdx);
      setRingData({
        active: [...SCENES[newIdx].ringActive] as number[],
        accent: SCENES[newIdx].accent as string | null,
      });
      setBg(SCENES[newIdx].bg as string);

      // Phase 3: enter new text (after React paint)
      requestAnimationFrame(() => {
        animate(textEl, {
          opacity:    [0, 1],
          translateY: [12, 0],
          duration: 420,
          ease: 'outExpo',
        }).then(() => {
          transitRef.current = false;
          if (pendingRef.current !== null) {
            const next = pendingRef.current;
            pendingRef.current = null;
            transitionTo(next);
          }
        });
      });
    });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Hero entrance animation (once, on mount) ──
    if (!reduced && textRef.current) {
      const heading  = textRef.current.querySelector('.ah-scene-heading');
      const sub      = textRef.current.querySelector('.ah-scene-sub');
      const link     = textRef.current.querySelector('.ah-scene-link');
      if (heading) animate(heading, { translateX: [-60, 0], opacity: [0, 1], duration: 900, delay: 400, ease: 'outExpo' });
      if (sub)     animate(sub,     { translateX: [-40, 0], opacity: [0, 1], duration: 900, delay: 560, ease: 'outExpo' });
      if (link)    animate(link,    { opacity: [0, 1], duration: 600, delay: 760 });
    }

    if (reduced) return;

    // ── Three.js ──
    const three = createThreeScene(canvas);
    threeRef.current = three;

    let mx = 0, my = 0;
    function onMouseMove(e: MouseEvent) {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ── rAF loop ──
    function tick() {
      const wrapper = wrapperRef.current;
      if (!wrapper) { rafRef.current = requestAnimationFrame(tick); return; }

      const p   = getScrollProg(wrapper);
      const idx = sceneAtProgress(p);

      three.setScrollProgress(p);
      three.setMouseTilt(mx, my);
      three.setBlueprintMode(SCENES[idx].bg === BG_LIGHT);

      setScrollP(p);

      if (idx !== sceneIdxRef.current) {
        sceneIdxRef.current = idx;
        transitionTo(idx);
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      three.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scene       = SCENES[sceneIdx];
  const isBlueprint = bg === BG_LIGHT;

  return (
    <div ref={wrapperRef} className="ah-scroll-wrapper" style={{ height: `${SCROLL_VH}vh` }}>
      <div className="ah-stage" style={{ background: bg }}>

        {/* Three.js canvas */}
        <canvas ref={canvasRef} className="ah-canvas" aria-hidden="true" />

        {/* Ring */}
        <div className="ah-ring-wrap" aria-hidden="true">
          <Ring activeSegments={ringData.active} accent={ringData.accent} />
        </div>

        {/* Scene text — anime.js controls opacity/translateY, React swaps content */}
        <div
          ref={textRef}
          className={`ah-scene-text ${isBlueprint ? 'ah-scene-text--light' : ''}`}
          aria-live="polite"
          aria-atomic="true"
        >
          <h2 className="ah-scene-heading">
            {scene.heading.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="ah-scene-sub">{scene.subtext}</p>
          {scene.link && scene.linkLabel && (
            <Link to={scene.link} className="ah-scene-link">
              {scene.linkLabel}
            </Link>
          )}
        </div>

        {/* Code card — fades with scene transition */}
        {scene.card && (
          <div className="ah-code-card" aria-label="Feature detail">
            {scene.card.split('\n').map((line, i) => (
              <span key={i} className="ah-code-line">{line}</span>
            ))}
          </div>
        )}

        {/* Progress ticker */}
        <ProgressTicker progress={scrollP} />
      </div>
    </div>
  );
}
