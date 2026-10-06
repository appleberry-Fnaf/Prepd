import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { APSubject, Resource, PracticeQuestion } from '../lib/supabase';
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  BarChart3,
  Leaf,
  FlaskConical,
  Atom,
  Landmark,
  Globe,
  Scale,
  Brain,
  Code,
  Castle,
  ExternalLink,
  ThumbsUp,
  FileText,
  Star,
  ChevronRight,
  PenTool,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  'calculator': Calculator,
  'bar-chart': BarChart3,
  'leaf': Leaf,
  'flask-conical': FlaskConical,
  'atom': Atom,
  'book-open': BookOpen,
  'landmark': Landmark,
  'globe': Globe,
  'scale': Scale,
  'brain': Brain,
  'code': Code,
  'castle': Castle,
};

const typeLabel: Record<string, string> = {
  notes: 'Notes',
  guide: 'Study Guide',
  test: 'Practice Test',
};

const typeIcon: Record<string, React.ElementType> = {
  notes: FileText,
  guide: Star,
  test: PenTool,
};

export default function SubjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const [subject, setSubject] = useState<APSubject | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'resources' | 'practice'>('resources');
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      const { data: subjectData } = await supabase
        .from('ap_subjects')
        .select('*')
        .eq('slug', slug)
        .single();
      if (subjectData) {
        setSubject(subjectData);
        const { data: resourcesData } = await supabase
          .from('resources')
          .select('*')
          .eq('subject_id', subjectData.id)
          .order('upvotes', { ascending: false });
        setResources(resourcesData || []);
        const { data: questionsData } = await supabase
          .from('practice_questions')
          .select('*')
          .eq('subject_id', subjectData.id)
          .order('difficulty');
        setQuestions(questionsData || []);
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowExplanation(true);
    if (activeQuestion !== null && questions[activeQuestion]) {
      const isCorrect = answer === questions[activeQuestion].correct_answer;
      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
    }
  };

  const nextQuestion = () => {
    if (activeQuestion === null) {
      setActiveQuestion(0);
    } else {
      setActiveQuestion(prev => (prev !== null && prev < questions.length - 1 ? prev + 1 : null));
    }
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  if (loading) return <div className="dk-empty" style={{ minHeight: '60vh' }}><div className="dk-spin" /></div>;

  if (!subject) {
    return (
      <div className="dk-empty" style={{ minHeight: '60vh' }}>
        <FileText className="w-8 h-8" />
        <p style={{ marginBottom: 16 }}>Subject not found.</p>
        <Link to="/subjects" className="dk-btn dk-btn-ghost">Back to Subjects</Link>
      </div>
    );
  }

  const Icon = iconMap[subject.icon] || BookOpen;
  const featured = resources.filter(r => r.is_featured);
  const regular = resources.filter(r => !r.is_featured);

  const canDelete = (r: Resource) => !!user && (r.user_id === user.id || !!profile?.is_moderator);
  async function handleDelete(id: string) {
    if (!window.confirm('Delete this note? This can\'t be undone.')) return;
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) window.alert('Could not delete: ' + error.message);
    else setResources(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div>
      {/* Header */}
      <div className="dk-header">
        <Link to="/subjects" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--ah-mono)', fontSize: 11.5, color: 'var(--ah-muted)', textDecoration: 'none', marginBottom: 16 }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Subjects
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon className="w-7 h-7" style={{ color: 'var(--ah-text)' }} />
          </div>
          <div>
            <h1 className="dk-heading-xl" style={{ marginBottom: 4 }}>{subject.name}</h1>
            {subject.description && <p className="dk-sub" style={{ margin: 0 }}>{subject.description}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          <span className="dk-badge dk-badge-muted">{subject.category}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--ah-mono)', fontSize: 11, color: 'var(--ah-muted)' }}>
            <FileText className="w-3.5 h-3.5" /> {resources.length} resources
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--ah-mono)', fontSize: 11, color: 'var(--ah-muted)' }}>
            <PenTool className="w-3.5 h-3.5" /> {questions.length} questions
          </span>
        </div>
      </div>

      <div className="dk-container" style={{ paddingBottom: 'clamp(64px, 10vh, 100px)' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          <button
            onClick={() => { setActiveTab('resources'); setActiveQuestion(null); setSelectedAnswer(null); setShowExplanation(false); }}
            className={`dk-tab ${activeTab === 'resources' ? 'dk-tab-active' : 'dk-tab-inactive'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
          >
            <BookOpen className="w-4 h-4" /> Resources
          </button>
          <button
            onClick={() => { setActiveTab('practice'); setActiveQuestion(null); setSelectedAnswer(null); setShowExplanation(false); }}
            className={`dk-tab ${activeTab === 'practice' ? 'dk-tab-active' : 'dk-tab-inactive'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
          >
            <PenTool className="w-4 h-4" /> Practice
            {score.total > 0 && <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 5px' }}>{score.correct}/{score.total}</span>}
          </button>
        </div>

        {/* Resources tab */}
        {activeTab === 'resources' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {featured.length > 0 && (
              <div>
                <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 14, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Star className="w-4 h-4" style={{ color: '#fbbf24' }} /> Featured Resources
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                  {featured.map(resource => {
                    const RIcon = typeIcon[resource.type] || FileText;
                    return (
                      <div key={resource.id} className="dk-card dk-card-hover" style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245,176,64,0.1)', border: '1px solid rgba(245,176,64,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <RIcon className="w-4 h-4" style={{ color: '#f5b040' }} />
                          </div>
                          <span className="dk-badge dk-badge-amber">{typeLabel[resource.type] || resource.type}</span>
                          {canDelete(resource) && (
                            <button onClick={() => handleDelete(resource.id)} title="Delete" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ah-muted)', padding: 4, borderRadius: 6, display: 'flex' }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 14, fontWeight: 600, color: 'var(--ah-text)', marginBottom: 4 }}>{resource.title}</div>
                        {resource.description && <p style={{ fontSize: 12.5, color: 'var(--ah-muted)', marginBottom: 12, lineHeight: 1.5 }}>{resource.description}</p>}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--ah-mono)', fontSize: 11, color: 'var(--ah-muted)' }}>
                            <ThumbsUp className="w-3 h-3" /> {resource.upvotes}
                          </span>
                          {(resource.external_url || resource.file_url) && (
                            <a href={resource.external_url || resource.file_url || '#'} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--ah-mono)', fontSize: 11.5, color: '#60a5fa', textDecoration: 'none' }}>
                              View <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {regular.length > 0 && (
              <div>
                <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 14, fontWeight: 700, color: 'var(--ah-text)', marginBottom: 14 }}>All Resources</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                  {regular.map(resource => {
                    const RIcon = typeIcon[resource.type] || FileText;
                    return (
                      <div key={resource.id} className="dk-card dk-card-hover" style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <RIcon className="w-4 h-4" style={{ color: 'var(--ah-muted)' }} />
                          </div>
                          <span className="dk-badge dk-badge-muted">{typeLabel[resource.type] || resource.type}</span>
                          {canDelete(resource) && (
                            <button onClick={() => handleDelete(resource.id)} title="Delete" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ah-muted)', padding: 4, borderRadius: 6, display: 'flex' }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 14, fontWeight: 600, color: 'var(--ah-text)', marginBottom: 4 }}>{resource.title}</div>
                        {resource.description && <p style={{ fontSize: 12.5, color: 'var(--ah-muted)', marginBottom: 12, lineHeight: 1.5 }}>{resource.description}</p>}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--ah-mono)', fontSize: 11, color: 'var(--ah-muted)' }}>
                            <ThumbsUp className="w-3 h-3" /> {resource.upvotes}
                          </span>
                          {(resource.external_url || resource.file_url) && (
                            <a href={resource.external_url || resource.file_url || '#'} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--ah-mono)', fontSize: 11.5, color: '#60a5fa', textDecoration: 'none' }}>
                              View <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {resources.length === 0 && (
              <div className="dk-empty dk-card" style={{ padding: '48px 24px' }}>
                <FileText className="w-8 h-8" />
                <p style={{ marginBottom: 12 }}>No resources available yet.</p>
                <Link to="/contribute" className="dk-btn dk-btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  Be the first to contribute <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Practice tab */}
        {activeTab === 'practice' && (
          <div>
            {activeQuestion === null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Start card */}
                <div className="dk-card" style={{ padding: '36px', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <PenTool className="w-7 h-7" style={{ color: '#4ade80' }} />
                  </div>
                  <h2 style={{ fontFamily: 'var(--ah-sans)', fontSize: 20, fontWeight: 800, color: 'var(--ah-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>Practice Mode</h2>
                  <p style={{ fontSize: 13, color: 'var(--ah-muted)', marginBottom: questions.length === 0 ? 0 : 20, maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                    Test your knowledge with {questions.length} AP-style questions. Get instant feedback and detailed explanations.
                  </p>
                  {score.total > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 32, margin: '20px 0' }}>
                      {[['Correct', score.correct, '#4ade80'], ['Answered', score.total, 'var(--ah-text)'], ['Accuracy', `${Math.round((score.correct / score.total) * 100)}%`, '#60a5fa']].map(([label, val, color]) => (
                        <div key={String(label)} style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--ah-sans)', fontSize: 22, fontWeight: 800, color: String(color), letterSpacing: '-0.02em' }}>{val}</div>
                          <div style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, color: 'var(--ah-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {questions.length > 0 && (
                    <button onClick={nextQuestion} className="dk-btn dk-btn-primary" style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      Start Practicing <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Question grid */}
                {questions.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                    {questions.map((q, idx) => (
                      <button key={q.id} onClick={() => { setActiveQuestion(idx); setSelectedAnswer(null); setShowExplanation(false); }}
                        className="dk-card dk-card-hover" style={{ padding: '14px 16px', textAlign: 'left', cursor: 'pointer', background: 'none', border: undefined, width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 10.5, color: 'var(--ah-muted)', background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 6px' }}>Q{idx + 1}</span>
                          <span className={`dk-diff ${q.difficulty === 'easy' ? 'dk-diff-easy' : q.difficulty === 'medium' ? 'dk-diff-medium' : 'dk-diff-hard'}`}>{q.difficulty}</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--ah-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{q.question}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <div className="dk-card" style={{ padding: '28px' }}>
                  {/* Question header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 10.5, color: 'var(--ah-muted)', background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '3px 7px' }}>
                        {activeQuestion + 1} / {questions.length}
                      </span>
                      <span className={`dk-diff ${questions[activeQuestion].difficulty === 'easy' ? 'dk-diff-easy' : questions[activeQuestion].difficulty === 'medium' ? 'dk-diff-medium' : 'dk-diff-hard'}`}>
                        {questions[activeQuestion].difficulty}
                      </span>
                    </div>
                    <button onClick={() => { setActiveQuestion(null); setSelectedAnswer(null); setShowExplanation(false); }}
                      style={{ fontFamily: 'var(--ah-mono)', fontSize: 11, color: 'var(--ah-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Exit
                    </button>
                  </div>

                  <h3 style={{ fontFamily: 'var(--ah-sans)', fontSize: 16, fontWeight: 600, color: 'var(--ah-text)', marginBottom: 20, lineHeight: 1.55 }}>{questions[activeQuestion].question}</h3>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {questions[activeQuestion].options.map((option, idx) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = option === questions[activeQuestion].correct_answer;
                      let borderColor = 'rgba(255,255,255,0.1)';
                      let bg = 'transparent';
                      let labelBg = 'rgba(255,255,255,0.07)';
                      let labelColor = 'var(--ah-muted)';
                      let opacity = 1;
                      if (selectedAnswer !== null) {
                        if (isCorrect) { borderColor = 'rgba(74,222,128,0.45)'; bg = 'rgba(74,222,128,0.06)'; labelBg = 'rgba(74,222,128,0.18)'; labelColor = '#4ade80'; }
                        else if (isSelected) { borderColor = 'rgba(248,113,113,0.45)'; bg = 'rgba(248,113,113,0.06)'; labelBg = 'rgba(248,113,113,0.18)'; labelColor = '#f87171'; }
                        else opacity = 0.45;
                      }
                      return (
                        <button key={idx} disabled={selectedAnswer !== null} onClick={() => handleAnswer(option)}
                          style={{ width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 8, border: `1px solid ${borderColor}`, background: bg, cursor: selectedAnswer === null ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 10, opacity, transition: 'all 0.15s' }}>
                          <span style={{ width: 28, height: 28, borderRadius: 6, background: labelBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ah-mono)', fontSize: 11, fontWeight: 700, color: labelColor, flexShrink: 0 }}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span style={{ fontSize: 13.5, color: 'var(--ah-text)', flex: 1, lineHeight: 1.5 }}>{option}</span>
                          {selectedAnswer !== null && isCorrect && <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#4ade80' }} />}
                          {selectedAnswer !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0" style={{ color: '#f87171' }} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {showExplanation && (
                    <div className="dk-alert dk-alert-amber" style={{ marginTop: 16 }}>
                      <span style={{ fontFamily: 'var(--ah-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>Explanation</span>
                      <span style={{ fontSize: 13, color: 'var(--ah-text)', lineHeight: 1.55 }}>{questions[activeQuestion].explanation}</span>
                    </div>
                  )}

                  {/* Nav */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                    <button onClick={() => { if (activeQuestion > 0) { setActiveQuestion(activeQuestion - 1); setSelectedAnswer(null); setShowExplanation(false); } }}
                      disabled={activeQuestion === 0}
                      style={{ fontFamily: 'var(--ah-mono)', fontSize: 11.5, color: 'var(--ah-muted)', background: 'none', border: 'none', cursor: activeQuestion === 0 ? 'default' : 'pointer', opacity: activeQuestion === 0 ? 0.3 : 1 }}>
                      Previous
                    </button>
                    <button onClick={() => { if (activeQuestion < questions.length - 1) { setActiveQuestion(activeQuestion + 1); setSelectedAnswer(null); setShowExplanation(false); } else { setActiveQuestion(null); setSelectedAnswer(null); setShowExplanation(false); } }}
                      className="dk-btn dk-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      {activeQuestion < questions.length - 1 ? 'Next Question' : 'Finish'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
