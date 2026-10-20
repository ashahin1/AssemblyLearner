// COE224: Module 4 - Data Transfers, Addressing & Little-Endian (Chapter 4)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, Binary, HelpCircle, Check, X, Layers, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChapterQuiz, QuizQuestion } from '../shared/ChapterQuiz';

const ch4Questions: QuizQuestion[] = [
  {
    id: 'ch4-q1',
    question: 'If "val DWORD 12345678h" is stored at address 00404000h in Little-Endian format, what byte value is stored at memory address 00404000h?',
    options: ['78h', '12h', '34h', '56h'],
    correctIndex: 0,
    explanation: 'x86 architecture is Little-Endian: the least significant byte (78h) is stored at the lowest memory address (+0). The most significant byte (12h) is stored at +3.'
  },
  {
    id: 'ch4-q2',
    question: 'If register BL contains 80h (-128 decimal), what value is in EAX after executing "movsx eax, bl"?',
    options: ['FFFFFF80h', '00000080h', '00000000h', '80000000h'],
    correctIndex: 0,
    explanation: 'MOVSX copies the source sign bit (Bit 7, which is 1 for 80h) across the entire upper 24 bits of EAX. The result is FFFFFF80h (-128 decimal). MOVZX would have placed zeros (00000080h = +128).'
  },
  {
    id: 'ch4-q3',
    question: 'For the array definition "myList WORD 5 DUP(10h)", what value is evaluated by "SIZEOF myList"?',
    options: ['10', '5', '2', '20'],
    correctIndex: 0,
    explanation: 'SIZEOF = LENGTHOF × TYPE. Here, LENGTHOF is 5 elements and TYPE is WORD (2 bytes). 5 × 2 = 10 total bytes in memory.'
  },
  {
    id: 'ch4-q4',
    question: 'Why does the MASM instruction "mov var1, var2" produce an assembler error in IA-32?',
    options: [
      'The x86 architecture does not support direct memory-to-memory data transfers; at least one operand must be a register',
      'Memory variables cannot have the same data size in a single instruction',
      'The instruction must use OFFSET keyword whenever referencing two variables',
      'Direct memory variables cannot be accessed without segment registers'
    ],
    correctIndex: 0,
    explanation: 'x86 instruction encoding only permits a single memory address specifier per instruction. To copy from memory to memory, an intermediate register must be used (e.g. mov eax, var2 then mov var1, eax).'
  }
];

const ARRAY_PRESETS = [
  { label: 'arrB BYTE 10, 20, 30, 40', name: 'arrB', typeBytes: 1, length: 4, typeName: 'BYTE' },
  { label: 'arrW WORD 100h, 200h, 300h', name: 'arrW', typeBytes: 2, length: 3, typeName: 'WORD' },
  { label: 'arrD DWORD 5 DUP(0)', name: 'arrD', typeBytes: 4, length: 5, typeName: 'DWORD' },
  { label: 'matrix WORD 4 DUP(3 DUP(0))', name: 'matrix', typeBytes: 2, length: 12, typeName: 'WORD' },
  { label: 'msg BYTE "COE224", 0', name: 'msg', typeBytes: 1, length: 7, typeName: 'BYTE' },
];

export const Ch4Page: React.FC = () => {
  const [hexInput, setHexInput] = useState<string>('12345678');
  const [movSrc, setMovSrc] = useState<'reg' | 'mem' | 'imm'>('mem');
  const [movDest, setMovDest] = useState<'reg' | 'mem'>('mem');

  // Widget 3: MOVZX vs MOVSX state
  const [extInputHex, setExtInputHex] = useState<string>('80');

  // Widget 4: Array operator state
  const [selectedArrayIdx, setSelectedArrayIdx] = useState<number>(2);

  // Little endian byte splitting
  const cleanHex = hexInput.padStart(8, '0').slice(-8).toUpperCase();
  const b0 = cleanHex.slice(6, 8); // lowest byte (byte 0)
  const b1 = cleanHex.slice(4, 6);
  const b2 = cleanHex.slice(2, 4);
  const b3 = cleanHex.slice(0, 2); // highest byte (byte 3)

  // MOV legality
  const isMovValid = !(movSrc === 'mem' && movDest === 'mem');

  // MOVZX vs MOVSX calculations
  const byteVal = parseInt(extInputHex || '0', 16) & 0xff;
  const isNegative = (byteVal & 0x80) !== 0;
  const bin8 = byteVal.toString(2).padStart(8, '0');
  const movzxHex = byteVal.toString(16).toUpperCase().padStart(8, '0') + 'h';
  const movsxVal = ((byteVal << 24) >> 24) >>> 0;
  const movsxHex = movsxVal.toString(16).toUpperCase().padStart(8, '0') + 'h';
  const signedDec = isNegative ? byteVal - 256 : byteVal;

  // Array Operator calculations
  const currentArr = ARRAY_PRESETS[selectedArrayIdx] || ARRAY_PRESETS[0];
  const totalBytes = currentArr.typeBytes * currentArr.length;

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

      {/* Widget 3: MOVZX vs MOVSX Extension Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Binary size={18} />
            <span>MOVZX vs. MOVSX (Zero-Extension vs. Sign-Extension)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Presets:</span>
            {[
              { label: '80h (-128 / +128)', hex: '80' },
              { label: '7Fh (+127)', hex: '7F' },
              { label: 'FFh (-1 / 255)', hex: 'FF' },
              { label: 'A5h (-91 / 165)', hex: 'A5' },
            ].map((p) => (
              <button
                key={p.hex}
                onClick={() => setExtInputHex(p.hex)}
                className={`px-2 py-1 text-xs font-mono rounded border transition ${
                  extInputHex.toUpperCase() === p.hex
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Source Byte Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400 font-sans">Source 8-bit Register (BL):</span>
              <input
                type="text"
                maxLength={2}
                value={extInputHex}
                onChange={(e) => setExtInputHex(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
                className="w-16 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-purple-300 text-center font-bold"
              />
              <span className="text-purple-400 font-bold">h</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400 font-sans">Sign Bit (Bit 7):</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                isNegative
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                  : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              }`}>
                {isNegative ? '1 (NEGATIVE)' : '0 (POSITIVE / ZERO)'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 py-2 font-mono">
            {bin8.split('').map((bit, idx) => {
              const isBit7 = idx === 0;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500">{7 - idx}</span>
                  <span className={`w-8 h-9 rounded flex items-center justify-center font-bold text-sm border ${
                    isBit7
                      ? isNegative
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                        : 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    {bit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* MOVZX */}
          <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-950/10 space-y-3">
            <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
              <span className="font-mono text-sm font-bold text-sky-400">
                MOVZX EAX, BL
              </span>
              <span className="text-[11px] text-sky-300 font-sans font-semibold">Zero-Extension</span>
            </div>
            <div className="font-mono text-center space-y-1">
              <div className="text-xl font-bold text-sky-300">{movzxHex}</div>
              <div className="text-xs text-slate-400">
                Decimal: <span className="text-sky-300 font-bold">{byteVal}</span> (Unsigned)
              </div>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              Fills the upper 24 bits with <strong className="text-sky-300 font-mono">000000h</strong>, regardless of the sign bit. Used for copying unsigned variables into larger registers.
            </div>
          </div>

          {/* MOVSX */}
          <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/10 space-y-3">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
              <span className="font-mono text-sm font-bold text-purple-400">
                MOVSX EAX, BL
              </span>
              <span className="text-[11px] text-purple-300 font-sans font-semibold">Sign-Extension</span>
            </div>
            <div className="font-mono text-center space-y-1">
              <div className="text-xl font-bold text-purple-300">{movsxHex}</div>
              <div className="text-xs text-slate-400">
                Decimal: <span className={`font-bold ${signedDec < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{signedDec}</span> (Signed)
              </div>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              Copies the highest bit (<strong className={isNegative ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}>Bit 7 = {isNegative ? '1' : '0'}</strong>) across the upper 24 bits (<span className="font-mono font-semibold">{isNegative ? 'FFFFFFh' : '000000h'}</span>). Preserves negative values!
            </div>
          </div>
        </div>
      </div>

      {/* Widget 4: TYPE, LENGTHOF, and SIZEOF Array Lab */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Calculator size={18} />
            <span>Array Operator Lab (TYPE, LENGTHOF, SIZEOF & Memory Offsets)</span>
          </div>
          <span className="text-xs text-slate-400">Select an array definition:</span>
        </div>

        {/* Array Presets */}
        <div className="flex flex-wrap gap-2">
          {ARRAY_PRESETS.map((arr, idx) => (
            <button
              key={arr.name}
              onClick={() => setSelectedArrayIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition ${
                selectedArrayIdx === idx
                  ? 'bg-teal-500/20 border-teal-400 text-teal-200 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
              }`}
            >
              {arr.label}
            </button>
          ))}
        </div>

        {/* Operator Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              TYPE {currentArr.name}
            </span>
            <span className="text-2xl font-bold text-teal-400">{currentArr.typeBytes}</span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Bytes per element ({currentArr.typeName})
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              LENGTHOF {currentArr.name}
            </span>
            <span className="text-2xl font-bold text-sky-400">{currentArr.length}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Total elements</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              SIZEOF {currentArr.name}
            </span>
            <span className="text-2xl font-bold text-amber-400">{totalBytes}</span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Total bytes ({currentArr.length} × {currentArr.typeBytes})
            </span>
          </div>
        </div>

        {/* Memory Strip & Offset Addressing Lesson */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 font-sans">
            <span className="font-semibold text-slate-200">Memory Offset Layout:</span>
            <span>Index 0 to {Math.min(currentArr.length - 1, 5)}</span>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="flex items-center gap-2 min-w-max">
              {Array.from({ length: Math.min(currentArr.length, 6) }).map((_, i) => {
                const offset = i * currentArr.typeBytes;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-[10px] text-amber-400 font-bold mb-1">
                      [{currentArr.name} + {offset}]
                    </span>
                    <div className="px-3 py-2 rounded bg-slate-900 border border-teal-500/40 text-teal-300 font-bold text-center">
                      Elem [{i}]
                      <div className="text-[9px] text-slate-500 font-normal mt-0.5">
                        +{offset} .. +{offset + currentArr.typeBytes - 1}
                      </div>
                    </div>
                  </div>
                );
              })}
              {currentArr.length > 6 && (
                <div className="text-slate-600 text-xs px-2 font-mono">
                  ... ({currentArr.length - 6} more elements)
                </div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-300 font-sans leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            ⚠️ <strong>Common Exam Mistake:</strong> To access the second element of a <code className="text-teal-300 font-mono">DWORD</code> array, you must write <code className="text-amber-300 font-mono">mov eax, [arrD + 4]</code> (or <code className="text-amber-300 font-mono">[esi + TYPE arrD]</code>), <strong>NOT</strong> <code className="text-rose-400 font-mono">[arrD + 1]</code> which would read unaligned bytes across elements!
          </div>
        </div>
      </div>

      {/* Chapter 4 Quiz */}
      <ChapterQuiz chapter={4} questions={ch4Questions} />
    </div>
  );
};
