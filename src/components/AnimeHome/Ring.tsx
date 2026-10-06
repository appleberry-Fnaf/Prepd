import { useRef, useEffect } from 'react';
import { RING_ARC_COLORS } from './constants';

interface RingProps {
  activeSegments?: number[];
  accent?: string | null;
}

const SIZE = 560;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER = 248;
const INNER = 200;
const GAP_DEG = 3;
const TICK_COUNT = 60;
const TICK_INNER = INNER - 8;
const TICK_OUTER = INNER - 2;
const SEGS = RING_ARC_COLORS.length;
const SEG_SPAN = (360 - SEGS * GAP_DEG) / SEGS;

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, ri: number, ro: number, startDeg: number, endDeg: number) {
  const si = polarToXY(cx, cy, ri, startDeg);
  const ei = polarToXY(cx, cy, ri, endDeg);
  const so = polarToXY(cx, cy, ro, startDeg);
  const eo = polarToXY(cx, cy, ro, endDeg);
  const lg = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${so.x} ${so.y}`,
    `A ${ro} ${ro} 0 ${lg} 1 ${eo.x} ${eo.y}`,
    `L ${ei.x} ${ei.y}`,
    `A ${ri} ${ri} 0 ${lg} 0 ${si.x} ${si.y}`,
    'Z',
  ].join(' ');
}

export default function Ring({ activeSegments, accent }: RingProps) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const active = activeSegments ?? [0, 1, 2, 3, 4, 5];
    pathRefs.current.forEach((el, i) => {
      if (!el) return;
      const isActive = active.includes(i);
      const color = accent && isActive ? accent : isActive ? RING_ARC_COLORS[i] : 'rgba(255,255,255,0.08)';
      el.style.fill = color;
      el.style.opacity = isActive ? '1' : '0.35';
    });
  }, [activeSegments, accent]);

  const segments = Array.from({ length: SEGS }, (_, i) => {
    const startDeg = i * (SEG_SPAN + GAP_DEG);
    const endDeg = startDeg + SEG_SPAN;
    return { startDeg, endDeg, color: RING_ARC_COLORS[i] };
  });

  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const angle = (i / TICK_COUNT) * 360;
    const a = polarToXY(CX, CY, TICK_INNER, angle);
    const b = polarToXY(CX, CY, TICK_OUTER, angle);
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  });

  return (
    <svg
      className="ah-ring"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
      style={{ width: SIZE, height: SIZE }}
    >
      {/* Arc segments */}
      {segments.map(({ startDeg, endDeg, color }, i) => (
        <path
          key={i}
          ref={(el) => { pathRefs.current[i] = el; }}
          d={arcPath(CX, CY, INNER, OUTER, startDeg, endDeg)}
          fill={color}
          style={{ transition: 'fill 0.6s ease, opacity 0.6s ease' }}
        />
      ))}
      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />
      ))}
      {/* Inner dot */}
      <circle cx={CX} cy={CY} r="4" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}
