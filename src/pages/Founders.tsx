import { Link } from 'react-router-dom';
import { Sparkles, Heart, ArrowRight } from 'lucide-react';
import './founders.css';

interface Founder {
  name: string;
  short: string;
  role: string;
  photo: string;
  accent: string;
  bio: string[];
}

const FOUNDERS: Founder[] = [
  {
    name: 'Sai Sahaana Aswanth',
    short: 'Sai',
    role: 'Founder',
    photo: '/founders/sai.webp',
    accent: '#60a5fa',
    bio: [
      'My name is Sai Sahaana Aswanth, but I go by Sai. I’m a high school student passionate about pursuing a career in biomedical engineering and creating opportunities that make a meaningful difference in people’s everyday lives.',
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
    accent: '#a855f7',
    bio: [
      'My name is Sahana Lakshminarasimhan, and I’m a high school student passionate about education, collaboration, and creating opportunities that help others succeed.',
      'I believe that every student deserves access to the resources and support they need to reach their full potential. However, finding effective study materials and preparing for exams can sometimes feel overwhelming. This inspired me to support initiatives like Prepd which aim to make learning more accessible for students.',
      'Through this initiative, I hope to encourage students to learn from one another, share resources, and approach their academic goals with greater confidence.',
    ],
  },
];

export default function Founders() {
  return (
    <div>
      <div className="dk-header">
        <span className="dk-page-tag">About</span>
        <h1 className="dk-heading-xl">Meet the<br />founders.</h1>
        <p className="dk-sub" style={{ maxWidth: 520 }}>
          Prepd is built and run by students — here are the two who started it.
        </p>
      </div>

      <div className="dk-container" style={{ paddingBottom: 'clamp(64px, 10vh, 100px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(32px, 6vh, 64px)' }}>
          {FOUNDERS.map((f, i) => (
            <div
              key={f.name}
              className="dk-card founder-card"
              style={{
                display: 'grid',
                gap: 'clamp(20px, 4vw, 44px)',
                padding: 'clamp(22px, 3vw, 36px)',
                alignItems: 'center',
                // alternate photo side on wide screens
                direction: i % 2 === 1 ? 'rtl' : 'ltr',
              }}
            >
              {/* Photo */}
              <div className="founder-photo" style={{ direction: 'ltr', position: 'relative' }}>
                <div style={{
                  aspectRatio: '1 / 1',
                  borderRadius: 18,
                  overflow: 'hidden',
                  border: `2px solid ${f.accent}33`,
                  boxShadow: `0 10px 40px -12px ${f.accent}55`,
                }}>
                  <img
                    src={f.photo}
                    alt={f.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>

              {/* Text */}
              <div style={{ direction: 'ltr', minWidth: 0 }}>
                <span
                  className="dk-badge"
                  style={{ background: `${f.accent}1f`, color: f.accent, border: `1px solid ${f.accent}44`, marginBottom: 12 }}
                >
                  {f.role === 'Founder' ? <Sparkles className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
                  {f.role}
                </span>
                <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: 'var(--ah-text)', letterSpacing: '-0.02em', marginBottom: 2 }}>
                  {f.name}
                </h2>
                <p style={{ fontFamily: 'var(--ah-mono)', fontSize: 12, color: 'var(--ah-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                  Goes by {f.short}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {f.bio.map((para, j) => (
                    <p key={j} style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ah-muted)' }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
