import { useEffect } from 'react';
import HomeNavbar from './HomeNavbar';
import HeroStage from './HeroStage';
import EndingSection from './EndingSection';

export default function AnimeHomePage() {
  useEffect(() => {
    document.body.classList.add('ah-page-body');
    return () => document.body.classList.remove('ah-page-body');
  }, []);

  return (
    <div className="ah-page">
      <HomeNavbar />
      <main>
        <HeroStage />
        <EndingSection />
      </main>
    </div>
  );
}
