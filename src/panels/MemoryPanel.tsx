// COE224: Assembly Language Studio - Memory Grid & Little-Endian Viewer

import React from 'react';
import { useCPUStore } from '../store/cpuStore';

export const MemoryPanel: React.FC = () => {
  const memory = useCPUStore((s) => s.memory);
  const runner = useCPUStore((s) => s.runner);

  const allocated = memory.getAllAllocated();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-lg flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <span className="font-semibold text-slate-200 tracking-wider uppercase">Memory (.data segment)</span>
        <span className="text-[10px] text-slate-500 font-mono">Little-Endian</span>
      </div>

      {/* Memory Table */}
      <div className="flex-1 overflow-y-auto font-mono text-xs pr-1">
        {allocated.length === 0 ? (
          <div className="text-slate-500 text-center py-6 italic text-xs">
            No variables allocated in .data segment.
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-1 px-2 py-1 bg-slate-950/90 rounded text-[10px] text-slate-500 uppercase font-semibold">
              <span className="col-span-5">Address</span>
              <span className="col-span-4 text-center">Hex Value</span>
              <span className="col-span-3 text-right">ASCII</span>
            </div>
            {allocated.map(({ address, value }) => {
              const hexAddr = address.toString(16).toUpperCase().padStart(8, '0') + 'h';
              const hexVal = value.toString(16).toUpperCase().padStart(2, '0') + 'h';
              const charVal = value >= 32 && value <= 126 ? String.fromCharCode(value) : '.';

              return (
                <div
                  key={address}
                  className="grid grid-cols-12 gap-1 px-2 py-1 rounded bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800/40 text-[11px] items-center"
                >
                  <span className="col-span-5 text-sky-400 font-medium">{hexAddr}</span>
                  <span className="col-span-4 text-center font-bold text-amber-300">{hexVal}</span>
                  <span className="col-span-3 text-right text-emerald-400 font-semibold">{charVal}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
