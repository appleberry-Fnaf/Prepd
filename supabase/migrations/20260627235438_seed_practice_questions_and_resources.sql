/*
# Prepd - Seed Practice Questions and Sample Resources

1. Modified Tables
- Inserts practice questions for AP Calculus AB, AP Biology, AP US History, and AP English Language
- Inserts sample approved resources for multiple subjects

2. Important Notes
- Questions are multiple-choice with options stored as JSONB
- Resources are seeded as sample data for browsing
*/

INSERT INTO practice_questions (subject_id, question, options, correct_answer, explanation, difficulty) VALUES
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-calculus-ab'),
    'What is the derivative of f(x) = 3x² + 5x - 7?',
    '["6x + 5", "6x + 5x - 7", "3x + 5", "6x² + 5"]',
    '6x + 5',
    'Using the power rule: d/dx(3x²) = 6x, d/dx(5x) = 5, d/dx(-7) = 0. So f''(x) = 6x + 5.',
    'medium'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-calculus-ab'),
    'Evaluate the integral ∫ 2x dx from 0 to 3.',
    '["6", "9", "3", "18"]',
    '9',
    '∫ 2x dx = x². Evaluating from 0 to 3: 3² - 0² = 9.',
    'easy'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-calculus-ab'),
    'What is the limit of (sin x)/x as x approaches 0?',
    '["0", "1", "∞", "undefined"]',
    '1',
    'This is a fundamental limit. Using L''Hôpital''s rule or the Taylor series, lim(x→0) (sin x)/x = 1.',
    'medium'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-biology'),
    'Which organelle is responsible for cellular respiration in eukaryotic cells?',
    '["Chloroplast", "Mitochondria", "Ribosome", "Nucleus"]',
    'Mitochondria',
    'Mitochondria are the powerhouses of the cell, producing ATP through cellular respiration.',
    'easy'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-biology'),
    'During which phase of mitosis do the chromosomes align at the metaphase plate?',
    '["Prophase", "Metaphase", "Anaphase", "Telophase"]',
    'Metaphase',
    'In metaphase, chromosomes line up along the cell equator (metaphase plate) before being separated.',
    'medium'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-biology'),
    'Which of the following is NOT a nitrogenous base found in DNA?',
    '["Adenine", "Uracil", "Thymine", "Guanine"]',
    'Uracil',
    'Uracil is found in RNA instead of thymine. DNA contains A, T, G, and C.',
    'medium'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-us-history'),
    'Which event directly triggered the United States entry into World War II?',
    '["The sinking of the Lusitania", "The attack on Pearl Harbor", "The Zimmerman Telegram", "The assassination of Archduke Franz Ferdinand"]',
    'The attack on Pearl Harbor',
    'Japan attacked Pearl Harbor on December 7, 1941, leading the US to declare war the next day.',
    'easy'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-us-history'),
    'What was the primary purpose of the Federalist Papers?',
    '["To declare independence from Britain", "To ratify the Constitution", "To abolish slavery", "To establish the Bill of Rights"]',
    'To ratify the Constitution',
    'Written by Hamilton, Madison, and Jay, the Federalist Papers argued for ratification of the Constitution.',
    'medium'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-us-history'),
    'The Great Compromise (Connecticut Compromise) resolved which dispute at the Constitutional Convention?',
    '["Slavery vs. abolition", "Large state vs. small state representation", "Federal vs. state power", "Executive vs. legislative power"]',
    'Large state vs. small state representation',
    'The Great Compromise created a bicameral legislature with proportional representation in the House and equal representation in the Senate.',
    'hard'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-english-language'),
    'In rhetorical analysis, ethos refers to:',
    '["Emotional appeal", "Logical appeal", "Credibility/ethical appeal", "Structural appeal"]',
    'Credibility/ethical appeal',
    'Ethos is one of Aristotle''s rhetorical appeals and refers to the speaker''s credibility or ethical character.',
    'easy'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-english-language'),
    'Which rhetorical device involves repeating the same word or phrase at the beginning of successive clauses?',
    '["Epistrophe", "Anaphora", "Chiasmus", "Antithesis"]',
    'Anaphora',
    'Anaphora is the repetition of a word or phrase at the beginning of successive clauses (e.g., "I have a dream...").',
    'medium'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-english-language'),
    'The purpose of a synthesis essay is to:',
    '["Analyze a single source in depth", "Combine multiple sources to support an argument", "Narrate a personal experience", "Compare two works of literature"]',
    'Combine multiple sources to support an argument',
    'Synthesis essays require combining information from multiple sources to construct a coherent argument.',
    'medium'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-statistics'),
    'In a normal distribution, what percentage of data falls within one standard deviation of the mean?',
    '["50%", "68%", "95%", "99.7%"]',
    '68%',
    'The empirical rule states approximately 68% of data falls within one standard deviation, 95% within two, and 99.7% within three.',
    'easy'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-chemistry'),
    'What is the electron configuration for oxygen?',
    '["1s² 2s² 2p⁴", "1s² 2s² 2p⁶", "1s² 2s² 2p²", "1s² 2s¹ 2p⁵"]',
    '1s² 2s² 2p⁴',
    'Oxygen has 8 electrons: 2 in the 1s orbital, 2 in the 2s orbital, and 4 in the 2p orbital.',
    'easy'
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-psychology'),
    'Which brain structure is primarily responsible for regulating emotion and memory?',
    '["Cerebellum", "Hippocampus", "Amygdala", "Medulla oblongata"]',
    'Amygdala',
    'The amygdala plays a key role in processing emotions, especially fear, and is involved in memory formation.',
    'medium'
  );

-- Seed sample resources
INSERT INTO resources (subject_id, user_id, title, description, type, external_url, upvotes, is_featured) VALUES
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-calculus-ab'),
    '00000000-0000-0000-0000-000000000000',
    'Calculus AB Formula Sheet',
    'Complete formula reference covering derivatives, integrals, and key theorems',
    'guide',
    'https://example.com/calc-formulas',
    42,
    true
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-calculus-ab'),
    '00000000-0000-0000-0000-000000000000',
    'Unit 1-8 Comprehensive Notes',
    'Detailed notes covering all eight units of AP Calculus AB',
    'notes',
    'https://example.com/calc-notes',
    35,
    false
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-biology'),
    '00000000-0000-0000-0000-000000000000',
    'Cell Structure and Function Guide',
    'Visual guide to organelles and their functions with diagrams',
    'guide',
    'https://example.com/bio-cells',
    28,
    true
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-us-history'),
    '00000000-0000-0000-0000-000000000000',
    'Period 1-5 Timeline',
    'Interactive timeline of key events from colonization to Reconstruction',
    'notes',
    'https://example.com/ush-timeline',
    19,
    false
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-english-language'),
    '00000000-0000-0000-0000-000000000000',
    'Rhetorical Analysis Framework',
    'Step-by-step framework for analyzing rhetorical strategies',
    'guide',
    'https://example.com/eng-rhetoric',
    22,
    true
  ),
  (
    (SELECT id FROM ap_subjects WHERE slug = 'ap-statistics'),
    '00000000-0000-0000-0000-000000000000',
    'Inference Procedures Flowchart',
    'Decision tree for choosing the correct statistical test',
    'guide',
    'https://example.com/stats-flowchart',
    15,
    false
  );
