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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-stone/40 border-t-ink rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-taupe-500">Subject not found.</p>
        <Link to="/subjects" className="text-ink hover:underline mt-4 inline-block">
          Back to Subjects
        </Link>
      </div>
    );
  }

  const Icon = iconMap[subject.icon] || BookOpen;
  const featured = resources.filter(r => r.is_featured);
  const regular = resources.filter(r => !r.is_featured);

  const canDelete = (r: Resource) => !!user && (r.user_id === user.id || !!profile?.is_moderator);
  async function handleDelete(id: string) {
    if (!window.confirm('Delete this note? This can’t be undone.')) return;
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) window.alert('Could not delete: ' + error.message);
    else setResources(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/subjects"
        className="inline-flex items-center gap-2 text-sm text-taupe-500 hover:text-ink mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Subjects
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <div className={`w-16 h-16 rounded-2xl ${subject.color} flex items-center justify-center shrink-0`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-ink">{subject.name}</h1>
          <p className="text-taupe-600 mt-1">{subject.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs font-medium text-taupe-500 bg-parchment px-2.5 py-1 rounded-md">
              {subject.category}
            </span>
            <span className="text-xs text-taupe-500 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {resources.length} resources
            </span>
            <span className="text-xs text-taupe-500 flex items-center gap-1">
              <PenTool className="w-3.5 h-3.5" />
              {questions.length} questions
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => { setActiveTab('resources'); setActiveQuestion(null); setSelectedAnswer(null); setShowExplanation(false); }}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'resources'
              ? 'bg-ink text-parchment'
              : 'bg-white text-taupe-600 border border-taupe-300/50 hover:bg-parchment'
          }`}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Resources
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('practice'); setActiveQuestion(null); setSelectedAnswer(null); setShowExplanation(false); }}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'practice'
              ? 'bg-ink text-parchment'
              : 'bg-white text-taupe-600 border border-taupe-300/50 hover:bg-parchment'
          }`}
        >
          <span className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Practice
            {score.total > 0 && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{score.correct}/{score.total}</span>
            )}
          </span>
        </button>
      </div>

      {activeTab === 'resources' && (
        <div className="space-y-6">
          {featured.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-wood" />
                Featured Resources
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((resource) => {
                  const RIcon = typeIcon[resource.type] || FileText;
                  return (
                    <div key={resource.id} className="p-5 card-warm border-taupe-300/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-parchment flex items-center justify-center">
                          <RIcon className="w-5 h-5 text-ink" />
                        </div>
                        <span className="text-xs font-medium text-ink bg-parchment px-2 py-0.5 rounded">
                          {typeLabel[resource.type] || resource.type}
                        </span>
                        {canDelete(resource) && (
                          <button onClick={() => handleDelete(resource.id)} title="Delete note"
                            className="ml-auto p-1.5 rounded-lg text-taupe-400 hover:text-red-600 hover:bg-red-50 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <h3 className="font-semibold text-ink mb-1">{resource.title}</h3>
                      <p className="text-sm text-taupe-500 mb-4">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-taupe-400">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {resource.upvotes}
                          </span>
                        </div>
                        {(resource.external_url || resource.file_url) && (
                          <a
                            href={resource.external_url || resource.file_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-ink font-medium hover:text-ink/80"
                          >
                            View <ExternalLink className="w-3.5 h-3.5" />
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
              <h2 className="text-lg font-semibold text-ink mb-4">All Resources</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {regular.map((resource) => {
                  const RIcon = typeIcon[resource.type] || FileText;
                  return (
                    <div key={resource.id} className="p-5 card-warm card-warm-hover">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-parchment flex items-center justify-center">
                          <RIcon className="w-5 h-5 text-ink" />
                        </div>
                        <span className="text-xs font-medium text-ink bg-parchment px-2 py-0.5 rounded">
                          {typeLabel[resource.type] || resource.type}
                        </span>
                        {canDelete(resource) && (
                          <button onClick={() => handleDelete(resource.id)} title="Delete note"
                            className="ml-auto p-1.5 rounded-lg text-taupe-400 hover:text-red-600 hover:bg-red-50 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <h3 className="font-semibold text-ink mb-1">{resource.title}</h3>
                      <p className="text-sm text-taupe-500 mb-4">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-taupe-400">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {resource.upvotes}
                          </span>
                        </div>
                        {(resource.external_url || resource.file_url) && (
                          <a
                            href={resource.external_url || resource.file_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-ink font-medium hover:text-ink/80"
                          >
                            View <ExternalLink className="w-3.5 h-3.5" />
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
            <div className="text-center py-16 card-warm">
              <FileText className="w-12 h-12 text-taupe-300 mx-auto mb-4" />
              <p className="text-taupe-500 mb-2">No resources available yet.</p>
              <Link to="/contribute" className="text-ink hover:underline text-sm font-medium inline-flex items-center gap-1">
                Be the first to contribute <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'practice' && (
        <div>
          {activeQuestion === null ? (
            <div className="space-y-6">
              <div className="card-warm p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-parchment flex items-center justify-center mx-auto mb-4">
                  <PenTool className="w-8 h-8 text-ink" />
                </div>
                <h2 className="text-2xl font-bold text-ink mb-2">Practice Mode</h2>
                <p className="text-taupe-600 mb-6 max-w-md mx-auto">
                  Test your knowledge with {questions.length} AP-style questions. Get instant feedback and detailed explanations.
                </p>
                {score.total > 0 && (
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-ink">{score.correct}</div>
                      <div className="text-xs text-taupe-500">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-ink">{score.total}</div>
                      <div className="text-xs text-taupe-500">Answered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-ink">{Math.round((score.correct / score.total) * 100)}%</div>
                      <div className="text-xs text-taupe-500">Accuracy</div>
                    </div>
                  </div>
                )}
                <button
                  onClick={nextQuestion}
                  className="btn-warm inline-flex items-center gap-2"
                >
                  Start Practicing <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveQuestion(idx);
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                    }}
                    className="p-4 card-warm card-warm-hover text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-taupe-500 bg-parchment px-2 py-0.5 rounded">Q{idx + 1}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        q.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
                        q.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-ink line-clamp-2">{q.question}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="card-warm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-taupe-500 bg-parchment px-2 py-0.5 rounded">
                      Question {activeQuestion + 1} of {questions.length}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      questions[activeQuestion].difficulty === 'easy' ? 'bg-green-50 text-green-700' :
                      questions[activeQuestion].difficulty === 'medium' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {questions[activeQuestion].difficulty}
                    </span>
                  </div>
                  <button onClick={() => { setActiveQuestion(null); setSelectedAnswer(null); setShowExplanation(false); }}
                    className="text-sm text-taupe-500 hover:text-ink">
                    Exit
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-ink mb-6">{questions[activeQuestion].question}</h3>

                <div className="space-y-3">
                  {questions[activeQuestion].options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === questions[activeQuestion].correct_answer;
                    let btnClass = 'p-4 rounded-xl border text-left transition-all w-full flex items-center gap-3 ';
                    if (selectedAnswer === null) {
                      btnClass += 'border-taupe-300/50 hover:border-ink/30 hover:bg-parchment/60 cursor-pointer';
                    } else if (isCorrect) {
                      btnClass += 'border-green-500/50 bg-green-50';
                    } else if (isSelected && !isCorrect) {
                      btnClass += 'border-red-500/50 bg-red-50';
                    } else {
                      btnClass += 'border-taupe-300/30 opacity-50';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={selectedAnswer !== null}
                        onClick={() => handleAnswer(option)}
                        className={btnClass}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${
                          selectedAnswer === null ? 'bg-parchment text-ink' :
                          isCorrect ? 'bg-green-100 text-green-800' :
                          isSelected ? 'bg-red-100 text-red-800' :
                          'bg-parchment text-taupe-400'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm text-ink">{option}</span>
                        {selectedAnswer !== null && isCorrect && <CheckCircle className="w-5 h-5 text-green-600 ml-auto shrink-0" />}
                        {selectedAnswer !== null && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <div className="mt-6 p-4 rounded-xl bg-parchment border border-taupe-300/50">
                    <p className="text-sm text-ink">
                      <span className="font-semibold">Explanation: </span>
                      {questions[activeQuestion].explanation}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => {
                      if (activeQuestion > 0) {
                        setActiveQuestion(activeQuestion - 1);
                        setSelectedAnswer(null);
                        setShowExplanation(false);
                      }
                    }}
                    disabled={activeQuestion === 0}
                    className="text-sm text-taupe-500 hover:text-ink disabled:opacity-30"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      if (activeQuestion < questions.length - 1) {
                        setActiveQuestion(activeQuestion + 1);
                        setSelectedAnswer(null);
                        setShowExplanation(false);
                      } else {
                        setActiveQuestion(null);
                        setSelectedAnswer(null);
                        setShowExplanation(false);
                      }
                    }}
                    className="btn-warm inline-flex items-center gap-2 text-sm"
                  >
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
  );
}
