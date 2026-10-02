// COE224: Module 4 - Data Transfers, Addressing & Little-Endian (Chapter 4)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, ArrowRight, Binary, HelpCircle, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Ch4Page: React.FC = () => {
  const [hexInput, setHexInput] = useState<string>('12345678');
  const [movSrc, setMovSrc] = useState<'reg' | 'mem' | 'imm'>('mem');
  const [movDest, setMovDest] = useState<'reg' | 'mem'>('mem');

  // Little endian byte splitting
  const cleanHex = hexInput.padStart(8, '0').slice(-8).toUpperCase();
  const b0 = cleanHex.slice(6, 8); // lowest byte (byte 0)
  const b1 = cleanHex.slice(4, 6);
  const b2 = cleanHex.slice(2, 4);
  const b3 = cleanHex.slice(0, 2); // highest byte (byte 3)

  // MOV legality
  const isMovValid = !(movSrc === 'mem' && movDest === 'mem');

  const sampleCode = `INCLUDE Irvine32.inc

.data
    val DWORD 12345678h
    arr DWORD 10, 20, 30, 40

.code
main PROC
    ; Little-endian: AL gets 78h
    mov al, BYTE PTR val

    ; Indirect addressing with pointer arithmetic
    mov esi, OFFSET arr
    mov eax, [esi]        ; gets 10
    mov ebx, [esi + 4]    ; gets 20

    call DumpRegs
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
            <span>Chapter 4: Data Transfers, Addressing & Little-Endian</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            COE224 • MOV, XCHG, PTR, OFFSET, and Little-Endian Memory Visualization
          </p>
        </div>
        <OpenInPlayground code={sampleCode} />
      </div>

      {/* Widget 1: Little-Endian Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Binary size={18} />
            <span>Little-Endian Storage Animator</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-400">32-bit Hex Value:</label>
            <input
              type="text"
              maxLength={8}
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
              className="w-24 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-sky-300 font-mono text-center font-bold text-xs"
            />
          </div>
        </div>

        {/* Animation Display */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-center gap-3">
            <span className="text-slate-400 font-sans">DWORD:</span>
            <span className="text-lg font-bold text-amber-300">{cleanHex}h</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded border border-sky-500/40 bg-sky-950/30 space-y-1">
              <span className="text-[10px] text-slate-400 block font-sans">Address Offset +0 (Lowest)</span>
              <span className="text-xl font-bold text-sky-300">{b0}h</span>
              <span className="text-[10px] text-sky-400 block font-sans">Least Significant Byte</span>
            </div>
            <div className="p-3 rounded border border-teal-500/40 bg-teal-950/30 space-y-1">
              <span className="text-[10px] text-slate-400 block font-sans">Address Offset +1</span>
              <span className="text-xl font-bold text-teal-300">{b1}h</span>
              <span className="text-[10px] text-teal-400 block font-sans">Byte 1</span>
            </div>
            <div className="p-3 rounded border border-purple-500/40 bg-purple-950/30 space-y-1">
              <span className="text-[10px] text-slate-400 block font-sans">Address Offset +2</span>
              <span className="text-xl font-bold text-purple-300">{b2}h</span>
              <span className="text-[10px] text-purple-400 block font-sans">Byte 2</span>
            </div>
            <div className="p-3 rounded border border-amber-500/40 bg-amber-950/30 space-y-1">
              <span className="text-[10px] text-slate-400 block font-sans">Address Offset +3 (Highest)</span>
              <span className="text-xl font-bold text-amber-300">{b3}h</span>
              <span className="text-[10px] text-amber-400 block font-sans">Most Significant Byte</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-sans leading-relaxed">
            💡 <strong>Why Little-Endian?</strong> x86 processors store the <em>least significant byte</em> at the lowest memory address. In memory, <code className="text-amber-300">{cleanHex}h</code> is stored consecutively as <code className="text-sky-300">{b0} {b1} {b2} {b3}</code>.
          </div>
        </div>
      </div>

      {/* Widget 2: MOV Restriction Checker */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-slate-800 pb-2">
          <HelpCircle size={18} />
          <span>MOV Instruction Legality Checker</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Destination Operand:</label>
              <div className="flex gap-2">
                {(['reg', 'mem'] as const).map((dest) => (
                  <button
                    key={dest}
                    onClick={() => setMovDest(dest)}
                    className={`flex-1 py-1.5 rounded border font-mono font-bold transition ${
                      movDest === dest
                        ? 'bg-sky-600 border-sky-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {dest === 'reg' ? 'Register (e.g. EAX)' : 'Memory (e.g. myVar)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Source Operand:</label>
              <div className="flex gap-2">
                {(['reg', 'mem', 'imm'] as const).map((src) => (
                  <button
                    key={src}
                    onClick={() => setMovSrc(src)}
                    className={`flex-1 py-1.5 rounded border font-mono font-bold transition ${
                      movSrc === src
                        ? 'bg-sky-600 border-sky-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {src === 'reg' ? 'Register' : src === 'mem' ? 'Memory' : 'Immediate (10h)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Validation Result */}
          <div className={`p-4 rounded-xl border flex flex-col justify-center space-y-2 ${
            isMovValid
              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {isMovValid ? <Check size={18} className="text-emerald-400" /> : <X size={18} className="text-rose-400" />}
              <span>{isMovValid ? 'Valid MOV Combination ✓' : 'ILLEGAL INSTRUCTION ✗'}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {isMovValid
                ? `MOV ${movDest}, ${movSrc} is fully supported by the x86 CPU architecture.`
                : 'x86 processors CANNOT move directly from memory to memory! You must load into an intermediate register first: mov eax, memSource then mov memDest, eax.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
