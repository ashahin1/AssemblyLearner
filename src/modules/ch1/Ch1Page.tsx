// COE224: Module 1 - Number Systems & Data Representation (Chapter 1)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, RefreshCw, Calculator, Hash, Binary } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Ch1Page: React.FC = () => {
  // 8-bit bitboard state
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 1, 0, 1, 0]); // 00001010b = 10
  const [twosCompInput, setTwosCompInput] = useState<number>(5);
  const [twosStep, setTwosStep] = useState<number>(0);

  // Computed values from bitboard
  const unsignedVal = bits.reduce((acc, bit, idx) => acc + (bit ? Math.pow(2, 7 - idx) : 0), 0);
  const signedVal = unsignedVal > 127 ? unsignedVal - 256 : unsignedVal;
  const hexVal = unsignedVal.toString(16).toUpperCase().padStart(2, '0') + 'h';
  const binStr = bits.join('');

  const toggleBit = (idx: number) => {
    const next = [...bits];
    next[idx] = next[idx] === 1 ? 0 : 1;
    setBits(next);
  };

  const resetBits = () => setBits([0, 0, 0, 0, 0, 0, 0, 0]);

  // Two's complement calculation steps
  const pos8Bit = (Math.abs(twosCompInput) & 0x7f).toString(2).padStart(8, '0');
  const inverted8Bit = pos8Bit.split('').map((b) => (b === '0' ? '1' : '0')).join('');
  const negVal = ((parseInt(inverted8Bit, 2) + 1) & 0xff);
  const neg8Bit = negVal.toString(2).padStart(8, '0');

  const sampleCode = `INCLUDE Irvine32.inc

.data
    val1 BYTE 1010b        ; Binary constant
    val2 BYTE 0A5h         ; Hexadecimal constant
    val3 SBYTE -42         ; Signed 2's complement integer

.code
main PROC
    ; Display in Hex
    movzx eax, val2
    call WriteHex
    call Crlf

    ; Display in Binary
    movzx eax, val1
    call WriteBin
    call Crlf

    exit
main ENDP
END main
`;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 text-slate-100">
      {/* Top Breadcrumb & Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <Link to="/chapters" className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:underline mb-2">
            <ArrowLeft size={13} />
            <span>Back to All Chapters</span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Chapter 1: Number Systems & Data Representation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            COE224 • Interactive Binary, Hexadecimal, and Two's Complement Exploration
          </p>
        </div>
        <OpenInPlayground code={sampleCode} />
      </div>

      {/* Widget 1: Interactive 8-Bit Bitboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Binary size={18} />
            <span>Interactive 8-Bit Bitboard (Click bits to toggle)</span>
          </div>
          <button
            onClick={resetBits}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            <RefreshCw size={12} />
            <span>Clear</span>
          </button>
        </div>

        {/* Clickable Bit Cells */}
        <div className="flex justify-center items-center gap-2 py-4">
          {bits.map((bit, idx) => {
            const weight = Math.pow(2, 7 - idx);
            const isMSB = idx === 0;

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500">
                  {isMSB ? 'MSB (±)' : `2^${7 - idx}`}
                </span>
                <button
                  onClick={() => toggleBit(idx)}
                  className={`w-12 h-16 rounded-lg font-mono text-xl font-bold transition shadow-lg flex items-center justify-center border-2 ${
                    bit === 1
                      ? isMSB
                        ? 'bg-rose-600/30 border-rose-500 text-rose-300 scale-105'
                        : 'bg-sky-600/30 border-sky-400 text-sky-200 scale-105'
                      : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                  }`}
                >
                  {bit}
                </button>
                <span className="text-[10px] font-mono text-slate-400">+{bit ? weight : 0}</span>
              </div>
            );
          })}
        </div>

        {/* Live Representations Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono">
            <span className="text-[10px] text-slate-500 uppercase block mb-1">Unsigned Decimal</span>
            <span className="text-xl font-bold text-sky-400">{unsignedVal}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono">
            <span className="text-[10px] text-slate-500 uppercase block mb-1">Signed (2's Complement)</span>
            <span className={`text-xl font-bold ${signedVal < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {signedVal}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono">
            <span className="text-[10px] text-slate-500 uppercase block mb-1">Hexadecimal</span>
            <span className="text-xl font-bold text-amber-300">{hexVal}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono">
            <span className="text-[10px] text-slate-500 uppercase block mb-1">Binary Form</span>
            <span className="text-sm font-bold text-emerald-400 leading-8">{binStr}b</span>
          </div>
        </div>
      </div>

      {/* Widget 2: Two's Complement Step-by-Step Animator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Calculator size={18} />
            <span>Two's Complement Negation Animator (Invert Bits + 1)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-400">Number to Negate:</label>
            <input
              type="number"
              min="1"
              max="127"
              value={twosCompInput}
              onChange={(e) => {
                setTwosCompInput(Math.min(127, Math.max(1, parseInt(e.target.value) || 1)));
                setTwosStep(0);
              }}
              className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-amber-300 font-mono text-center text-xs"
            />
          </div>
        </div>

        {/* Step-by-step visual progression */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 py-2 font-mono text-xs">
          {/* Step 1 */}
          <div
            onClick={() => setTwosStep(0)}
            className={`p-3 rounded-lg border cursor-pointer transition ${
              twosStep >= 0 ? 'bg-slate-950 border-sky-500/50' : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}
          >
            <span className="text-[10px] text-sky-400 font-bold block mb-1">Step 1: Positive Binary</span>
            <span className="text-sm font-bold text-white block">{pos8Bit}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Decimal: +{twosCompInput}</span>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => setTwosStep(1)}
            className={`p-3 rounded-lg border cursor-pointer transition ${
              twosStep >= 1 ? 'bg-slate-950 border-amber-500/50' : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}
          >
            <span className="text-[10px] text-amber-400 font-bold block mb-1">Step 2: Invert All Bits</span>
            <span className="text-sm font-bold text-amber-300 block">{inverted8Bit}</span>
            <span className="text-[10px] text-slate-400 block mt-1">(One's complement)</span>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => setTwosStep(2)}
            className={`p-3 rounded-lg border cursor-pointer transition ${
              twosStep >= 2 ? 'bg-slate-950 border-purple-500/50' : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}
          >
            <span className="text-[10px] text-purple-400 font-bold block mb-1">Step 3: Add 1</span>
            <span className="text-sm font-bold text-purple-300 block">+ 00000001b</span>
            <span className="text-[10px] text-slate-400 block mt-1">Carry bit arithmetic</span>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => setTwosStep(3)}
            className={`p-3 rounded-lg border cursor-pointer transition ${
              twosStep >= 3 ? 'bg-slate-950 border-emerald-500/50' : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}
          >
            <span className="text-[10px] text-emerald-400 font-bold block mb-1">Step 4: Result</span>
            <span className="text-sm font-bold text-emerald-300 block">{neg8Bit}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Decimal: -{twosCompInput} ({negVal.toString(16).toUpperCase()}h)</span>
          </div>
        </div>

        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={() => setTwosStep(Math.min(3, twosStep + 1))}
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition"
          >
            {twosStep < 3 ? 'Next Step →' : 'Completed ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};
