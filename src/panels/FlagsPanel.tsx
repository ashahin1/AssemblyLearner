// COE224: Assembly Language Studio - EFLAGS Diagnostic Panel

import React from 'react';
import { useCPUStore } from '../store/cpuStore';
import { Info } from 'lucide-react';

export const FlagsPanel: React.FC = () => {
  const cpuState = useCPUStore((s) => s.cpuState);
  const flagDiagnostics = useCPUStore((s) => s.flagDiagnostics);
  const flags = cpuState.flags;

  const flagList: Array<{ name: keyof typeof flags; desc: string }> = [
    { name: 'ZF', desc: 'Zero Flag (result = 0)' },
    { name: 'CF', desc: 'Carry Flag (unsigned overflow)' },
    { name: 'SF', desc: 'Sign Flag (negative MSB = 1)' },
    { name: 'OF', desc: 'Overflow Flag (signed overflow)' },
    { name: 'PF', desc: 'Parity Flag (even number of 1s)' },
    { name: 'AF', desc: 'Auxiliary Carry (low nibble carry)' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-lg flex flex-col">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <span className="font-semibold text-slate-200 tracking-wider uppercase">Status Flags (EFLAGS)</span>
        <span className="text-[10px] text-slate-500 font-mono">IA-32</span>
      </div>

      {/* Flag Badges Grid */}
      <div className="grid grid-cols-6 gap-1.5 mb-2 font-mono text-center">
        {flagList.map(({ name, desc }) => {
          const val = flags[name];
          const isSet = val === 1;

          return (
            <div
              key={name}
              title={desc}
              className={`p-1.5 rounded border transition cursor-help flex flex-col items-center justify-center ${
                isSet
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                  : 'bg-slate-950/80 border-slate-800 text-slate-500 font-medium'
              }`}
            >
              <span className="text-[10px] uppercase">{name}</span>
              <span className="text-sm font-bold">{val}</span>
            </div>
          );
        })}
      </div>

      {/* Educational Diagnostic Explanation Box */}
      {flagDiagnostics.length > 0 ? (
        <div className="bg-slate-950/80 border border-sky-500/30 rounded p-2 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-[11px]">
            <Info size={13} />
            <span>Why did flags change?</span>
          </div>
          {flagDiagnostics.map((diag, idx) => (
            <p key={idx} className="text-slate-300 text-[11px] leading-relaxed">
              • {diag.reason}
            </p>
          ))}
        </div>
      ) : (
        <div className="text-[11px] text-slate-500 italic text-center py-1">
          No flag changes on the last instruction.
        </div>
      )}
    </div>
  );
};
