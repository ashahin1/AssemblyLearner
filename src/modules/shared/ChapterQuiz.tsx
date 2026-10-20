import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RefreshCw, BookMarked } from 'lucide-react';

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ChapterQuizProps {
  chapter: number;
  questions: QuizQuestion[];
}

export const ChapterQuiz: React.FC<ChapterQuizProps> = ({ chapter, questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const answeredCount = Object.keys(selectedAnswers).length;
  const score = questions.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // Prevent re-selection once answered
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Chapter {chapter} Self-Check Quiz
              <span className="text-xs font-normal text-slate-400">
                (Lecture Concept Review)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Test your understanding of Kip Irvine's key assembly principles and common traps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
            Score: <span className="text-emerald-400 font-bold">{score}</span> / {questions.length}
            {answeredCount > 0 && (
              <span className="text-slate-500 ml-1.5">
                ({Math.round((score / questions.length) * 100)}%)
              </span>
            )}
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
            title="Reset quiz answers"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const selectedOption = selectedAnswers[q.id];
          const isAnswered = selectedOption !== undefined;
          const isCorrect = isAnswered && selectedOption === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`bg-slate-950/70 border rounded-xl p-4 space-y-3 transition-colors ${
                !isAnswered
                  ? 'border-slate-800'
                  : isCorrect
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : 'border-rose-500/30 bg-rose-950/10'
              }`}
            >
              {/* Question title */}
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono mt-0.5">
                  Q{qIndex + 1}
                </span>
                <p className="text-sm font-medium text-slate-200 flex-1">
                  {q.question}
                </p>
              </div>

              {/* Optional Code Snippet */}
              {q.codeSnippet && (
                <div className="font-mono text-xs bg-slate-950 border border-slate-800 text-amber-200/90 p-3 rounded-lg overflow-x-auto whitespace-pre">
                  {q.codeSnippet}
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map((option, optIdx) => {
                  let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700';
                  let icon = null;

                  if (isAnswered) {
                    if (optIdx === q.correctIndex) {
                      btnStyle = 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 shadow-sm';
                      icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
                    } else if (optIdx === selectedOption) {
                      btnStyle = 'bg-rose-950/50 border-rose-500/60 text-rose-200 shadow-sm';
                      icon = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
                    } else {
                      btnStyle = 'bg-slate-950 border-slate-900 text-slate-500 opacity-60 cursor-not-allowed';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`text-left p-3 rounded-lg border text-xs sm:text-sm font-mono flex items-center justify-between gap-3 transition-all ${btnStyle}`}
                    >
                      <span className="flex-1 leading-snug">{option}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Callout */}
              {isAnswered && (
                <div className={`p-3 rounded-lg text-xs leading-relaxed border flex items-start gap-2.5 ${
                  isCorrect
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300/90'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-300/90'
                }`}>
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
                  <div>
                    <span className="font-semibold mr-1.5">
                      {isCorrect ? 'Correct!' : 'Incorrect:'}
                    </span>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
