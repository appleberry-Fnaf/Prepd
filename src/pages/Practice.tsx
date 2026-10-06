import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { APSubject, PracticeQuestion } from '../lib/supabase';
import { CheckCircle, XCircle, ChevronRight, ArrowRight, BookOpen, Zap } from 'lucide-react';

export default function Practice() {
  const [subjects, setSubjects] = useState<APSubject[]>([]);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [subjectQuestions, setSubjectQuestions] = useState<PracticeQuestion[]>([]);
  const [mode, setMode] = useState<'select' | 'quiz' | 'done'>('select');

  useEffect(() => {
    async function loadData() {
      const { data: subjectsData } = await supabase.from('ap_subjects').select('*').order('name');
      const { data: questionsData } = await supabase.from('practice_questions').select('*');
      setSubjects(subjectsData || []);
      setQuestions(questionsData || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const subjectQuestionCount = (id: string) => questions.filter(q => q.subject_id === id).length;

  const startQuiz = (id: string) => {
    const sq = questions.filter(q => q.subject_id === id);
    setSubjectQuestions(sq);
    setSelectedSubject(id);
    setActiveQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
    setMode('quiz');
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowExplanation(true);
    const isCorrect = answer === subjectQuestions[activeQuestion].correct_answer;
    setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
  };

  const nextQuestion = () => {
    if (activeQuestion < subjectQuestions.length - 1) {
      setActiveQuestion(p => p + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setMode('done');
    }
  };

  const reset = () => {
    setMode('select');
    setSelectedSubject(null);
    setActiveQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
  };

  if (loading) {
    return <div className="dk-empty" style={{ minHeight: '60vh' }}><div className="dk-spin" /></div>;
  }

  // ── Select screen ──────────────────────────────────────────────────────────
  if (mode === 'select') {
    return (
      <div>
        <div className="dk-header">
          <span className="dk-page-tag">Practice</span>
          <h1 className="dk-heading-xl">Practice like<br />it's the real exam.</h1>
          <p className="dk-sub" style={{ maxWidth: 460 }}>
            AP-style multiple choice with instant feedback. Pick a subject to begin.
          </p>
        </div>
        <div className="dk-container" style={{ paddingBottom: 'clamp(64px, 10vh, 100px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {subjects.map(subject => {
              const count = subjectQuestionCount(subject.id);
              if (!count) return null;
              return (
                <button
                  key={subject.id}
                  onClick={() => startQuiz(subject.id)}
                  className="dk-card dk-card-hover"
                  style={{ padding: '20px', textAlign: 'left', border: 'none', cursor: 'pointer', width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap className="w-4 h-4" style={{ color: '#4ade80' }} />
                    </div>
                    <span className="dk-badge dk-badge-muted">{count} q's</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--ah-sans)', fontSize: 15, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 4 }}>{subject.name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--ah-muted)', marginBottom: 14, lineHeight: 1.5 }}>{subject.description}</p>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--ah-mono)', fontSize: 11, color: '#4ade80' }}>
                    Start <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Done screen ────────────────────────────────────────────────────────────
  if (mode === 'done') {
    const subject = subjects.find(s => s.id === selectedSubject);
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', padding: 'clamp(40px, 8vh, 80px) 24px' }}>
        <div className="dk-card" style={{ padding: '36px 32px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle className="w-8 h-8" style={{ color: '#4ade80' }} />
          </div>
          <h2 className="dk-heading-lg" style={{ marginBottom: 8 }}>Quiz complete</h2>
          <p style={{ fontSize: 13, color: 'var(--ah-muted)', marginBottom: 28 }}>
            Finished practicing {subject?.name}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 28 }}>
            {[
              { value: score.total, label: 'Questions' },
              { value: score.correct, label: 'Correct', color: '#4ade80' },
              { value: `${accuracy}%`, label: 'Accuracy' },
            ].map(({ value, label, color }) => (
              <div key={label} className="dk-card" style={{ padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: color ?? 'var(--ah-text)' }}>{value}</div>
                <div style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'var(--ah-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={reset} className="dk-btn dk-btn-primary">Practice another</button>
            <Link to={`/subjects/${subject?.slug}`} className="dk-btn dk-btn-ghost">
              <BookOpen className="w-4 h-4" /> Resources
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz screen ────────────────────────────────────────────────────────────
  const currentQ = subjectQuestions[activeQuestion];
  const progress = ((activeQuestion + 1) / subjectQuestions.length) * 100;

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: 'clamp(32px, 6vh, 64px) 24px' }}>
      <div className="dk-card" style={{ padding: '28px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="dk-badge dk-badge-muted">
              {activeQuestion + 1} / {subjectQuestions.length}
            </span>
            <span className={`dk-badge ${
              currentQ.difficulty === 'easy' ? 'dk-badge-green' :
              currentQ.difficulty === 'medium' ? 'dk-badge-amber' : 'dk-badge-red'
            }`}>
              {currentQ.difficulty}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 11, color: 'var(--ah-muted)' }}>
              {score.correct}/{score.total} correct
            </span>
            <button onClick={reset} className="dk-btn dk-btn-ghost dk-btn-sm">Exit</button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#4ade80', borderRadius: 2, transition: 'width 0.3s ease' }} />
        </div>

        <h3 style={{ fontFamily: 'var(--ah-sans)', fontSize: 17, fontWeight: 600, color: 'var(--ah-text)', lineHeight: 1.5, marginBottom: 20 }}>
          {currentQ.question}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect  = option === currentQ.correct_answer;
            const answered   = selectedAnswer !== null;

            let bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.08)';
            let textColor = 'var(--ah-text)', cursor = 'pointer';
            let dotBg = 'rgba(255,255,255,0.1)', dotColor = 'var(--ah-muted)';

            if (answered) {
              cursor = 'default';
              if (isCorrect)          { bg = 'rgba(74,222,128,0.1)';  border = 'rgba(74,222,128,0.35)';  dotBg = 'rgba(74,222,128,0.2)';  dotColor = '#4ade80'; }
              else if (isSelected)    { bg = 'rgba(248,113,113,0.1)'; border = 'rgba(248,113,113,0.35)'; dotBg = 'rgba(248,113,113,0.2)'; dotColor = '#f87171'; }
              else                    { textColor = 'var(--ah-muted)'; }
            }

            return (
              <button
                key={idx}
                disabled={answered}
                onClick={() => handleAnswer(option)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, border: `1px solid ${border}`, background: bg, cursor, textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
              >
                <span style={{ width: 28, height: 28, borderRadius: 7, background: dotBg, color: dotColor, fontFamily: 'var(--ah-mono)', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span style={{ fontSize: 13.5, color: textColor, lineHeight: 1.45 }}>{option}</span>
                {answered && isCorrect  && <CheckCircle className="w-4 h-4 ml-auto shrink-0" style={{ color: '#4ade80' }} />}
                {answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 ml-auto shrink-0" style={{ color: '#f87171' }} />}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="dk-alert dk-alert-amber" style={{ marginTop: 18 }}>
            <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, marginTop: 2 }}>Explanation</span>
            <span style={{ fontSize: 13, lineHeight: 1.55 }}>{currentQ.explanation}</span>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
          <button
            onClick={() => { if (activeQuestion > 0) { setActiveQuestion(p => p - 1); setSelectedAnswer(null); setShowExplanation(false); } }}
            disabled={activeQuestion === 0}
            className="dk-btn dk-btn-ghost dk-btn-sm"
          >
            Previous
          </button>
          <button onClick={nextQuestion} className="dk-btn dk-btn-primary dk-btn-sm">
            {activeQuestion < subjectQuestions.length - 1 ? 'Next' : 'Finish'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
