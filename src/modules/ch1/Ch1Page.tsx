// COE224: Module 1 - Number Systems & Data Representation (Chapter 1)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, RefreshCw, Calculator, Binary, Zap, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChapterQuiz, QuizQuestion } from '../shared/ChapterQuiz';

const ch1Questions: QuizQuestion[] = [
  {
    id: 'ch1-q1',
    question: 'What is the hexadecimal representation of the 8-bit binary value 11110110b?',
    options: ['F6h', 'E6h', 'F5h', '76h'],
    correctIndex: 0,
    explanation: 'Break into 4-bit nibbles: 1111b = Fh (15), and 0110b = 6h (6). Thus 11110110b = F6h.'
  },
  {
    id: 'ch1-q2',
    question: "What is the two's complement 8-bit representation of -5?",
    options: ['11111011b', '11111010b', '11110101b', '10000101b'],
    correctIndex: 0,
    explanation: "+5 is 00000101b. Step 1 (invert bits): 11111010b. Step 2 (add 1): 11111011b (or FBh = 251 unsigned = -5 signed)."
  },
  {
    id: 'ch1-q3',
    question: 'What is the representable range of an 8-bit signed (two\'s complement) integer (SBYTE)?',
    options: ['-128 to +127', '-127 to +128', '0 to 255', '-256 to +255'],
    correctIndex: 0,
    explanation: 'With 8 bits, 2^8 = 256 combinations: -2^7 (-128) up to 2^7 - 1 (+127). The unsigned range is 0 to 255.'
  },
  {
    id: 'ch1-q4',
    question: 'In a signed binary number, what does the Most Significant Bit (MSB) indicate?',
    options: [
      'Sign bit: 1 indicates negative, 0 indicates non-negative (zero or positive)',
      'Carry bit indicating unsigned arithmetic overflow',
      'Parity bit checking if the total number of set bits is even',
      'The power of 2 multiplier for the entire byte'
    ],
    correctIndex: 0,
    explanation: 'The MSB (Bit 7 in an 8-bit integer, Bit 31 in a 32-bit integer) is the sign bit. If MSB=1, the value is negative in two\'s complement.'
  }
];

export const Ch1Page: React.FC = () => {
  // 8-bit bitboard state
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 1, 0, 1, 0]); // 00001010b = 10
  const [twosCompInput, setTwosCompInput] = useState<number>(5);
  const [twosStep, setTwosStep] = useState<number>(0);

  // Widget 3: Ripple-Carry Adder state
  const [addA, setAddA] = useState<number>(127);
  const [addB, setAddB] = useState<number>(1);

  // Ripple-Carry Math
  const a8 = (addA & 0xff) >>> 0;
  const b8 = (addB & 0xff) >>> 0;
  const carries: number[] = new Array(9).fill(0);
  const sumBits: number[] = new Array(8).fill(0);

  for (let bit = 0; bit < 8; bit++) {
    const bitA = (a8 >> bit) & 1;
    const bitB = (b8 >> bit) & 1;
    const cIn = carries[bit];
    sumBits[bit] = bitA ^ bitB ^ cIn;
    carries[bit + 1] = (bitA & bitB) | (cIn & (bitA ^ bitB));
  }

  const cfOut = carries[8]; // Carry out of Bit 7
  const cIntoMsb = carries[7]; // Carry into Bit 7
  const ofOut = cIntoMsb ^ cfOut; // OF = CarryIntoMSB ^ CarryOutOfMSB
  const sumUnsigned = (a8 + b8) & 0xff;
  const sumSigned = sumUnsigned > 127 ? sumUnsigned - 256 : sumUnsigned;

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

      {/* Widget 3: 8-Bit Binary Ripple-Carry Adder (CF vs OF Detector) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <Zap size={18} />
            <span>8-Bit Ripple-Carry Adder (CF vs. OF Detection)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Presets:</span>
            <button
              onClick={() => { setAddA(127); setAddB(1); }}
              className="px-2 py-1 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-rose-300 rounded border border-slate-700"
              title="127 + 1 = 128 (Signed overflow OF=1, CF=0)"
            >
              127 + 1 (OF=1, CF=0)
            </button>
            <button
              onClick={() => { setAddA(255); setAddB(1); }}
              className="px-2 py-1 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700"
              title="255 + 1 = 256 (Unsigned carry CF=1, OF=0)"
            >
              255 + 1 (CF=1, OF=0)
            </button>
            <button
              onClick={() => { setAddA(150); setAddB(150); }}
              className="px-2 py-1 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-purple-300 rounded border border-slate-700"
              title="150 + 150 = 300 (Both CF=1 and OF=1)"
            >
              150 + 150 (CF=1, OF=1)
            </button>
            <button
              onClick={() => { setAddA(10); setAddB(20); }}
              className="px-2 py-1 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700"
              title="10 + 20 = 30 (Normal: CF=0, OF=0)"
            >
              10 + 20 (Normal)
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 font-mono">Operand A (0–255):</label>
            <input
              type="number"
              min="0"
              max="255"
              value={addA}
              onChange={(e) => setAddA(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sky-400 font-mono text-sm text-center"
            />
            <span className="text-xs text-slate-500 font-mono">({a8.toString(16).toUpperCase().padStart(2, '0')}h)</span>
          </div>
          <span className="text-slate-600 font-bold">+</span>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 font-mono">Operand B (0–255):</label>
            <input
              type="number"
              min="0"
              max="255"
              value={addB}
              onChange={(e) => setAddB(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-indigo-400 font-mono text-sm text-center"
            />
            <span className="text-xs text-slate-500 font-mono">({b8.toString(16).toUpperCase().padStart(2, '0')}h)</span>
          </div>
        </div>

        {/* Ripple Adder Bit Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[500px] p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
            {/* Carry Row */}
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <span className="w-24 text-[11px] text-amber-400 font-semibold">Carry Bits:</span>
              <div className="flex items-center gap-2">
                <span className={`w-8 text-center text-xs font-bold px-1 py-0.5 rounded ${cfOut ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-600'}`} title="Carry out of MSB (Bit 7)">
                  {cfOut}
                </span>
                {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => (
                  <span
                    key={bit}
                    className={`w-9 text-center text-xs font-mono py-0.5 rounded ${
                      carries[bit] ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {carries[bit]}
                  </span>
                ))}
              </div>
            </div>

            {/* Operand A Row */}
            <div className="flex items-center gap-1.5">
              <span className="w-24 text-[11px] text-sky-400 font-semibold">Operand A:</span>
              <div className="flex items-center gap-2">
                <span className="w-8 text-center text-slate-700">·</span>
                {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => (
                  <span
                    key={bit}
                    className="w-9 text-center text-sm py-1 rounded bg-slate-900 border border-slate-800 text-sky-300 font-bold"
                  >
                    {(a8 >> bit) & 1}
                  </span>
                ))}
              </div>
            </div>

            {/* Operand B Row */}
            <div className="flex items-center gap-1.5 pb-2 border-b-2 border-slate-700">
              <span className="w-24 text-[11px] text-indigo-400 font-semibold">+ Operand B:</span>
              <div className="flex items-center gap-2">
                <span className="w-8 text-center text-slate-700">·</span>
                {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => (
                  <span
                    key={bit}
                    className="w-9 text-center text-sm py-1 rounded bg-slate-900 border border-slate-800 text-indigo-300 font-bold"
                  >
                    {(b8 >> bit) & 1}
                  </span>
                ))}
              </div>
            </div>

            {/* Sum Row */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-24 text-[11px] text-emerald-400 font-semibold">= Sum (8-bit):</span>
              <div className="flex items-center gap-2">
                <span className={`w-8 text-center text-xs font-bold py-1 rounded ${cfOut ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-700'}`}>
                  {cfOut ? 'CF=1' : '·'}
                </span>
                {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => (
                  <span
                    key={bit}
                    className="w-9 text-center text-sm py-1 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-bold"
                  >
                    {sumBits[bit]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Flag Diagnostic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* CF Card */}
          <div className={`p-3.5 rounded-lg border font-mono text-xs space-y-1.5 ${
            cfOut
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <span className={cfOut ? 'text-amber-400' : 'text-slate-500'}>Carry Flag (CF):</span>
                <span className={`px-2 py-0.5 rounded text-xs ${cfOut ? 'bg-amber-500/20 text-amber-300 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                  {cfOut}
                </span>
              </span>
              <span className="text-[10px] text-slate-400">Unsigned Overflow</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              {cfOut === 1
                ? `CF = 1 because the unsigned sum (${a8 + b8}) exceeded the 8-bit maximum (255). The carry out of Bit 7 is 1.`
                : `CF = 0 because the unsigned sum (${a8 + b8}) fits within 8 bits (≤ 255). No carry generated.`}
            </p>
          </div>

          {/* OF Card */}
          <div className={`p-3.5 rounded-lg border font-mono text-xs space-y-1.5 ${
            ofOut
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-1.5">
                <span className={ofOut ? 'text-rose-400' : 'text-slate-500'}>Overflow Flag (OF):</span>
                <span className={`px-2 py-0.5 rounded text-xs ${ofOut ? 'bg-rose-500/20 text-rose-300 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                  {ofOut}
                </span>
              </span>
              <span className="text-[10px] text-slate-400">Signed Overflow</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              {ofOut === 1
                ? `OF = 1! Formula: CarryIntoMSB (${cIntoMsb}) ⊕ CarryOutOfMSB (${cfOut}) = 1. The signed result wrapped outside [-128, +127] (stored as ${sumSigned}).`
                : `OF = 0. Formula: CarryIntoMSB (${cIntoMsb}) ⊕ CarryOutOfMSB (${cfOut}) = 0. Signed addition is mathematically correct (${sumSigned}).`}
            </p>
          </div>
        </div>
      </div>

      {/* Chapter 1 Quiz */}
      <ChapterQuiz chapter={1} questions={ch1Questions} />
    </div>
  );
};
