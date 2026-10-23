import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { animate } from 'animejs';
import { CatMark } from '../Logo';

interface Props { revealed: boolean }

export default function HomeNavbar({ revealed }: Props) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!revealed || !navRef.current) return;
    animate(navRef.current, {
      opacity: [0, 1],
      translateY: [-14, 0],
      duration: 600,
      ease: 'outExpo',
    });
  }, [revealed]);

  return (
    <nav ref={navRef} className="ah-nav" style={{ opacity: 0 }} aria-label="Site navigation">
      <Link to="/" className="ah-nav-brand" aria-label="Prepd home">
        <CatMark className="w-7 h-7" />
        <span>Prepd</span>
      </Link>
      <div className="ah-nav-links" role="list">
        <Link to="/subjects" role="listitem">Subjects</Link>
        <Link to="/practice" role="listitem">Practice</Link>
        <Link to="/contribute" role="listitem">Contribute</Link>
      </div>
      <Link to="/subjects" className="ah-nav-cta">
        Start free
      </Link>
    </nav>
  );
}
