import { useEffect, useRef } from 'react';
import { animate, scrambleText } from 'animejs';

export function useScrambleTag() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    animate(el, {
      textContent: scrambleText({ chars: 'symbols', from: 'left', ease: 'outExpo', speed: 0.7 }),
      duration: 900,
    });
  }, []);
  return ref;
}
