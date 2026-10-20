// COE224: Module 5 - Stack Operations & Procedures (Chapter 5)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, Layers, ArrowDown, RefreshCw, Repeat, ShieldAlert, CheckCircle2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChapterQuiz, QuizQuestion } from '../shared/ChapterQuiz';

const ch5Questions: QuizQuestion[] = [
  {
    id: 'ch5-q1',
    question: 'When executing a 32-bit "push eax" instruction, how does the Stack Pointer (ESP) register change?',
    options: [
      'ESP is decremented by 4 (ESP = ESP - 4)',
      'ESP is incremented by 4 (ESP = ESP + 4)',
      'ESP is decremented by 1 (ESP = ESP - 1)',
      'ESP remains completely unchanged'
    ],
    correctIndex: 0,
    explanation: 'In IA-32 protected mode, the stack grows downwards toward lower memory addresses. Pushing a 32-bit DWORD decrements ESP by 4 bytes before writing the data to [ESP].'
  },
  {
    id: 'ch5-q2',
    question: 'In what ordering discipline are values retrieved from the runtime stack using POP?',
    options: [
      'LIFO (Last-In, First-Out)',
      'FIFO (First-In, First-Out)',
      'Sorted ascending numerical order',
      'Random direct-offset access'
    ],
    correctIndex: 0,
    explanation: 'The runtime stack operates strictly on the Last-In, First-Out (LIFO) discipline: the most recently pushed item is at the top of the stack and is retrieved by the next POP.'
  },
  {
    id: 'ch5-q3',
    question: 'When the CPU executes a "CALL" instruction to invoke a procedure, what value is automatically pushed onto the stack?',
    options: [
      'The return address (address of the instruction immediately following the CALL)',
      'The contents of all 8 general-purpose registers (EAX through EDI)',
      'The current state of the EFLAGS register',
      'The base address of the procedure\'s local stack frame'
    ],
    correctIndex: 0,
    explanation: 'CALL automatically pushes the current EIP (the return address of the subsequent instruction) onto the stack before setting EIP to the target procedure address. The RET instruction pops this return address back into EIP.'
  },
  {
    id: 'ch5-q4',
    question: 'What machine instructions does the MASM assembler automatically generate for "MyProc PROC USES ebx esi"?',
    options: [
      'push ebx then push esi at the procedure entry; pop esi then pop ebx before RET',
      'push ebx then push esi at the procedure entry; pop ebx then pop esi before RET',
      'mov ebx, 0 and mov esi, 0',
      'cmp ebx, esi'
    ],
    correctIndex: 0,
    explanation: 'The USES clause automatically pushes the specified registers in left-to-right order (EBX, then ESI), and pops them in reverse LIFO order (ESI, then EBX) before every RET instruction in the procedure.'
  }
];

export const Ch5Page: React.FC = () => {
  const [stack, setStack] = useState<number[]>([0x00000000, 0x00000000]);
  const [espOffset, setEspOffset] = useState<number>(0); // 0 = empty stack, negative = pushed
  const [poppedVal, setPoppedVal] = useState<number | null>(null);

  // Widget 2 State: String Reversal & PROC USES
  const [revInput, setRevInput] = useState<string>('COE224');
  const [revStep, setRevStep] = useState<number>(0);
  const [usesEcxEnabled, setUsesEcxEnabled] = useState<boolean>(false);

  // String reversal derived values
  const cleanStr = revInput.slice(0, 6);
  const n = cleanStr.length;
  const maxRevSteps = n * 2;
  const clampedStep = Math.min(revStep, maxRevSteps);

  // Pushing phase: steps 1..n
  // Popping phase: steps n+1..2n
  let currentRevStack: string[] = [];
  let currentOutputStr = '';

  if (clampedStep <= n) {
    currentRevStack = cleanStr.slice(0, clampedStep).split('').reverse();
    currentOutputStr = '';
  } else {
    const popCount = clampedStep - n;
    currentRevStack = cleanStr.slice(0, n - popCount).split('').reverse();
    currentOutputStr = cleanStr.split('').reverse().slice(0, popCount).join('');
  }

  const baseAddress = 0x0012fff0;
  const currentEsp = baseAddress - stack.length * 4;

  const pushVal = (val: number) => {
    setStack([val, ...stack]);
    setEspOffset(espOffset - 4);
    setPoppedVal(null);
  };

  const popVal = () => {
    if (stack.length === 0) return;
    const [top, ...rest] = stack;
    setStack(rest);
    setEspOffset(espOffset + 4);
    setPoppedVal(top);
  };

  const resetStack = () => {
    setStack([0x00000000, 0x00000000]);
    setEspOffset(0);
    setPoppedVal(null);
  };

  const sampleCode = `INCLUDE Irvine32.inc

.code
main PROC
    mov eax, 10h
    mov ebx, 20h

    ; Push values onto stack (ESP decreases by 4 each time)
    push eax
    push ebx

    ; Call subroutine (pushes return address)
    call SwapAndDisplay

    exit
main ENDP

SwapAndDisplay PROC
    pop edx    ; Pop return address temporarily
    pop eax    ; gets 20h
    pop ebx    ; gets 10h
    push edx   ; restore return address
    call DumpRegs
    ret
SwapAndDisplay ENDP

END main
`;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link to="/chapters" className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:underline mb-2">
            <ArrowLeft size={13} />
            <span>Back to All Chapters</span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Chapter 5: Procedures & Stack Architecture</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            COE224 • LIFO Stack Mechanism (PUSH / POP), ESP Pointer, and CALL / RET Frames
          </p>
        </div>
        <OpenInPlayground code={sampleCode} />
      </div>

      {/* Widget 1: Interactive Stack Column */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Layers size={18} />
            <span>Interactive Stack Frame Simulator</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pushVal(Math.floor(Math.random() * 0xffff))}
              className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
            >
              + PUSH Random
            </button>
            <button
              onClick={() => pushVal(0x10)}
              className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition"
            >
              + PUSH 10h
            </button>
            <button
              onClick={popVal}
              disabled={stack.length === 0}
              className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold transition"
            >
              − POP
            </button>
            <button
              onClick={resetStack}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start font-mono text-xs">
          {/* Stack Visualizer */}
          <div className="md:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans pb-1 border-b border-slate-800">
              <span className="flex items-center gap-1">
                <ArrowDown size={12} className="text-amber-400" />
                <span>Memory Grows Downward</span>
              </span>
              <span>ESP: {currentEsp.toString(16).toUpperCase()}h</span>
            </div>

            <div className="space-y-1.5 py-2">
              {stack.map((val, idx) => {
                const isEsp = idx === 0;
                const slotAddr = baseAddress - (stack.length - idx) * 4;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border transition flex items-center justify-between ${
                      isEsp
                        ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold scale-[1.01]'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">
                        {slotAddr.toString(16).toUpperCase()}h
                      </span>
                      {isEsp && (
                        <span className="px-1.5 py-0.5 rounded bg-sky-500 text-white text-[9px] font-bold">
                          ← ESP
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-amber-300">
                      {val.toString(16).toUpperCase().padStart(8, '0')}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation & Popped value */}
          <div className="md:col-span-5 space-y-4 font-sans text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 block">Last Action Result:</span>
              {poppedVal !== null ? (
                <div className="text-emerald-400 font-mono text-sm font-bold">
                  Popped value: {poppedVal.toString(16).toUpperCase().padStart(8, '0')}h (ESP += 4)
                </div>
              ) : (
                <div className="text-slate-400 text-xs italic">
                  Push a value to decrement ESP by 4, or POP to retrieve.
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
              <p className="font-semibold text-amber-300">💡 Exam Concept: CALL and RET</p>
              <p>
                When <code className="text-sky-300">CALL MyProc</code> executes, the CPU automatically executes:
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                <li><code className="text-white">push EIP</code> (stores return address of next instruction)</li>
                <li><code className="text-white">jmp MyProc</code> (jumps to procedure)</li>
              </ol>
              <p>
                When <code className="text-sky-300">RET</code> executes, it pops the return address off the stack back into EIP!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Widget 2: String Reversal Stack Animator & PROC USES Bug Comparison */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Repeat size={18} />
            <span>String Reversal Stack Animator & "PROC USES" Safety Demo</span>
          </div>
          <span className="text-xs text-slate-400">Kip Irvine Chapter 5 Case Studies</span>
        </div>

        {/* Part 1: String Reversal Stepper */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                1. Reversing a String via LIFO Stack:
              </span>
              <input
                type="text"
                maxLength={6}
                value={revInput}
                onChange={(e) => {
                  setRevInput(e.target.value);
                  setRevStep(0);
                }}
                className="w-24 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300 font-mono text-center font-bold text-xs uppercase"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRevStep(Math.max(0, clampedStep - 1))}
                disabled={clampedStep === 0}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
              >
                ← Back
              </button>
              <button
                onClick={() => setRevStep(clampedStep < maxRevSteps ? clampedStep + 1 : 0)}
                className="px-3 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
              >
                {clampedStep < maxRevSteps ? `Next Step (${clampedStep + 1}/${maxRevSteps}) →` : 'Reset Stepper'}
              </button>
            </div>
          </div>

          {/* Stepper Visualisation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Source String */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-slate-400 block text-[11px] font-sans">Source Characters:</span>
              <div className="flex gap-1.5 justify-center">
                {cleanStr.split('').map((char, i) => {
                  const isPushed = clampedStep > i;
                  const isCurrent = clampedStep === i + 1;
                  return (
                    <div
                      key={i}
                      className={`w-8 h-9 rounded flex items-center justify-center font-bold text-sm border transition ${
                        isCurrent
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105'
                          : isPushed
                          ? 'bg-slate-950/80 border-slate-800 text-slate-500'
                          : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-500 text-center block font-sans">
                {clampedStep <= n ? `PUSHING chars 0..${clampedStep}` : 'All chars pushed onto stack'}
              </span>
            </div>

            {/* Stack Visualizer */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-slate-400 block text-[11px] font-sans">Runtime Stack (LIFO):</span>
              <div className="flex flex-col-reverse gap-1 items-center min-h-[90px] justify-start py-1">
                {currentRevStack.length === 0 ? (
                  <span className="text-slate-600 italic text-[11px] font-sans my-auto">(Stack empty)</span>
                ) : (
                  currentRevStack.map((char, idx) => (
                    <div
                      key={idx}
                      className="w-32 py-1 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 font-bold text-center text-xs flex items-center justify-between px-3"
                    >
                      <span className="text-[10px] text-indigo-400">char '{char}'</span>
                      <span className="text-[10px] text-slate-500">
                        {idx === currentRevStack.length - 1 ? '← ESP' : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Output String */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-slate-400 block text-[11px] font-sans">Popped / Reversed Output:</span>
              <div className="flex gap-1.5 justify-center">
                {cleanStr.split('').map((_, i) => {
                  const char = currentOutputStr[i];
                  return (
                    <div
                      key={i}
                      className={`w-8 h-9 rounded flex items-center justify-center font-bold text-sm border transition ${
                        char
                          ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-950 border-dashed border-slate-800 text-slate-700'
                      }`}
                    >
                      {char || '·'}
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-500 text-center block font-sans">
                {clampedStep > n ? `POPPING in reverse order!` : 'Waiting for POP phase...'}
              </span>
            </div>
          </div>
        </div>

        {/* Part 2: Corrupted ECX Loop Counter Bug */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                2. The "Corrupted ECX Loop Counter" Trap & PROC USES:
              </span>
            </div>
            <button
              onClick={() => setUsesEcxEnabled(!usesEcxEnabled)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition border ${
                usesEcxEnabled
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-400 text-rose-300'
              }`}
            >
              Mode: {usesEcxEnabled ? 'SAFE: PROC USES ecx' : 'BUG: Normal PROC (No USES)'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {/* Outer Caller */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-sky-400 font-bold block font-sans text-[11px]">
                Caller in main:
              </span>
              <pre className="text-slate-300 leading-relaxed text-[11px]">
{`mov ecx, 3          ; Outer loop count = 3
OuterLoop:
    call InnerProc  ; calls subroutine
    loop OuterLoop  ; decrements ECX and repeats`}
              </pre>
            </div>

            {/* Inner Subroutine */}
            <div className={`p-3 rounded-lg border space-y-1.5 ${
              usesEcxEnabled
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
            }`}>
              <span className="font-bold block font-sans text-[11px] flex items-center justify-between">
                <span>{usesEcxEnabled ? 'InnerProc with USES ecx:' : 'InnerProc without USES:'}</span>
                <span className="text-[10px] uppercase font-bold">
                  {usesEcxEnabled ? 'SAFE' : 'INFINITE LOOP TRAP'}
                </span>
              </span>
              <pre className="text-slate-300 leading-relaxed text-[11px]">
{usesEcxEnabled ? (
`InnerProc PROC USES ecx
    ; MASM auto generates: push ecx
    mov ecx, 10
L2: loop L2         ; ECX becomes 0
    ; MASM auto generates: pop ecx (restores 3!)
    ret
InnerProc ENDP`
) : (
`InnerProc PROC
    mov ecx, 10     ; Overwrites caller's ECX!
L2: loop L2         ; ECX decrements to 0
    ret             ; Returns with ECX = 0!
InnerProc ENDP      ; main's loop decrements 0 -> FFFFFFFFh!`
)}
              </pre>
            </div>
          </div>

          <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
            usesEcxEnabled
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}>
            {usesEcxEnabled ? (
              <p>
                ✓ <strong>Protected:</strong> Because <code className="font-mono font-bold">PROC USES ecx</code> was specified, the assembler preserved the caller's <code className="font-mono">ECX = 3</code> on the stack and popped it before returning. The outer loop executes exactly 3 times as intended.
              </p>
            ) : (
              <p>
                ⚠️ <strong>Fatal Bug:</strong> Without preserving <code className="font-mono">ECX</code>, <code className="font-mono">InnerProc</code> returns with <code className="font-mono">ECX = 0</code>. When <code className="font-mono">main</code> executes <code className="font-mono">loop OuterLoop</code>, it decrements <code className="font-mono">ECX</code> from <code className="font-mono">0</code> to <code className="font-mono">FFFFFFFFh</code> (4,294,967,295)! The program enters a nearly endless loop and hangs.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chapter 5 Quiz */}
      <ChapterQuiz chapter={5} questions={ch5Questions} />
    </div>
  );
};
