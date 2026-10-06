export const BG_DARK   = '#1e1c1a';
export const BG_LIGHT  = '#d9d2cb';

export const ACCENT = {
  subjects:    '#60a5fa',
  practice:    '#4ade80',
  contribute:  '#fbbf24',
  leaderboard: '#a78bfa',
} as const;

// Arc segment colors for the ring (6 segments, order: red → orange → yellow → green → cyan → blue)
export const RING_ARC_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
] as const;

export const SCROLL_VH       = 900;
export const SCENE_COUNT     = 7;
export const EXPLODE_AMOUNT  = 1.5;
export const MOUSE_TILT_MAX  = 5;
export const MOUSE_LERP      = 0.05;
export const SCROLL_SMOOTH   = 0.09;
export const MAX_DPR         = 2;

// Scene definitions (index 0 = hero)
export const SCENES = [
  {
    key: 'hero',
    bg: BG_DARK,
    accent: null as string | null,
    heading: 'The free AP study\nplatform, built by students.',
    subtext: '15 subjects. Real practice. Zero cost.',
    card: null as string | null,
    link: null as string | null,
    linkLabel: null as string | null,
    ringActive: [0, 1, 2, 3, 4, 5] as number[],
  },
  {
    key: 'subjects',
    bg: BG_DARK,
    accent: ACCENT.subjects,
    heading: 'Every AP subject,\norganized.',
    subtext: 'Browse curated notes, guides, and past tests for all 15 AP courses — sorted by category, searchable in seconds.',
    card: '15 courses · 4 categories\nNotes · Guides · Practice Tests',
    link: '/subjects',
    linkLabel: 'Browse subjects →',
    ringActive: [4, 5] as number[],
  },
  {
    key: 'practice',
    bg: BG_DARK,
    accent: ACCENT.practice,
    heading: 'Practice like\nit\'s the real exam.',
    subtext: 'AP-style multiple choice with instant feedback and step-by-step explanations. Track your accuracy over time.',
    card: 'easy · medium · hard\ninstant feedback · track accuracy',
    link: '/practice',
    linkLabel: 'Start practicing →',
    ringActive: [3] as number[],
  },
  {
    key: 'blueprint-a',
    bg: BG_LIGHT,
    accent: null,
    heading: 'How Prepd works.',
    subtext: 'Browse subjects → practice questions → track your progress.',
    card: null,
    link: null,
    linkLabel: null,
    ringActive: [0, 1, 2, 3, 4, 5] as number[],
  },
  {
    key: 'contribute',
    bg: BG_DARK,
    accent: ACCENT.contribute,
    heading: 'Share your work.\nEarn real credit.',
    subtext: 'Upload notes and study guides. Approved submissions earn you points and verified volunteer hours for college apps.',
    card: 'submit → review → publish\nearn volunteer hours',
    link: '/contribute',
    linkLabel: 'Start contributing →',
    ringActive: [2] as number[],
  },
  {
    key: 'leaderboard',
    bg: BG_DARK,
    accent: ACCENT.leaderboard,
    heading: 'Rise through\nthe ranks.',
    subtext: 'Every contribution earns points. See where you stand, compete with your school, and unlock recognition tiers.',
    card: 'submit +10 · approved +25\nupvote +5 · answer +2–5',
    link: '/leaderboard',
    linkLabel: 'View leaderboard →',
    ringActive: [0, 1] as number[],
  },
  {
    key: 'blueprint-b',
    bg: BG_LIGHT,
    accent: null,
    heading: 'The Prepd loop.',
    subtext: 'Submit resources → moderated for quality → published for everyone → study, repeat.',
    card: null,
    link: null,
    linkLabel: null,
    ringActive: [0, 1, 2, 3, 4, 5] as number[],
  },
] as const;

// AP subjects for the ending grid
export const AP_SUBJECTS = [
  { name: 'Calculus AB/BC', slug: 'calculus', category: 'Math & CS' },
  { name: 'Statistics', slug: 'statistics', category: 'Math & CS' },
  { name: 'Computer Science A', slug: 'computer-science-a', category: 'Math & CS' },
  { name: 'Biology', slug: 'biology', category: 'Sciences' },
  { name: 'Chemistry', slug: 'chemistry', category: 'Sciences' },
  { name: 'Physics', slug: 'physics', category: 'Sciences' },
  { name: 'English Language', slug: 'english-language', category: 'English' },
  { name: 'English Literature', slug: 'english-literature', category: 'English' },
  { name: 'US History', slug: 'us-history', category: 'History' },
  { name: 'World History', slug: 'world-history', category: 'History' },
  { name: 'US Government', slug: 'us-government', category: 'History' },
  { name: 'Spanish Language', slug: 'spanish-language', category: 'Languages' },
] as const;
