import { useEffect, useState } from 'react';
import HomeNavbar from './HomeNavbar';
import HeroStage from './HeroStage';
import EndingSection from './EndingSection';

export default function AnimeHomePage() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    document.body.classList.add('ah-page-body');
    return () => document.body.classList.remove('ah-page-body');
  }, []);

  return (
    <div className="ah-page">
      <HomeNavbar revealed={revealed} />
      <main>
        <HeroStage revealed={revealed} onReveal={() => setRevealed(true)} />
        {revealed && <EndingSection />}
      </main>
    </div>
  );
}
