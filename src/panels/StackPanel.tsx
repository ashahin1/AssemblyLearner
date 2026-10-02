// COE224: Assembly Language Studio - Visual Stack Panel (ESP & EBP)

import React from 'react';
import { useCPUStore } from '../store/cpuStore';
import { MEMORY_LAYOUT } from '../engine/constants';
import { ArrowDown, Layers } from 'lucide-react';

export const StackPanel: React.FC = () => {
  const cpuState = useCPUStore((s) => s.cpuState);
  const memory = useCPUStore((s) => s.memory);

  const esp = cpuState.registers.esp;
  const ebp = cpuState.registers.ebp;
  const stackTop = MEMORY_LAYOUT.STACK_TOP;

  // Collect stack slots from stackTop down to ESP (or minimum 4 slots for visualization)
  const slots: Array<{ address: number; value: number; isEsp: boolean; isEbp: boolean }> = [];

  const displaySlots = Math.max(4, Math.min(10, Math.floor((stackTop - esp) / 4) + 2));

  for (let i = 0; i < displaySlots; i++) {
    const addr = (stackTop - i * 4) >>> 0;
    const val = memory.readDword(addr);
    slots.push({
      address: addr,
      value: val,
      isEsp: addr === esp,
      isEbp: addr === ebp,
    });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-lg flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200 tracking-wider uppercase">
          <Layers size={14} className="text-sky-400" />
          <span>Call Stack</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <ArrowDown size={12} className="text-amber-400" />
          <span>Grows Downward</span>
        </div>
      </div>

      {/* Stack Visual Column */}
      <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-xs pr-1">
        {slots.map(({ address, value, isEsp, isEbp }) => {
          const hexAddr = address.toString(16).toUpperCase().padStart(8, '0') + 'h';
          const hexVal = value.toString(16).toUpperCase().padStart(8, '0') + 'h';

          return (
            <div
              key={address}
              className={`p-2 rounded border transition flex items-center justify-between ${
                isEsp
                  ? 'bg-sky-500/15 border-sky-400 text-sky-200 font-bold shadow-md'
                  : isEbp
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">{hexAddr}</span>
                {isEsp && (
                  <span className="px-1.5 py-0.5 rounded bg-sky-500 text-white text-[10px] font-bold">
                    ESP
                  </span>
                )}
                {isEbp && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                    EBP
                  </span>
                )}
              </div>
              <span className={`font-semibold tracking-wider ${isEsp ? 'text-amber-300' : 'text-slate-200'}`}>
                {hexVal}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stack Legend */}
      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <span>TOS Base: {stackTop.toString(16).toUpperCase()}h</span>
        <span>Slots: 32-bit (4 bytes)</span>
      </div>
    </div>
  );
};
