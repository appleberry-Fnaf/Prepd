import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { APSubject, PracticeQuestion } from '../lib/supabase';
import {
  PenTool,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Zap,
} from 'lucide-react';

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

  const subjectQuestionCount = (subjectId: string) =>
    questions.filter(q => q.subject_id === subjectId).length;

  const startQuiz = (subjectId: string) => {
    const sq = questions.filter(q => q.subject_id === subjectId);
    setSubjectQuestions(sq);
    setSelectedSubject(subjectId);
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
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const nextQuestion = () => {
    if (activeQuestion < subjectQuestions.length - 1) {
      setActiveQuestion(prev => prev + 1);
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
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-stone/40 border-t-ink rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (mode === 'select') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="accent-strip mb-4" />
          <h1 className="text-4xl font-bold text-ink mb-3">Practice</h1>
          <p className="text-lg text-taupe-600 max-w-2xl">
            Choose an AP subject and test your knowledge with real exam-style questions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const count = subjectQuestionCount(subject.id);
            if (count === 0) return null;
            return (
              <button
                key={subject.id}
                onClick={() => startQuiz(subject.id)}
                className="p-6 card-warm card-warm-hover text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${subject.color} flex items-center justify-center`}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-taupe-500 bg-parchment px-2 py-1 rounded-md">
                    {count} questions
                  </span>
                </div>
                <h3 className="font-semibold text-ink text-lg mb-1">{subject.name}</h3>
                <p className="text-sm text-taupe-500 mb-4">{subject.description}</p>
                <div className="flex items-center gap-2 text-sm text-ink font-medium">
                  Start Practice
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (mode === 'done') {
    const subject = subjects.find(s => s.id === selectedSubject);
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-warm p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-parchment flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-ink" />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-2">Quiz Complete!</h2>
          <p className="text-taupe-600 mb-8">
            You finished practicing {subject?.name}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-parchment rounded-xl">
              <div className="text-2xl font-bold text-ink">{score.total}</div>
              <div className="text-xs text-taupe-500">Questions</div>
            </div>
            <div className="p-4 bg-parchment rounded-xl">
              <div className="text-2xl font-bold text-green-700">{score.correct}</div>
              <div className="text-xs text-taupe-500">Correct</div>
            </div>
            <div className="p-4 bg-parchment rounded-xl">
              <div className="text-2xl font-bold text-ink">{accuracy}%</div>
              <div className="text-xs text-taupe-500">Accuracy</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={reset}
              className="btn-warm inline-flex items-center gap-2"
            >
              Practice Another Subject
            </button>
            <Link
              to={`/subjects/${subject?.slug}`}
              className="btn-warm-outline inline-flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              View Resources
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = subjectQuestions[activeQuestion];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card-warm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-taupe-500 bg-parchment px-2 py-0.5 rounded">
                Question {activeQuestion + 1} of {subjectQuestions.length}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                currentQ.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
                currentQ.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-700'
              }`}>
                {currentQ.difficulty}
              </span>
            </div>
            <div className="text-sm text-taupe-500">
              Score: {score.correct}/{score.total}
            </div>
          </div>
          <button onClick={reset} className="text-sm text-taupe-500 hover:text-ink">
            Exit
          </button>
        </div>

        <div className="w-full h-2 bg-parchment rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-ink rounded-full transition-all duration-300"
            style={{ width: `${((activeQuestion + 1) / subjectQuestions.length) * 100}%` }}
          />
        </div>

        <h3 className="text-xl font-semibold text-ink mb-6">{currentQ.question}</h3>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQ.correct_answer;
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
              {currentQ.explanation}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => {
              if (activeQuestion > 0) {
                setActiveQuestion(prev => prev - 1);
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
            onClick={nextQuestion}
            className="btn-warm inline-flex items-center gap-2 text-sm"
          >
            {activeQuestion < subjectQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
