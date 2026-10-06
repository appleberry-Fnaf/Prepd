export const BG_DARK   = '#1e1c1a';
export const BG_LIGHT  = '#d9d2cb';

export const ACCENT = {
  subjects:    '#60a5fa',
  practice:    '#4ade80',
  contribute:  '#fbbf24',
  leaderboard: '#a78bfa',
} as const;

// Arc segment colors for the ring (6 segments: red → orange → yellow → green → cyan → blue)
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

export interface Scene {
  key:         string;
  bg:          string;
  accent:      string | null;
  tag:         string | null;
  heading:     string;
  subtext:     string;
  steps:       string[] | null;
  // Short labels that float around the ring in blueprint scenes
  annotations: string[] | null;
  card:        string | null;
  link:        string | null;
  linkLabel:   string | null;
  ringActive:  number[];
}

export const SCENES: Scene[] = [
  {
    key:         'hero',
    bg:          BG_DARK,
    accent:      null,
    tag:         null,
    heading:     'The free AP study\nplatform, built by students.',
    subtext:     '15 subjects. Real practice. Zero cost.',
    steps:       null,
    annotations: null,
    card:        null,
    link:        null,
    linkLabel:   null,
    ringActive:  [0, 1, 2, 3, 4, 5],
  },
  {
    key:         'subjects',
    bg:          BG_DARK,
    accent:      ACCENT.subjects,
    tag:         '01 / Subjects',
    heading:     'Every AP subject,\norganized.',
    subtext:     'Browse curated notes, guides, and practice tests for all 15 AP courses — sorted by category, searchable in seconds.',
    steps:       null,
    annotations: null,
    card:        '15 courses · 4 categories\nNotes · Guides · Practice Tests',
    link:        '/subjects',
    linkLabel:   'Browse subjects →',
    ringActive:  [4, 5],
  },
  {
    key:         'practice',
    bg:          BG_DARK,
    accent:      ACCENT.practice,
    tag:         '02 / Practice',
    heading:     'Practice like\nit\'s the real exam.',
    subtext:     'AP-style multiple choice with instant feedback and step-by-step explanations. Track your accuracy over time.',
    steps:       null,
    annotations: null,
    card:        'easy · medium · hard\ninstant feedback · track accuracy',
    link:        '/practice',
    linkLabel:   'Start practicing →',
    ringActive:  [3],
  },
  {
    key:         'blueprint-a',
    bg:          BG_LIGHT,
    accent:      null,
    tag:         null,
    heading:     'How Prepd works.',
    subtext:     'Three steps — that\'s all it takes to go from lost to prepared.',
    steps:       ['Browse a subject', 'Answer practice questions', 'Track your progress'],
    annotations: ['AP Resources', 'Practice', 'Progress'],
    card:        null,
    link:        null,
    linkLabel:   null,
    ringActive:  [0, 1, 2, 3, 4, 5],
  },
  {
    key:         'contribute',
    bg:          BG_DARK,
    accent:      ACCENT.contribute,
    tag:         '03 / Contribute',
    heading:     'Share your work.\nEarn real credit.',
    subtext:     'Upload notes and study guides. Approved submissions earn you points and verified volunteer hours — good for college apps.',
    steps:       null,
    annotations: null,
    card:        'submit → review → publish\nearn volunteer hours',
    link:        '/contribute',
    linkLabel:   'Start contributing →',
    ringActive:  [2],
  },
  {
    key:         'leaderboard',
    bg:          BG_DARK,
    accent:      ACCENT.leaderboard,
    tag:         '04 / Leaderboard',
    heading:     'Rise through\nthe ranks.',
    subtext:     'Every contribution earns points. See where you stand, compete with your school, and unlock recognition tiers.',
    steps:       null,
    annotations: null,
    card:        'submit +10 · approved +25\nupvote +5 · answer +2–5 pts',
    link:        '/leaderboard',
    linkLabel:   'View leaderboard →',
    ringActive:  [0, 1],
  },
  {
    key:         'blueprint-b',
    bg:          BG_LIGHT,
    accent:      null,
    tag:         null,
    heading:     'The Prepd loop.',
    subtext:     'Student-submitted content, reviewed for quality, published for everyone.',
    steps:       ['Submit notes or study guides', 'Moderators review for quality', 'Published to the community'],
    annotations: ['Contribute', 'Moderate', 'Publish'],
    card:        null,
    link:        null,
    linkLabel:   null,
    ringActive:  [0, 1, 2, 3, 4, 5],
  },
];

// AP subjects for the ending grid
export const AP_SUBJECTS = [
  { name: 'Calculus AB/BC',     slug: 'calculus',           category: 'Math & CS' },
  { name: 'Statistics',         slug: 'statistics',         category: 'Math & CS' },
  { name: 'Computer Science A', slug: 'computer-science-a', category: 'Math & CS' },
  { name: 'Biology',            slug: 'biology',            category: 'Sciences'  },
  { name: 'Chemistry',          slug: 'chemistry',          category: 'Sciences'  },
  { name: 'Physics',            slug: 'physics',            category: 'Sciences'  },
  { name: 'English Language',   slug: 'english-language',   category: 'English'   },
  { name: 'English Literature', slug: 'english-literature', category: 'English'   },
  { name: 'US History',         slug: 'us-history',         category: 'History'   },
  { name: 'World History',      slug: 'world-history',      category: 'History'   },
  { name: 'US Government',      slug: 'us-government',      category: 'History'   },
  { name: 'Spanish Language',   slug: 'spanish-language',   category: 'Languages' },
] as const;
