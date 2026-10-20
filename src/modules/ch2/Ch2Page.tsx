// COE224: Module 2 - IA-32 Processor Architecture & Register Explorer (Chapter 2)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, Cpu, Layers, RefreshCw, ArrowRight, Play, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChapterQuiz, QuizQuestion } from '../shared/ChapterQuiz';

const ch2Questions: QuizQuestion[] = [
  {
    id: 'ch2-q1',
    question: 'If EAX contains 12345678h, what is the value of EAX after executing "mov al, 00h"?',
    options: ['12345600h', '00345678h', '12340078h', '00000000h'],
    correctIndex: 0,
    explanation: 'AL occupies bits 7–0 of EAX. Modifying AL replaces only the lowest byte (78h -> 00h), leaving bits 31–8 (123456h) untouched.'
  },
  {
    id: 'ch2-q2',
    question: 'Which 32-bit register holds the memory address of the next machine instruction to be fetched and executed?',
    options: ['EIP (Instruction Pointer)', 'ESP (Stack Pointer)', 'EAX (Accumulator)', 'EFLAGS'],
    correctIndex: 0,
    explanation: 'EIP (Extended Instruction Pointer) always points to the next machine instruction to be fetched from memory. It is automatically incremented or updated by JMP/CALL/RET.'
  },
  {
    id: 'ch2-q3',
    question: 'Which general-purpose register is automatically used as the default loop counter by the LOOP instruction in IA-32?',
    options: ['ECX', 'EAX', 'EBX', 'EDX'],
    correctIndex: 0,
    explanation: 'ECX (Extended Count register) is specifically hardwired to act as the counter for the LOOP, LOOPE, and LOOPNE instructions, as well as string operations (REP).'
  },
  {
    id: 'ch2-q4',
    question: 'Why does an IA-32 CPU utilize an on-chip Level 1 (L1) Cache rather than fetching every instruction directly from DRAM?',
    options: [
      'L1 Cache is integrated directly onto the CPU die and operates at CPU clock speed, preventing multi-cycle bus wait states',
      'System DRAM cannot store executable machine code instructions',
      'L1 Cache is non-volatile flash memory that persists across power outages',
      'The address bus cannot reach system DRAM directly from 32-bit Protected Mode'
    ],
    correctIndex: 0,
    explanation: 'L1 cache access takes 1 clock cycle. Accessing external DRAM over system buses takes dozens or hundreds of cycles. L1 cache keeps frequently executed loops running at peak CPU speed.'
  }
];

export const Ch2Page: React.FC = () => {
  const [eaxVal, setEaxVal] = useState<number>(0x12345678);
  const [cycleStep, setCycleStep] = useState<number>(0);

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

      {/* Widget 2: Interactive Fetch–Decode–Execute & Bus Cycle Animator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Play size={18} />
            <span>Instruction Execution Cycle & Bus Animator (Fetch – Decode – Execute)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Example: <code className="text-amber-300">add eax, 5</code></span>
            <button
              onClick={() => setCycleStep(0)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            >
              <RefreshCw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 4 Architecture Blocks Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Block 1: RAM & L1 Cache */}
          <div className={`p-4 rounded-xl border transition-all ${
            cycleStep === 1
              ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-950/50 scale-[1.02]'
              : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Database size={14} />
                <span>RAM & L1 Cache</span>
              </span>
              {cycleStep === 1 && (
                <span className="animate-pulse px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Stores code & data. L1 cache holds <code className="text-slate-300 font-mono">83 C0 05h</code> at address <code className="text-slate-300 font-mono">00401000h</code>.
            </p>
            <div className="mt-2 text-[10px] font-mono p-1.5 rounded bg-slate-900 text-emerald-300 border border-slate-800">
              [00401000h] : 83 C0 05h
            </div>
          </div>

          {/* Block 2: System Buses */}
          <div className={`p-4 rounded-xl border transition-all ${
            cycleStep === 0 || cycleStep === 1
              ? 'bg-sky-950/30 border-sky-500 shadow-lg shadow-sky-950/50 scale-[1.02]'
              : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <ArrowRight size={14} />
                <span>System Buses</span>
              </span>
              {(cycleStep === 0 || cycleStep === 1) && (
                <span className="animate-pulse px-1.5 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-300 font-mono">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="space-y-1 text-[10px] font-mono">
              <div className="p-1 rounded bg-slate-900 text-sky-300">
                Addr: {cycleStep === 0 ? '00401000h' : '---'}
              </div>
              <div className="p-1 rounded bg-slate-900 text-teal-300">
                Data: {cycleStep === 1 ? '83 C0 05h' : '---'}
              </div>
              <div className="p-1 rounded bg-slate-900 text-amber-300">
                Ctrl: {cycleStep === 0 ? 'READ=1' : cycleStep === 1 ? 'READY=1' : 'IDLE'}
              </div>
            </div>
          </div>

          {/* Block 3: Control Unit & EIP */}
          <div className={`p-4 rounded-xl border transition-all ${
            cycleStep === 2 || cycleStep === 3
              ? 'bg-amber-950/30 border-amber-500 shadow-lg shadow-amber-950/50 scale-[1.02]'
              : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Cpu size={14} />
                <span>Control Unit & EIP</span>
              </span>
              {(cycleStep === 2 || cycleStep === 3) && (
                <span className="animate-pulse px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Decodes instruction bytes into micro-operations and advances the EIP pointer.
            </p>
            <div className="mt-2 text-[10px] font-mono p-1.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
              EIP: {cycleStep >= 3 ? '00401003h' : '00401000h'}
            </div>
          </div>

          {/* Block 4: ALU & Registers */}
          <div className={`p-4 rounded-xl border transition-all ${
            cycleStep >= 4
              ? 'bg-purple-950/30 border-purple-500 shadow-lg shadow-purple-950/50 scale-[1.02]'
              : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Layers size={14} />
                <span>ALU & Registers</span>
              </span>
              {cycleStep >= 4 && (
                <span className="animate-pulse px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Executes arithmetic/logical operations and updates EFLAGS.
            </p>
            <div className="mt-2 text-[10px] font-mono p-1.5 rounded bg-slate-900 text-purple-300 border border-slate-800">
              EAX: {cycleStep === 5 ? '0000000Ah (10)' : '00000005h (5)'}
            </div>
          </div>
        </div>

        {/* Current Step Progression Detail Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 font-mono">
              Step {cycleStep + 1} of 6:{' '}
              {cycleStep === 0 && 'Fetch (Address Bus)'}
              {cycleStep === 1 && 'Fetch (Data Bus & Cache Response)'}
              {cycleStep === 2 && 'Instruction Decode (Control Unit)'}
              {cycleStep === 3 && 'Increment Instruction Pointer (EIP)'}
              {cycleStep === 4 && 'Execute in ALU (Arithmetic Logic Unit)'}
              {cycleStep === 5 && 'Writeback Result to Register & Update EFLAGS'}
            </span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setCycleStep(idx)}
                  className={`w-5 h-5 rounded text-[10px] font-mono font-bold transition ${
                    cycleStep === idx
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {cycleStep === 0 && 'The CPU initiates instruction fetch. EIP (00401000h) is placed onto the 32-bit Address Bus, and the READ control signal is asserted on the Control Bus.'}
            {cycleStep === 1 && 'Memory / L1 Cache locates the instruction bytes (83 C0 05h). The bytes travel back along the 32-bit Data Bus directly into the CPU Instruction Queue (Prefetch buffer).'}
            {cycleStep === 2 && 'The Control Unit decodes the opcode (83 C0h = ADD r/m32, imm8). It configures the internal ALU datapaths and extracts the immediate constant (+5).'}
            {cycleStep === 3 && 'The CPU automatically increments EIP by 3 bytes (the length of "add eax, 5"). EIP now holds 00401003h, ready to fetch the next sequential instruction.'}
            {cycleStep === 4 && 'The ALU executes the addition: current EAX (00000005h) + immediate (00000005h). The temporary ALU latch holds 0000000Ah (10 decimal).'}
            {cycleStep === 5 && 'The ALU result (0000000Ah) is written back into destination register EAX. The CPU status flags (ZF=0, CF=0, SF=0, OF=0, PF=1) are recorded in EFLAGS.'}
          </p>

          {/* Stepper Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-900">
            <button
              onClick={() => setCycleStep(Math.max(0, cycleStep - 1))}
              disabled={cycleStep === 0}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition"
            >
              ← Previous Step
            </button>
            <button
              onClick={() => setCycleStep(cycleStep < 5 ? cycleStep + 1 : 0)}
              className="px-4 py-1.5 text-xs rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 transition"
            >
              {cycleStep < 5 ? (
                <>
                  <span>Next Clock Cycle</span>
                  <ArrowRight size={13} />
                </>
              ) : (
                <>
                  <RefreshCw size={13} />
                  <span>Restart Cycle</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chapter 2 Quiz */}
      <ChapterQuiz chapter={2} questions={ch2Questions} />
    </div>
  );
};
