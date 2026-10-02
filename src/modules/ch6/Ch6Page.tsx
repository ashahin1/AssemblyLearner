// COE224: Module 6 - Conditional Processing & Branching (Chapter 6)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, GitBranch, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Ch6Page: React.FC = () => {
  const [opA, setOpA] = useState<number>(10);
  const [opB, setOpB] = useState<number>(20);

  // CMP EAX, EBX computes opA - opB
  const diff = opA - opB;
  const zf = diff === 0 ? 1 : 0;
  const sf = diff < 0 ? 1 : 0;
  const cf = (opA >>> 0) < (opB >>> 0) ? 1 : 0; // unsigned borrow
  const of = ((opA ^ opB) & (opA ^ diff) & 0x80000000) !== 0 ? 1 : 0;

  // Jump evaluation
  const jumps: Array<{ name: string; type: string; taken: boolean; reason: string }> = [
    { name: 'JE / JZ', type: 'Equality', taken: zf === 1, reason: 'ZF = 1' },
    { name: 'JNE / JNZ', type: 'Equality', taken: zf === 0, reason: 'ZF = 0' },
    { name: 'JA / JNBE', type: 'Unsigned >', taken: cf === 0 && zf === 0, reason: 'CF=0 and ZF=0' },
    { name: 'JAE / JNB', type: 'Unsigned >=', taken: cf === 0, reason: 'CF=0' },
    { name: 'JB / JNAE', type: 'Unsigned <', taken: cf === 1, reason: 'CF=1' },
    { name: 'JBE / JNA', type: 'Unsigned <=', taken: cf === 1 || zf === 1, reason: 'CF=1 or ZF=1' },
    { name: 'JG / JNLE', type: 'Signed >', taken: zf === 0 && sf === of, reason: 'ZF=0 and SF=OF' },
    { name: 'JGE / JNL', type: 'Signed >=', taken: sf === of, reason: 'SF=OF' },
    { name: 'JL / JNGE', type: 'Signed <', taken: sf !== of, reason: 'SF!=OF' },
    { name: 'JLE / JNG', type: 'Signed <=', taken: zf === 1 || sf !== of, reason: 'ZF=1 or SF!=OF' },
  ];

  const sampleCode = `INCLUDE Irvine32.inc

.data
    val1 DWORD 10
    val2 DWORD 20
    msg1 BYTE "val1 is Greater (Signed)", 0
    msg2 BYTE "val2 is Greater (Signed)", 0

.code
main PROC
    mov eax, val1
    cmp eax, val2
    jg  Val1Greater

    ; Else branch
    mov edx, OFFSET msg2
    call WriteString
    call Crlf
    jmp Done

Val1Greater:
    mov edx, OFFSET msg1
    call WriteString
    call Crlf

Done:
    exit
main ENDP
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
            <span>Chapter 6: Conditional Processing & Status Flags</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            COE224 • CMP Internal Subtraction, Flag Evaluation, and Signed vs. Unsigned Conditional Jumps
          </p>
        </div>
        <OpenInPlayground code={sampleCode} />
      </div>

      {/* Widget 1: Interactive CMP & Jump Decision Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <GitBranch size={18} />
            <span>Interactive CMP & Conditional Jump Decision Matrix</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <label className="text-slate-400 font-sans">EAX:</label>
              <input
                type="number"
                value={opA}
                onChange={(e) => setOpA(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-sky-300 font-bold text-center"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-slate-400 font-sans">EBX:</label>
              <input
                type="number"
                value={opB}
                onChange={(e) => setOpB(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-teal-300 font-bold text-center"
              />
            </div>
          </div>
        </div>

        {/* Flag Bar */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-around font-mono text-xs">
          <span className="text-slate-400 font-sans">CMP EAX, EBX results:</span>
          <span>ZF: <strong className={zf ? 'text-emerald-400' : 'text-slate-500'}>{zf}</strong></span>
          <span>CF: <strong className={cf ? 'text-amber-400' : 'text-slate-500'}>{cf}</strong></span>
          <span>SF: <strong className={sf ? 'text-purple-400' : 'text-slate-500'}>{sf}</strong></span>
          <span>OF: <strong className={of ? 'text-rose-400' : 'text-slate-500'}>{of}</strong></span>
        </div>

        {/* Jump Decision Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {jumps.map(({ name, type, taken, reason }) => (
            <div
              key={name}
              className={`p-2.5 rounded-lg border flex items-center justify-between transition ${
                taken
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
              }`}
            >
              <div>
                <div className="font-mono font-bold flex items-center gap-1.5">
                  <span>{name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({type})</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Condition: {reason}</div>
              </div>
              <div className="flex items-center gap-1 font-bold text-xs">
                {taken ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-1">
                    <Check size={12} /> JUMP TAKEN
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 flex items-center gap-1">
                    <X size={12} /> Not Taken
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
