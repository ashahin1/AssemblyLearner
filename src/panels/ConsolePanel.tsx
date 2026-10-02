// COE224: Assembly Language Studio - Virtual Irvine32 CRT Console Panel

import React, { useState, useRef, useEffect } from 'react';
import { useCPUStore } from '../store/cpuStore';
import { Terminal, Trash2, Send } from 'lucide-react';

export const ConsolePanel: React.FC = () => {
  const consoleOutput = useCPUStore((s) => s.consoleOutput);
  const isWaitingForInput = useCPUStore((s) => s.isWaitingForInput);
  const inputPrompt = useCPUStore((s) => s.inputPrompt);
  const inputType = useCPUStore((s) => s.inputType);
  const submitInput = useCPUStore((s) => s.submitInput);
  const clearConsole = useCPUStore((s) => s.clearConsole);

  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleOutput, isWaitingForInput]);

  useEffect(() => {
    if (isWaitingForInput) {
      inputRef.current?.focus();
    }
  }, [isWaitingForInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWaitingForInput) return;
    submitInput(inputVal);
    setInputVal('');
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 shadow-lg flex flex-col h-full font-mono">
      {/* Console Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-emerald-400" />
          <span className="font-semibold text-slate-200 uppercase tracking-wider">Irvine32 Console</span>
          {isWaitingForInput && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold animate-pulse border border-amber-500/30">
              Waiting for Input ({inputType.toUpperCase()})
            </span>
          )}
        </div>
        <button
          onClick={clearConsole}
          title="Clear Console"
          className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Terminal Output Screen */}
      <div className="flex-1 overflow-y-auto text-xs text-emerald-400/90 whitespace-pre-wrap leading-relaxed select-text space-y-1">
        {consoleOutput ? (
          consoleOutput
        ) : (
          <span className="text-slate-600 italic">Program output will appear here...</span>
        )}

        {/* Input Prompt when waiting for Read* */}
        {isWaitingForInput && (
          <form onSubmit={handleSubmit} className="flex items-center gap-1 mt-2 text-amber-300">
            <span>{inputPrompt}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Enter ${inputType}...`}
              className="bg-transparent border-b border-amber-400 focus:outline-none flex-1 text-xs text-amber-200 placeholder-slate-600"
            />
            <button
              type="submit"
              className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition"
            >
              <Send size={12} />
            </button>
          </form>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
