import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

interface BlueprintOverlayProps {
  annotations: string[];
  visible: boolean;
}

// Three label positions clockwise: top-center, right, bottom-center
const POSITIONS = [
  'ah-bp-label--n',
  'ah-bp-label--e',
  'ah-bp-label--s',
] as const;

export default function BlueprintOverlay({ annotations, visible }: BlueprintOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const labels = el.querySelectorAll('.ah-bp-label');
    if (visible) {
      animate(labels, {
        opacity:    [0, 1],
        translateY: [(i: number) => (i === 0 ? -10 : i === 2 ? 10 : 0), 0],
        translateX: [(i: number) => (i === 1 ? 10 : 0), 0],
        duration:   500,
        delay:      stagger(80, { start: 80 }),
        ease:       'outExpo',
      });
    } else {
      animate(labels, {
        opacity:  [1, 0],
        duration: 200,
        ease:     'inQuad',
      });
    }
  }, [visible]);

  return (
    <div
      ref={containerRef}
      className="ah-bp-overlay"
      aria-hidden="true"
    >
      {/* SVG leader lines */}
      <svg className="ah-bp-lines" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* North: from (50,50) up to (50, 22) */}
        <line x1="50" y1="36" x2="50" y2="26" strokeDasharray="2 2" />
        {/* East: from (50,50) right to (74, 50) */}
        <line x1="64" y1="50" x2="74" y2="50" strokeDasharray="2 2" />
        {/* South: from (50,50) down to (50, 74) */}
        <line x1="50" y1="64" x2="50" y2="74" strokeDasharray="2 2" />
      </svg>

      {annotations.slice(0, 3).map((label, i) => (
        <div
          key={i}
          className={`ah-bp-label ${POSITIONS[i]}`}
          style={{ opacity: 0 }}
        >
          <span className="ah-bp-label-num">0{i + 1}</span>
          <span className="ah-bp-label-text">{label}</span>
        </div>
      ))}
    </div>
  );
}
