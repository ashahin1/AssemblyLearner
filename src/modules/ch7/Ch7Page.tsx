// COE224: Module 7 - Bit Shifts, Rotations & Integer Arithmetic (Chapter 7)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, Repeat, ArrowRight, Divide, Binary, Calculator, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChapterQuiz, QuizQuestion } from '../shared/ChapterQuiz';

const ch7Questions: QuizQuestion[] = [
  {
    id: 'ch7-q1',
    question: 'How does SAR (Shift Arithmetic Right) differ from SHR (Shift Logical Right) when operating on a negative number?',
    options: [
      'SAR duplicates the sign bit (MSB) into vacated positions on the left to preserve the negative sign, whereas SHR always inserts zeros',
      'SAR shifts bits to the left while SHR shifts to the right',
      'SAR does not affect the Carry Flag (CF)',
      'SAR performs division by 3 instead of division by 2'
    ],
    correctIndex: 0,
    explanation: 'SAR preserves the number\'s sign by filling newly emptied high-order bits with copies of the existing sign bit (Bit 7 or Bit 31). This allows arithmetic division of negative integers by powers of 2. SHR always shifts in 0s, turning negative numbers into large positive numbers.'
  },
  {
    id: 'ch7-q2',
    question: 'What is the exact mathematical effect of executing the assembly instruction "shl eax, 3"?',
    options: [
      'Multiplies EAX by 8 (EAX × 2^3)',
      'Divides EAX by 8',
      'Adds 3 to the contents of EAX',
      'Multiplies EAX by 3'
    ],
    correctIndex: 0,
    explanation: 'Each left shift by 1 bit multiplies the integer value by 2. Shifting left by n bits multiplies by 2^n. Thus, SHL EAX, 3 multiplies EAX by 2^3 = 8.'
  },
  {
    id: 'ch7-q3',
    question: 'Why must the CDQ instruction be executed immediately before "idiv ebx" when dividing a 32-bit signed integer in EAX?',
    options: [
      'CDQ sign-extends EAX across EDX to form the mandatory 64-bit signed dividend in EDX:EAX',
      'CDQ clears the EFLAGS register to prevent divide overflow traps',
      'CDQ checks whether the divisor EBX is zero',
      'CDQ converts decimal ASCII characters into binary machine integers'
    ],
    correctIndex: 0,
    explanation: '32-bit IDIV expects a 64-bit dividend in the register pair EDX:EAX. If EAX contains a negative number, EDX must be filled with FFFFFFFFh (-1); if positive, EDX must be 00000000h. CDQ automatically copies EAX\'s sign bit across all 32 bits of EDX.'
  },
  {
    id: 'ch7-q4',
    question: 'After executing a 32-bit integer division ("div ebx" or "idiv ebx"), which register holds the remainder?',
    options: [
      'EDX',
      'EAX',
      'EBX',
      'ECX'
    ],
    correctIndex: 0,
    explanation: 'For a 32-bit DIV/IDIV, the quotient is stored in EAX, and the remainder is stored in EDX.'
  }
];

export const Ch7Page: React.FC = () => {
  const [val, setVal] = useState<number>(0b10010110); // 96h = 150
  const [shiftOp, setShiftOp] = useState<'shl' | 'shr' | 'sar' | 'rol' | 'ror'>('shl');
  const [count, setCount] = useState<number>(1);

  // Bit calculation
  const bits8 = (val & 0xff).toString(2).padStart(8, '0').split('');

  // Result calculation
  let res = val & 0xff;
  let cf = 0;
  if (shiftOp === 'shl') {
    cf = ((res >> (8 - count)) & 1) || 0;
    res = (res << count) & 0xff;
  } else if (shiftOp === 'shr') {
    cf = ((res >> (count - 1)) & 1) || 0;
    res = (res >> count) & 0xff;
  } else if (shiftOp === 'sar') {
    const signBit = res & 0x80;
    for (let i = 0; i < count; i++) {
      cf = res & 1;
      res = ((res >> 1) | signBit) & 0xff;
    }
  } else if (shiftOp === 'rol') {
    for (let i = 0; i < count; i++) {
      const msb = (res >> 7) & 1;
      res = ((res << 1) | msb) & 0xff;
      cf = msb;
    }
  } else if (shiftOp === 'ror') {
    for (let i = 0; i < count; i++) {
      const lsb = res & 1;
      res = ((res >> 1) | (lsb << 7)) & 0xff;
      cf = lsb;
    }
  }

  const resBits8 = res.toString(2).padStart(8, '0').split('');

  // Multiplier / Divider test (Unsigned vs Signed mode)
  const [isSignedMulDiv, setIsSignedMulDiv] = useState<boolean>(false);
  const [mulA, setMulA] = useState<number>(50);
  const [mulB, setMulB] = useState<number>(4);

  // Unsigned Multiply
  const fullMulProdUnsigned = BigInt(mulA >>> 0) * BigInt(mulB >>> 0);
  const mulLowUnsigned = Number(fullMulProdUnsigned & BigInt(0xffffffff)) >>> 0;
  const mulHighUnsigned = Number((fullMulProdUnsigned >> BigInt(32)) & BigInt(0xffffffff)) >>> 0;

  // Signed Multiply (IMUL)
  const fullMulProdSigned = BigInt(mulA | 0) * BigInt(mulB | 0);
  const mulLowSigned = Number(BigInt.asIntN(32, fullMulProdSigned));
  const mulHighSigned = Number(BigInt.asIntN(32, fullMulProdSigned >> BigInt(32)));
  const mulLowSignedHex = ((mulLowSigned & 0xffffffff) >>> 0).toString(16).toUpperCase().padStart(8, '0') + 'h';
  const mulHighSignedHex = ((mulHighSigned & 0xffffffff) >>> 0).toString(16).toUpperCase().padStart(8, '0') + 'h';

  // Division
  const [divNum, setDivNum] = useState<number>(200);
  const [divDen, setDivDen] = useState<number>(6);

  // Unsigned Division (DIV)
  const divQuotUnsigned = Math.floor((divNum >>> 0) / ((divDen >>> 0) || 1));
  const divRemUnsigned = (divNum >>> 0) % ((divDen >>> 0) || 1);

  // Signed Division (IDIV with CDQ)
  const sDivNum = divNum | 0;
  const sDivDen = (divDen | 0) || 1;
  const cdqEdx = sDivNum < 0 ? -1 : 0;
  const cdqEdxHex = ((cdqEdx & 0xffffffff) >>> 0).toString(16).toUpperCase().padStart(8, '0') + 'h';
  const divQuotSigned = Math.trunc(sDivNum / sDivDen);
  const divRemSigned = sDivNum % sDivDen;

  // Widget 3: 16-Bit MS-DOS Date Extractor
  const [dosYear, setDosYear] = useState<number>(2026);
  const [dosMonth, setDosMonth] = useState<number>(10);
  const [dosDay, setDosDay] = useState<number>(20);

  const yearOffset = Math.max(0, Math.min(127, dosYear - 1980));
  const cleanMonth = Math.max(1, Math.min(12, dosMonth));
  const cleanDay = Math.max(1, Math.min(31, dosDay));
  const packedDX = (((yearOffset & 0x7f) << 9) | ((cleanMonth & 0x0f) << 5) | (cleanDay & 0x1f)) & 0xffff;
  const dxHex = packedDX.toString(16).toUpperCase().padStart(4, '0') + 'h';
  const dxBin16 = packedDX.toString(2).padStart(16, '0');
  const yearBits = dxBin16.slice(0, 7);
  const monthBits = dxBin16.slice(7, 11);
  const dayBits = dxBin16.slice(11, 16);

  const sampleCode = `INCLUDE Irvine32.inc

.code
main PROC
    ; Bit shifting (multiply by 8)
    mov eax, 15
    shl eax, 3       ; 15 * 8 = 120
    call WriteInt
    call Crlf

    ; Rotate right by 1
    mov al, 96h
    ror al, 1
    call DumpRegs

    ; 32-bit Multiply
    mov eax, 1000
    mov ebx, 500
    mul ebx          ; EDX:EAX = 500,000

    ; 32-bit Divide
    mov edx, 0       ; clear high dividend
    mov ebx, 7
    div ebx          ; EAX = Quotient, EDX = Remainder
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
            <span>Chapter 7: Shifts, Rotations & Integer Arithmetic</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            COE224 • Bitwise SHL, SHR, ROL, ROR with Carry Flag, and 32-bit MUL / DIV Register Pairs
          </p>
        </div>
        <OpenInPlayground code={sampleCode} />
      </div>

      {/* Widget 1: Interactive Shift / Rotate Barrel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Repeat size={18} />
            <span>Interactive Shift & Rotate Barrel</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {(['shl', 'shr', 'sar', 'rol', 'ror'] as const).map((op) => (
              <button
                key={op}
                onClick={() => setShiftOp(op)}
                className={`px-2.5 py-1 rounded font-mono font-bold uppercase transition ${
                  shiftOp === op
                    ? 'bg-sky-600 text-white shadow'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* Input byte & shift count */}
        <div className="flex items-center justify-center gap-6 text-xs font-mono py-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-sans">Input Value (AL):</span>
            <input
              type="number"
              min="0"
              max="255"
              value={val}
              onChange={(e) => setVal(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-16 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-sky-300 font-bold text-center"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-sans">Shift Count:</span>
            <input
              type="number"
              min="1"
              max="7"
              value={count}
              onChange={(e) => setCount(Math.min(7, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-12 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-teal-300 font-bold text-center"
            />
          </div>
        </div>

        {/* Bit Visualizer Before vs After */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-slate-500 font-sans block mb-1 text-[11px]">Before ({shiftOp.toUpperCase()} AL, {count}):</span>
            <div className="flex justify-center items-center gap-2">
              {bits8.map((b, idx) => (
                <div key={idx} className="w-9 h-11 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                  {b}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sky-400 font-sans text-xs">
            <ArrowRight size={16} />
            <span>Executing {shiftOp.toUpperCase()} {count} time(s)</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1 text-[11px] font-sans">
              <span className="text-slate-500">Result in AL:</span>
              <span className="text-amber-400 font-mono font-bold">Carry Flag (CF): {cf}</span>
            </div>
            <div className="flex justify-center items-center gap-2">
              {resBits8.map((b, idx) => (
                <div key={idx} className="w-9 h-11 rounded bg-sky-950/40 border border-sky-500/50 flex items-center justify-center text-sm font-bold text-sky-300">
                  {b}
                </div>
              ))}
              <div className="w-9 h-11 rounded bg-amber-950/40 border border-amber-500 flex flex-col items-center justify-center text-[10px] text-amber-300 font-bold ml-2">
                <span>CF</span>
                <span>{cf}</span>
              </div>
            </div>
          </div>

          {shiftOp === 'sar' && (
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
              💡 <strong>SAR (Shift Arithmetic Right):</strong> Duplicates the original sign bit (Bit 7 = <span className="font-mono text-amber-300 font-bold">{(val & 0x80) ? '1 (Negative)' : '0 (Positive)'}</span>) into the high-order bits. This preserves signed negative integer values during division by powers of 2 (unlike SHR, which fills high bits with 0).
            </div>
          )}
        </div>
      </div>

      {/* Widget 2: MUL & DIV Visualizer (Unsigned vs Signed Toggle) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Calculator size={18} />
            <span>32-bit Integer Arithmetic: Multiplication & Division</span>
          </div>
          <button
            onClick={() => setIsSignedMulDiv(!isSignedMulDiv)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition border ${
              isSignedMulDiv
                ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                : 'bg-teal-500/20 border-teal-400 text-teal-300'
            }`}
          >
            Mode: {isSignedMulDiv ? 'Signed (IMUL / CDQ + IDIV)' : 'Unsigned (MUL / DIV)'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Multiplication Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-teal-400 font-sans text-sm flex items-center gap-1.5">
                <Repeat size={16} />
                <span>{isSignedMulDiv ? 'Signed (IMUL EBX)' : 'Unsigned (MUL EBX)'}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-sans">
                {isSignedMulDiv ? 'Signed 64-bit Product' : 'Unsigned 64-bit Product'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="font-sans">EAX (Multiplicand):</span>
              <input
                type="number"
                value={mulA}
                onChange={(e) => setMulA(parseInt(e.target.value) || 0)}
                className="w-28 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-right text-sky-300 font-bold"
              />
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-sans">EBX (Multiplier):</span>
              <input
                type="number"
                value={mulB}
                onChange={(e) => setMulB(parseInt(e.target.value) || 0)}
                className="w-28 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-right text-teal-300 font-bold"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 pt-2">
              <span className="text-[10px] text-slate-400 font-sans block">Result register pair (EDX:EAX):</span>
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span>EDX: {isSignedMulDiv ? `${mulHighSignedHex} (${mulHighSigned})` : mulHighUnsigned}</span>
                <span>EAX: {isSignedMulDiv ? `${mulLowSignedHex} (${mulLowSigned})` : mulLowUnsigned}</span>
              </div>
            </div>
          </div>

          {/* Division Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 font-sans text-sm flex items-center gap-1.5">
                <Divide size={16} />
                <span>{isSignedMulDiv ? 'Signed (CDQ + IDIV EBX)' : 'Unsigned (DIV EBX)'}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-sans">
                {isSignedMulDiv ? 'CDQ Required' : 'EDX:EAX / EBX'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="font-sans">Dividend (EAX):</span>
              <input
                type="number"
                value={divNum}
                onChange={(e) => setDivNum(parseInt(e.target.value) || 0)}
                className="w-28 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-right text-sky-300 font-bold"
              />
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-sans">Divisor (EBX):</span>
              <input
                type="number"
                value={divDen}
                onChange={(e) => setDivDen(parseInt(e.target.value) || 1)}
                className="w-28 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-right text-teal-300 font-bold"
              />
            </div>

            {isSignedMulDiv && (
              <div className="p-2 rounded bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200 font-sans">
                ⚠️ <strong>CDQ Prerequisite:</strong> Sets EDX = <code className="font-mono font-bold text-amber-300">{cdqEdxHex}</code> ({cdqEdx}) by sign-extending EAX.
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 pt-2">
              <span className="text-[10px] text-slate-400 font-sans block">Division Output Registers:</span>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-400">
                  Quotient (EAX): {isSignedMulDiv ? divQuotSigned : divQuotUnsigned}
                </span>
                <span className="text-amber-400">
                  Remainder (EDX): {isSignedMulDiv ? divRemSigned : divRemUnsigned}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget 3: 16-Bit MS-DOS File Date Stamp Bitfield Extractor */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Binary size={18} />
            <span>16-Bit MS-DOS File Date Stamp Bitfield Extractor (DX Register)</span>
          </div>
          <span className="text-xs text-slate-400">Kip Irvine Section 7.4 Bit String Extraction</span>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-sans">Year (1980–2107):</label>
            <input
              type="number"
              min="1980"
              max="2107"
              value={dosYear}
              onChange={(e) => setDosYear(Math.min(2107, Math.max(1980, parseInt(e.target.value) || 1980)))}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-purple-500/50 text-purple-300 font-bold"
            />
            <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">
              Offset: {yearOffset} (Bits 15–9)
            </span>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-sans">Month (1–12):</label>
            <input
              type="number"
              min="1"
              max="12"
              value={dosMonth}
              onChange={(e) => setDosMonth(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-teal-500/50 text-teal-300 font-bold"
            />
            <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">
              Value: {cleanMonth} (Bits 8–5)
            </span>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-sans">Day (1–31):</label>
            <input
              type="number"
              min="1"
              max="31"
              value={dosDay}
              onChange={(e) => setDosDay(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-1.5 rounded bg-slate-900 border border-sky-500/50 text-sky-300 font-bold"
            />
            <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">
              Value: {cleanDay} (Bits 4–0)
            </span>
          </div>
        </div>

        {/* 16-Bit Packed Visual Strip */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 font-sans">
            <span>Packed DX Register: <strong className="text-amber-300 font-mono">{dxHex}</strong></span>
            <span>Binary (16 bits)</span>
          </div>

          {/* Color-coded Bitfield */}
          <div className="overflow-x-auto pb-1">
            <div className="flex items-center gap-1 justify-center min-w-[500px]">
              {/* Year: Bits 15-9 */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-purple-400 font-bold mb-1">Year (Bits 15–9)</span>
                <div className="flex gap-1 p-1 rounded bg-purple-950/40 border border-purple-500/40">
                  {yearBits.split('').map((b, i) => (
                    <span key={i} className="w-6 h-7 rounded bg-slate-900 flex items-center justify-center font-bold text-purple-300 text-xs">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Month: Bits 8-5 */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-teal-400 font-bold mb-1">Month (8–5)</span>
                <div className="flex gap-1 p-1 rounded bg-teal-950/40 border border-teal-500/40">
                  {monthBits.split('').map((b, i) => (
                    <span key={i} className="w-6 h-7 rounded bg-slate-900 flex items-center justify-center font-bold text-teal-300 text-xs">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Day: Bits 4-0 */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-sky-400 font-bold mb-1">Day (4–0)</span>
                <div className="flex gap-1 p-1 rounded bg-sky-950/40 border border-sky-500/40">
                  {dayBits.split('').map((b, i) => (
                    <span key={i} className="w-6 h-7 rounded bg-slate-900 flex items-center justify-center font-bold text-sky-300 text-xs">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Extraction Assembly Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-900 border border-sky-500/30 space-y-1">
              <span className="text-sky-400 font-bold block">1. Extract Day (Bits 4–0):</span>
              <pre className="text-slate-300 text-[11px] leading-relaxed">
{`mov ax, dx
and al, 00011111b
; AL = ${cleanDay}`}
              </pre>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-teal-500/30 space-y-1">
              <span className="text-teal-400 font-bold block">2. Extract Month (Bits 8–5):</span>
              <pre className="text-slate-300 text-[11px] leading-relaxed">
{`mov ax, dx
shr ax, 5
and al, 00001111b
; AL = ${cleanMonth}`}
              </pre>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-purple-500/30 space-y-1">
              <span className="text-purple-400 font-bold block">3. Extract Year (Bits 15–9):</span>
              <pre className="text-slate-300 text-[11px] leading-relaxed">
{`mov ax, dx
shr ax, 9
add ax, 1980
; AX = ${dosYear}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter 7 Quiz */}
      <ChapterQuiz chapter={7} questions={ch7Questions} />
    </div>
  );
};
