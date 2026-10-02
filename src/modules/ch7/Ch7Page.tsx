// COE224: Module 7 - Bit Shifts, Rotations & Integer Arithmetic (Chapter 7)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, Repeat, ArrowRight, Divide } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Ch7Page: React.FC = () => {
  const [val, setVal] = useState<number>(0b10010110); // 96h = 150
  const [shiftOp, setShiftOp] = useState<'shl' | 'shr' | 'rol' | 'ror'>('shl');
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

  // Multiplier / Divider test
  const [mulA, setMulA] = useState<number>(50);
  const [mulB, setMulB] = useState<number>(4);
  const mulProd = (mulA * mulB) >>> 0;

  const [divNum, setDivNum] = useState<number>(200);
  const [divDen, setDivDen] = useState<number>(6);
  const divQuot = Math.floor(divNum / (divDen || 1));
  const divRem = divNum % (divDen || 1);

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
            {(['shl', 'shr', 'rol', 'ror'] as const).map((op) => (
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
        </div>
      </div>

      {/* Widget 2: MUL & DIV Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Multiply */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-teal-400 font-bold font-sans text-sm border-b border-slate-800 pb-2">
            <Repeat size={16} />
            <span>32-bit Multiplication (MUL EBX)</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>EAX:</span>
            <input
              type="number"
              value={mulA}
              onChange={(e) => setMulA(parseInt(e.target.value) || 0)}
              className="w-24 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-right text-sky-300"
            />
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>EBX (Multiplier):</span>
            <input
              type="number"
              value={mulB}
              onChange={(e) => setMulB(parseInt(e.target.value) || 0)}
              className="w-24 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-right text-teal-300"
            />
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 pt-2">
            <span className="text-[10px] text-slate-400 font-sans block">Result register pair:</span>
            <div className="flex items-center justify-between text-sm font-bold text-amber-300">
              <span>EDX (High): 0</span>
              <span>EAX (Low): {mulProd}</span>
            </div>
          </div>
        </div>

        {/* Divide */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-sans text-sm border-b border-slate-800 pb-2">
            <Divide size={16} />
            <span>32-bit Division (DIV EBX)</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Dividend (EAX):</span>
            <input
              type="number"
              value={divNum}
              onChange={(e) => setDivNum(parseInt(e.target.value) || 0)}
              className="w-24 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-right text-sky-300"
            />
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Divisor (EBX):</span>
            <input
              type="number"
              value={divDen}
              onChange={(e) => setDivDen(parseInt(e.target.value) || 1)}
              className="w-24 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-right text-teal-300"
            />
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 pt-2">
            <span className="text-[10px] text-slate-400 font-sans block">Output registers:</span>
            <div className="flex items-center justify-between text-sm font-bold text-emerald-400">
              <span>EAX (Quotient): {divQuot}</span>
              <span className="text-amber-400">EDX (Remainder): {divRem}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
