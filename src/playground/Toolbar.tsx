// COE224: Assembly Language Studio - IDE Toolbar

import React, { useState } from 'react';
import { useCPUStore } from '../store/cpuStore';
import { useUIStore } from '../store/uiStore';
import { PersistenceManager } from '../store/persistence';
import {
  Play,
  Pause,
  StepForward,
  StepBack,
  RotateCcw,
  Share2,
  Settings,
  BookOpen,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ToolbarProps {
  currentCode: string;
  onOpenExamples: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ currentCode, onOpenExamples }) => {
  const assembleCode = useCPUStore((s) => s.assembleCode);
  const runContinuous = useCPUStore((s) => s.runContinuous);
  const stepForward = useCPUStore((s) => s.stepForward);
  const stepBackward = useCPUStore((s) => s.stepBackward);
  const pause = useCPUStore((s) => s.pause);
  const reset = useCPUStore((s) => s.reset);
  const isRunning = useCPUStore((s) => s.isRunning);
  const isAssembled = useCPUStore((s) => s.isAssembled);
  const isHalted = useCPUStore((s) => s.isHalted);
  const isCodeDirty = useCPUStore((s) => s.isCodeDirty);
  const totalStepsRecorded = useCPUStore((s) => s.totalStepsRecorded);
  const executionSpeedMs = useUIStore((s) => s.executionSpeedMs);
  const setIsSettingsOpen = useUIStore((s) => s.setIsSettingsOpen);

  const [copiedShare, setCopiedShare] = useState(false);

  const handleRun = async () => {
    if (!isAssembled || isHalted || isCodeDirty) {
      reset();
      const ok = assembleCode(currentCode);
      if (!ok) return;
    }
    runContinuous(executionSpeedMs);
  };

  const handleStep = async () => {
    if (!isAssembled || isHalted || isCodeDirty) {
      reset();
      const ok = assembleCode(currentCode);
      if (!ok) return;
    }
    stepForward();
  };

  const handleReset = () => {
    reset();
    assembleCode(currentCode);
  };

  const handleShare = () => {
    const url = PersistenceManager.encodeCodeToUrl(currentCode);
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const isStaleSession = isCodeDirty && totalStepsRecorded > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-2 sm:px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs shadow-md shrink-0">
      {/* Execution Controls */}
      <div className="flex items-center gap-1.5">
        {!isRunning ? (
          <button
            onClick={handleRun}
            title={isStaleSession ? "Restart & Run (Code was modified)" : "Run continuously"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-sm"
          >
            <Play size={14} fill="currentColor" />
            <span className="hidden sm:inline">{isStaleSession ? 'Restart & Run' : 'Run'}</span>
            <span className="sm:hidden">{isStaleSession ? 'Restart' : 'Run'}</span>
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-semibold transition shadow-sm"
          >
            <Pause size={14} fill="currentColor" />
            <span>Pause</span>
          </button>
        )}

        <button
          onClick={handleStep}
          disabled={isRunning}
          title={isStaleSession ? "Restart & Step (Code was modified)" : "Step Forward (Single instruction)"}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border transition ${
            isStaleSession
              ? 'bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border-amber-500/50'
              : 'bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border-slate-700'
          }`}
        >
          <StepForward size={14} />
          <span className="hidden sm:inline">{isStaleSession ? 'Restart & Step' : 'Step'}</span>
        </button>

        <button
          onClick={stepBackward}
          disabled={isRunning || isStaleSession}
          title={
            isStaleSession
              ? "Cannot step backward after modifying code. Click Step or Run to restart."
              : "Step Backward (Undo)"
          }
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition"
        >
          <StepBack size={14} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <button
          onClick={handleReset}
          title="Reset CPU and Memory"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Navigation & Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenExamples}
          title="Lecture Examples"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition font-medium"
        >
          <BookOpen size={14} />
          <span className="hidden sm:inline">Lecture Examples</span>
        </button>

        <Link
          to="/chapters"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 transition font-medium"
        >
          <span>Interactive Modules (Ch 1-7)</span>
        </Link>

        <button
          onClick={handleShare}
          title="Share code via URL link"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition font-medium"
        >
          {copiedShare ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          <span className="hidden sm:inline">{copiedShare ? 'Copied Link!' : 'Share'}</span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          title="Settings"
          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
        >
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
};
