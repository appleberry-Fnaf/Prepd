import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './founders.css';

interface Founder {
  name: string;
  short: string;
  role: string;
  photo: string;
  baby: string;
  accent: string;
  bio: string[];
  photoPos?: string;   // object-position for the pro photo
  photoZoom?: number;  // scale to fill the circle
  babyPos?: string;
  babyZoom?: number;
}

const FOUNDERS: Founder[] = [
  {
    name: 'Sai Sahaana Aswanth',
    short: 'Sai',
    role: 'Founder',
    photo: '/founders/sai.webp',
    baby: '/founders/sai-baby.webp',
    accent: '#60a5fa',
    photoPos: 'center 40%',
    photoZoom: 1.4,
    babyPos: 'center 32%',
    babyZoom: 1,
    bio: [
      'My name is Sai Sahaana Aswanth, but I go by Sai. Ever since I was a little kid, I’ve wanted to help the people around me. This led me to become passionate about pursuing a career in biomedical engineering, and since starting high school, I’ve focused on creating opportunities that make a meaningful difference in people’s everyday lives.',
      'I’ve always been drawn to the question, “What can we do better?” I believe meaningful change starts with recognizing a problem and finding ways to address it.',
      'As a student, I understand that preparing for exams and finding reliable study resources can be challenging. This inspired me to create Prepd, a student-led initiative dedicated to making academic resources more accessible and helping students feel more confident in their learning.',
      'Through this initiative, I hope to build a community where students can support one another, share knowledge, and work toward their goals together. To me, Prepd is one step toward turning a simple question into meaningful action.',
    ],
  },
  {
    name: 'Sahana Lakshminarasimhan',
    short: 'Sahana',
    role: 'Vice Founder',
    photo: '/founders/sahana.webp',
    baby: '/founders/sahana-baby.jpg',
    accent: '#a855f7',
    photoPos: 'center 28%',
    photoZoom: 1.08,
    babyPos: 'center 62%',
    babyZoom: 1.02,
    bio: [
      'My name is Sahana Lakshminarasimhan, and I’m a high school student passionate about education, collaboration, and creating opportunities that help others succeed.',
      'I believe that every student deserves access to the resources and support they need to reach their full potential. However, finding effective study materials and preparing for exams can sometimes feel overwhelming. This inspired me to support initiatives like Prepd which aim to make learning more accessible for students.',
      'Through this initiative, I hope to encourage students to learn from one another, share resources, and approach their academic goals with greater confidence.',
    ],
  },
];

export default function Founders() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const toggle = (name: string) => setFlipped(f => ({ ...f, [name]: !f[name] }));

  return (
    <div>
      <div className="dk-header">
        <span className="dk-page-tag">About</span>
        <h1 className="dk-heading-xl">Meet the<br />founders.</h1>
        <p className="dk-sub" style={{ maxWidth: 520 }}>
          Prepd is run and built by students! Here are the students who made this happen.
        </p>
      </div>

      <div className="dk-container" style={{ paddingBottom: 'clamp(64px, 10vh, 100px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(32px, 6vh, 64px)' }}>
          {FOUNDERS.map((f, i) => {
            const isFlipped = !!flipped[f.name];
            return (
              <div
                key={f.name}
                className="dk-card founder-card"
                style={{
                  display: 'grid',
                  gap: 'clamp(20px, 4vw, 44px)',
                  padding: 'clamp(22px, 3vw, 36px)',
                  alignItems: 'center',
                  direction: i % 2 === 1 ? 'rtl' : 'ltr',
                }}
              >
                {/* Photo — circular flip card */}
                <div className="founder-photo" style={{ direction: 'ltr', ['--accent' as string]: f.accent }}>
                  <div
                    className={`flip ${isFlipped ? 'is-flipped' : ''}`}
                    onClick={() => toggle(f.name)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(f.name); } }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${f.name} — tap to flip between now and baby photo`}
                  >
                    <div className="flip-inner">
                      <div className="flip-face flip-front">
                        <img src={f.photo} alt={f.name}
                          style={{ objectPosition: f.photoPos ?? 'center', transform: `scale(${f.photoZoom ?? 1})` }} />
                      </div>
                      <div className="flip-face flip-back">
                        <img src={f.baby} alt={`${f.short} as a baby`}
                          style={{ objectPosition: f.babyPos ?? 'center', transform: `scale(${f.babyZoom ?? 1})` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div style={{ direction: 'ltr', minWidth: 0 }}>
                  <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: 'var(--ah-text)', letterSpacing: '-0.02em', marginBottom: 16 }}>
                    {f.name}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {f.bio.map((para, j) => (
                      <p key={j} style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ah-muted)' }}>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(40px, 7vh, 72px)' }}>
          <p style={{ fontSize: 15, color: 'var(--ah-muted)', marginBottom: 18 }}>
            Want to be part of the story?
          </p>
          <Link to="/contribute" className="dk-btn dk-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Start contributing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
