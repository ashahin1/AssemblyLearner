// COE224: Module 5 - Stack Operations & Procedures (Chapter 5)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, Layers, ArrowDown, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Ch5Page: React.FC = () => {
  const [stack, setStack] = useState<number[]>([0x00000000, 0x00000000]);
  const [espOffset, setEspOffset] = useState<number>(0); // 0 = empty stack, negative = pushed
  const [poppedVal, setPoppedVal] = useState<number | null>(null);

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
    </div>
  );
};
