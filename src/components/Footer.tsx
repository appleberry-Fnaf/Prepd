import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-taupe-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-parchment flex items-center justify-center">
                <Compass className="w-4 h-4 text-ink" />
              </div>
              <span className="text-lg font-bold text-parchment">Prepd</span>
            </Link>
            <p className="text-sm text-stone-300 leading-relaxed">
              Making AP preparation more accessible, organized, and effective for students everywhere.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-parchment text-sm mb-3">Explore</h4>
            <ul className="space-y-2">
              <li><Link to="/subjects" className="text-sm text-stone-300 hover:text-parchment transition-colors">Subjects</Link></li>
              <li><Link to="/practice" className="text-sm text-stone-300 hover:text-parchment transition-colors">Practice</Link></li>
              <li><Link to="/leaderboard" className="text-sm text-stone-300 hover:text-parchment transition-colors">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-parchment text-sm mb-3">Contribute</h4>
            <ul className="space-y-2">
              <li><Link to="/contribute" className="text-sm text-stone-300 hover:text-parchment transition-colors">Submit Resources</Link></li>
              <li><Link to="/contribute" className="text-sm text-stone-300 hover:text-parchment transition-colors">Share Study Guides</Link></li>
              <li><Link to="/contribute" className="text-sm text-stone-300 hover:text-parchment transition-colors">Upload Notes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-parchment text-sm mb-3">Community</h4>
            <ul className="space-y-2">
              <li><Link to="/leaderboard" className="text-sm text-stone-300 hover:text-parchment transition-colors">Top Contributors</Link></li>
              <li><Link to="/profile" className="text-sm text-stone-300 hover:text-parchment transition-colors">Your Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-taupe-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-500">2026 Prepd. Built for AP students.</p>
          <div className="flex items-center gap-6">
            <Link to="/subjects" className="text-sm text-stone-500 hover:text-stone-300 transition-colors">Subjects</Link>
            <Link to="/practice" className="text-sm text-stone-500 hover:text-stone-300 transition-colors">Practice</Link>
            <Link to="/contribute" className="text-sm text-stone-500 hover:text-stone-300 transition-colors">Contribute</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
