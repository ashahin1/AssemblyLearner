// COE224: Assembly Language Studio - Timeline Scrubber & History Panel

import React from 'react';
import { useCPUStore } from '../store/cpuStore';
import { StepBack, History } from 'lucide-react';

export const TimelinePanel: React.FC = () => {
  const currentStepIndex = useCPUStore((s) => s.currentStepIndex);
  const totalStepsRecorded = useCPUStore((s) => s.totalStepsRecorded);
  const stepBackward = useCPUStore((s) => s.stepBackward);
  const isRunning = useCPUStore((s) => s.isRunning);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 shadow flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-2">
        <History size={14} className="text-sky-400" />
        <span className="font-semibold text-slate-300">Execution Timeline</span>
        <span className="text-[11px] text-slate-500">
          (Step {currentStepIndex} of {totalStepsRecorded})
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={stepBackward}
          disabled={currentStepIndex === 0 || isRunning}
          title="Step Backward (Undo last instruction)"
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition font-sans text-xs font-medium border border-slate-700"
        >
          <StepBack size={13} />
          <span>Step Back</span>
        </button>

        <div className="w-48 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 hidden sm:block">
          <div
            className="bg-sky-500 h-full transition-all duration-150"
            style={{
              width: `${totalStepsRecorded > 0 ? (currentStepIndex / totalStepsRecorded) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
