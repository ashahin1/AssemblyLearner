// COE224: Assembly Language Studio - Preloaded Examples Menu

import React from 'react';
import { CODE_EXAMPLES } from '../examples';
import { CodeExample } from '../engine/types';
import { X, BookMarked, Bug } from 'lucide-react';

interface ExamplesMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (example: CodeExample) => void;
}

export const ExamplesMenu: React.FC<ExamplesMenuProps> = ({ isOpen, onClose, onSelectExample }) => {
  if (!isOpen) return null;

  // Group by chapter (3..7 are textbook chapters, 8 is Fix-the-Bug Challenges)
  const chapters = [3, 4, 5, 6, 7, 8];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <BookMarked size={18} />
            <span>Kip Irvine Textbook Examples & Debugging Challenges</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {chapters.map((ch) => {
            const examples = CODE_EXAMPLES.filter((e) => e.chapter === ch);
            if (examples.length === 0) return null;

            return (
              <div key={ch} className="space-y-2">
                <div className="font-semibold text-slate-300 text-xs uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between">
                  {ch === 8 ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1.5 normal-case text-xs">
                      <Bug size={14} />
                      <span>🔧 "Fix the Bug" Interactive Debugging Challenges</span>
                    </span>
                  ) : (
                    <span>Chapter {ch}</span>
                  )}
                  <span className="text-[10px] text-slate-500 font-normal">
                    {ch === 3
                      ? 'Assembly Fundamentals'
                      : ch === 4
                      ? 'Data Transfers & Arithmetic'
                      : ch === 5
                      ? 'Procedures & The Stack'
                      : ch === 6
                      ? 'Conditional Processing'
                      : ch === 7
                      ? 'Integer Arithmetic & Logic'
                      : 'Hands-on Debugging Labs'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {examples.map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => {
                        onSelectExample(ex);
                        onClose();
                      }}
                      className={`p-2.5 rounded-lg border transition group cursor-pointer ${
                        ch === 8
                          ? 'border-amber-500/30 hover:border-amber-400 bg-amber-950/10 hover:bg-amber-950/30'
                          : 'border-slate-800 hover:border-sky-500/50 bg-slate-950/70 hover:bg-sky-950/20'
                      }`}
                    >
                      <div className={`font-bold transition text-[12px] mb-1 ${
                        ch === 8
                          ? 'text-amber-300 group-hover:text-amber-200'
                          : 'text-slate-200 group-hover:text-sky-300'
                      }`}>
                        {ex.title}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {ex.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
