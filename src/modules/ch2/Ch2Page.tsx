// COE224: Module 2 - IA-32 Processor Architecture & Register Explorer (Chapter 2)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, Cpu, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Ch2Page: React.FC = () => {
  const [eaxVal, setEaxVal] = useState<number>(0x12345678);

  const hex32 = eaxVal.toString(16).toUpperCase().padStart(8, '0');
  const axVal = eaxVal & 0xffff;
  const ahVal = (eaxVal >> 8) & 0xff;
  const alVal = eaxVal & 0xff;

  const handleUpdateSub = (type: 'ah' | 'al', valStr: string) => {
    const parsed = parseInt(valStr, 16);
    if (isNaN(parsed)) return;
    const clean = parsed & 0xff;
    if (type === 'al') {
      setEaxVal(((eaxVal & 0xffffff00) | clean) >>> 0);
    } else {
      setEaxVal(((eaxVal & 0xffff00ff) | (clean << 8)) >>> 0);
    }
  };

  const sampleCode = `INCLUDE Irvine32.inc

.code
main PROC
    ; Load full 32-bit register
    mov eax, 12345678h

    ; Modify lower 8 bits (AL)
    mov al, 99h

    ; Modify high 8 bits of AX (AH)
    mov ah, 0AAh

    ; Notice how EAX becomes 1234AA99h!
    call DumpRegs
    exit
main ENDP
END main
`;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link to="/chapters" className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:underline mb-2">
            <ArrowLeft size={13} />
            <span>Back to All Chapters</span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Chapter 2: IA-32 Architecture & Register Hierarchy</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            COE224 • Visualizing Nested Registers (EAX, AX, AH, AL) and Execution Modes
          </p>
        </div>
        <OpenInPlayground code={sampleCode} />
      </div>

      {/* Widget 1: Interactive Nested Register Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Cpu size={18} />
            <span>Interactive Nested Register Explorer (EAX)</span>
          </div>
          <span className="text-xs text-slate-400">Click & edit any register level</span>
        </div>

        {/* EAX Visual Box (32-bit) */}
        <div className="border-2 border-sky-500/60 bg-sky-950/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded bg-sky-500 text-white text-xs font-bold">EAX</span>
              <span className="text-xs text-sky-300 font-semibold">Full 32-bit Extended Accumulator</span>
            </div>
            <span className="font-mono text-lg font-bold text-sky-400">{hex32}h</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Upper 16 bits */}
            <div className="border border-dashed border-slate-700 bg-slate-950/50 rounded-lg p-3 text-center flex flex-col justify-center">
              <span className="text-[11px] text-slate-500 block font-mono">Bits 31–16 (Upper 16 bits)</span>
              <span className="text-sm font-mono text-slate-400 font-bold mt-1">
                {hex32.slice(0, 4)}h
              </span>
              <span className="text-[10px] text-slate-500 italic mt-0.5">No separate 16-bit name</span>
            </div>

            {/* Lower 16 bits (AX) */}
            <div className="border-2 border-teal-500/70 bg-teal-950/20 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center justify-between font-mono">
                <span className="px-1.5 py-0.5 rounded bg-teal-600 text-white text-[11px] font-bold">AX</span>
                <span className="text-xs font-bold text-teal-300">
                  {axVal.toString(16).toUpperCase().padStart(4, '0')}h
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                {/* AH */}
                <div className="border border-purple-500/50 bg-purple-950/30 rounded p-2 text-center">
                  <span className="text-[10px] text-purple-400 font-bold block">AH (Bits 15–8)</span>
                  <input
                    type="text"
                    maxLength={2}
                    value={ahVal.toString(16).toUpperCase().padStart(2, '0')}
                    onChange={(e) => handleUpdateSub('ah', e.target.value)}
                    className="w-12 text-center bg-slate-900 border border-purple-400 rounded text-xs font-bold text-purple-200 mt-1 uppercase"
                  />
                </div>

                {/* AL */}
                <div className="border border-emerald-500/50 bg-emerald-950/30 rounded p-2 text-center">
                  <span className="text-[10px] text-emerald-400 font-bold block">AL (Bits 7–0)</span>
                  <input
                    type="text"
                    maxLength={2}
                    value={alVal.toString(16).toUpperCase().padStart(2, '0')}
                    onChange={(e) => handleUpdateSub('al', e.target.value)}
                    className="w-12 text-center bg-slate-900 border border-emerald-400 rounded text-xs font-bold text-emerald-200 mt-1 uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Register Taxonomy Map */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Layers size={14} className="text-amber-400" />
            <span>IA-32 General-Purpose Register Categories</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-sky-400 font-bold block">Data Registers (EAX, EBX, ECX, EDX)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                General arithmetic and logic. EAX is accumulator, ECX is loop counter, EDX is I/O & multiplication high-half.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-teal-400 font-bold block">Index Registers (ESI, EDI)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Source Index (ESI) and Destination Index (EDI). Used for high-speed memory block transfers and array indexing.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold block">Pointer Registers (ESP, EBP)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                ESP points to the top of the stack. EBP is base pointer used for accessing parameters and local variables in stack frames.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
