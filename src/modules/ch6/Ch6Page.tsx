// COE224: Module 6 - Conditional Processing & Branching (Chapter 6)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, GitBranch, Check, X, Binary, Terminal, ShieldAlert, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FlagEngine } from '../../engine/flags';
import { ChapterQuiz, QuizQuestion } from '../shared/ChapterQuiz';

const ch6Questions: QuizQuestion[] = [
  {
    id: 'ch6-q1',
    question: 'What is the primary difference between the TEST and AND instructions in IA-32?',
    options: [
      'TEST performs a bitwise AND and updates status flags (ZF, SF, PF), but does NOT modify the destination operand',
      'TEST alters the destination register while AND is non-destructive',
      'TEST only works with 8-bit registers like AL',
      'TEST inverts all destination bits like a bitwise NOT'
    ],
    correctIndex: 0,
    explanation: 'TEST performs an implied bitwise AND: it updates the status flags (especially Zero Flag ZF) but leaves both source and destination operands completely unchanged.'
  },
  {
    id: 'ch6-q2',
    question: 'Which instruction clears Bit 5 to convert a lowercase ASCII letter in AL (\'a\' = 61h) to uppercase (\'A\' = 41h)?',
    options: [
      'and al, 11011111b (or and al, 0DFh)',
      'or al, 00100000b (or or al, 20h)',
      'xor al, 11111111b',
      'not al'
    ],
    correctIndex: 0,
    explanation: 'Bit 5 distinguishes lowercase (1) from uppercase (0) in ASCII. ANDing with 11011111b forces Bit 5 to 0 while leaving all other 7 bits intact.'
  },
  {
    id: 'ch6-q3',
    question: 'If AL contains -5 (FBh) and BL contains +10 (0Ah), which jump is taken after executing "cmp al, bl"?',
    options: [
      'JL (Jump if Less - signed comparison: -5 is less than +10)',
      'JA (Jump if Above - treats FBh as unsigned 251, which is above 10)',
      'JE (Jump if Equal)',
      'JAE (Jump if Above or Equal)'
    ],
    correctIndex: 0,
    explanation: 'For signed integers, you MUST use signed jumps (JL, JLE, JG, JGE). Using unsigned jump JA would treat -5 (FBh = 251) as greater than +10 (0Ah = 10)!'
  },
  {
    id: 'ch6-q4',
    question: 'When the CPU executes "CMP destination, source", which internal operation updates the EFLAGS register?',
    options: [
      'destination - source (subtraction that discards the numerical result and only updates flags)',
      'destination + source (addition)',
      'destination XOR source',
      'source - destination'
    ],
    correctIndex: 0,
    explanation: 'CMP performs an implied SUB (destination - source). It evaluates and updates ZF, CF, SF, OF, and PF, but discards the difference without modifying either operand.'
  }
];

function traceFSM(input: string) {
  let state = 'A';
  const steps: Array<{ char: string; from: string; to: string; valid: boolean }> = [];

  for (const char of input) {
    let next = 'ERR';
    if (state === 'A') {
      if (char === '+' || char === '-') next = 'B';
      else if (char >= '0' && char <= '9') next = 'C';
    } else if (state === 'B') {
      if (char >= '0' && char <= '9') next = 'C';
    } else if (state === 'C') {
      if (char >= '0' && char <= '9') next = 'C';
    }

    steps.push({ char, from: state, to: next, valid: next !== 'ERR' });
    state = next;
    if (state === 'ERR') break;
  }

  return { finalState: state, steps, isValid: state === 'C' };
}

export const Ch6Page: React.FC = () => {
  const [opA, setOpA] = useState<number>(10);
  const [opB, setOpB] = useState<number>(20);

  // Widget 2: Bit-Masking Workbench State
  const [maskPreset, setMaskPreset] = useState<number>(0);
  const [cipherToggled, setCipherToggled] = useState<boolean>(false);
  const [testOddVal, setTestOddVal] = useState<number>(12); // for TEST preset

  // Widget 3: FSM State
  const [fsmInput, setFsmInput] = useState<string>('-425');
  const fsmResult = traceFSM(fsmInput);

  // CMP EAX, EBX computes flags for opA - opB
  const flags = FlagEngine.computeSubFlags(opA, opB, 4);
  const zf = flags.ZF;
  const sf = flags.SF;
  const cf = flags.CF;
  const of = flags.OF;

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

      {/* Widget 2: Bit-Masking Workbench */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Binary size={18} />
            <span>Bit-Masking Workbench (AND, OR, XOR, TEST Applications)</span>
          </div>
          <span className="text-xs text-slate-400">Kip Irvine Chapter 6 Practical Bit Manipulation</span>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 0, label: "1. Lowercase → Uppercase (AND)" },
            { id: 1, label: "2. Integer → ASCII '0'-'9' (OR)" },
            { id: 2, label: "3. Test Even/Odd (TEST)" },
            { id: 3, label: "4. Symmetric Cipher (XOR)" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setMaskPreset(p.id);
                setCipherToggled(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition ${
                maskPreset === p.id
                  ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Workbench Execution Card */}
        {(() => {
          let instructionText = '';
          let inputByte = 0x61;
          let maskByte = 0xdf;
          let outputByte = 0x41;
          let explanation = '';
          let isTest = false;
          let testZF = 0;

          if (maskPreset === 0) {
            instructionText = 'and al, 11011111b    ; Clears Bit 5 (0DFh)';
            inputByte = 0x61; // 'a'
            maskByte = 0xdf; // 11011111b
            outputByte = (inputByte & maskByte) & 0xff;
            explanation = "ASCII lowercase letters have Bit 5 set to 1 ('a' = 01100001b). ANDing with 11011111b forces Bit 5 to 0 without affecting any other bits, yielding uppercase 'A' (01000001b = 41h).";
          } else if (maskPreset === 1) {
            instructionText = 'or al, 00110000b     ; Sets Bits 4 & 5 (30h)';
            inputByte = 0x05; // Integer 5
            maskByte = 0x30; // 00110000b
            outputByte = (inputByte | maskByte) & 0xff;
            explanation = "Any numeric digit 0..9 can be converted directly into its printable ASCII character ('0'..'9') by ORing with 00110000b (30h). Here, 05h becomes 35h ('5').";
          } else if (maskPreset === 2) {
            isTest = true;
            instructionText = 'test al, 00000001b    ; Non-destructive bit test';
            inputByte = testOddVal & 0xff;
            maskByte = 0x01;
            outputByte = inputByte; // TEST does not alter destination
            testZF = (inputByte & 1) === 0 ? 1 : 0;
            explanation = `TEST performs an implied AND between AL and 00000001b (checking Bit 0). If Bit 0 is 0, the number is EVEN and ZF=1. If Bit 0 is 1, the number is ODD and ZF=0. Crucially, AL retains its original value (${inputByte})!`;
          } else {
            const isEncrypted = cipherToggled;
            inputByte = isEncrypted ? 0x1b : 0x41; // 'A' or cipher byte
            maskByte = 0x5a; // Encryption key
            outputByte = (inputByte ^ maskByte) & 0xff;
            instructionText = `xor al, 5Ah           ; Symmetric encryption key (5Ah)`;
            explanation = `XOR is self-inverting: (A ⊕ Key) ⊕ Key = A. Applying the same XOR key a second time decrypts the cipher byte back into the original plaintext character!`;
          }

          const inBin = inputByte.toString(2).padStart(8, '0');
          const maskBin = maskByte.toString(2).padStart(8, '0');
          const outBin = outputByte.toString(2).padStart(8, '0');

          return (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="text-amber-300 font-bold text-sm">{instructionText}</div>
                {maskPreset === 2 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTestOddVal(12)}
                      className={`px-2 py-0.5 rounded text-xs border ${
                        testOddVal % 2 === 0
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Test Even (12)
                    </button>
                    <button
                      onClick={() => setTestOddVal(13)}
                      className={`px-2 py-0.5 rounded text-xs border ${
                        testOddVal % 2 === 1
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Test Odd (13)
                    </button>
                  </div>
                )}
                {maskPreset === 3 && (
                  <button
                    onClick={() => setCipherToggled(!cipherToggled)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold transition"
                  >
                    <RefreshCw size={12} />
                    <span>{cipherToggled ? 'Decrypt: XOR 5Ah Again' : 'Encrypt: XOR 5Ah'}</span>
                  </button>
                )}
              </div>

              {/* Bit Breakdown Matrix */}
              <div className="space-y-2">
                {/* Input row */}
                <div className="flex items-center justify-between p-2 rounded bg-slate-900">
                  <span className="text-slate-400 w-36">Input AL:</span>
                  <div className="flex gap-1.5 font-bold text-sky-300">
                    {inBin.split('').map((b, i) => (
                      <span key={i} className="w-6 text-center">{b}</span>
                    ))}
                  </div>
                  <span className="text-slate-400 w-24 text-right">
                    {inputByte.toString(16).toUpperCase().padStart(2, '0')}h ({maskPreset === 0 || maskPreset === 3 ? `'${String.fromCharCode(inputByte)}'` : inputByte})
                  </span>
                </div>

                {/* Mask row */}
                <div className="flex items-center justify-between p-2 rounded bg-slate-900">
                  <span className="text-amber-400 w-36">
                    {maskPreset === 0 ? 'AND Mask:' : maskPreset === 1 ? 'OR Mask:' : maskPreset === 2 ? 'TEST Mask:' : 'XOR Key:'}
                  </span>
                  <div className="flex gap-1.5 font-bold text-amber-300">
                    {maskBin.split('').map((b, i) => (
                      <span key={i} className="w-6 text-center">{b}</span>
                    ))}
                  </div>
                  <span className="text-amber-400 w-24 text-right">
                    {maskByte.toString(16).toUpperCase().padStart(2, '0')}h
                  </span>
                </div>

                {/* Result row */}
                <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-teal-500/40">
                  <span className="text-teal-400 font-bold w-36">
                    {isTest ? 'AL (Unchanged):' : 'Output AL:'}
                  </span>
                  <div className="flex gap-1.5 font-bold text-teal-300">
                    {outBin.split('').map((b, i) => (
                      <span key={i} className="w-6 text-center">{b}</span>
                    ))}
                  </div>
                  <span className="text-teal-400 font-bold w-24 text-right">
                    {outputByte.toString(16).toUpperCase().padStart(2, '0')}h {maskPreset === 0 || (maskPreset === 3 && cipherToggled) ? `'${String.fromCharCode(outputByte)}'` : ''}
                  </span>
                </div>
              </div>

              {/* Status and Explanation */}
              {isTest && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-300 font-sans">EFLAGS Zero Flag (ZF):</span>
                  <span className={`px-2 py-0.5 rounded font-bold font-mono ${
                    testZF === 1 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    ZF = {testZF} ({testZF === 1 ? 'EVEN NUMBER (Bit 0 was 0)' : 'ODD NUMBER (Bit 0 was 1)'})
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                💡 {explanation}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Widget 3: Finite-State Machine Signed Integer Validator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Terminal size={18} />
            <span>Finite-State Machine (FSM) Signed Integer Parser</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Presets:</span>
            {['-425', '+12', '999', '--5', '12a'].map((p) => (
              <button
                key={p}
                onClick={() => setFsmInput(p)}
                className={`px-2 py-0.5 text-xs font-mono rounded border transition ${
                  fsmInput === p
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>

        {/* Input Field */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs">
          <label className="text-slate-400 font-sans whitespace-nowrap">Input String to Validate:</label>
          <input
            type="text"
            value={fsmInput}
            onChange={(e) => setFsmInput(e.target.value)}
            placeholder="e.g. -425, +12, 100..."
            className="flex-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-sky-300 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>

        {/* 3 FSM States Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* State A */}
          <div className={`p-4 rounded-xl border transition-all text-center space-y-2 ${
            fsmResult.finalState === 'A'
              ? 'bg-sky-950/40 border-sky-400 shadow-lg shadow-sky-950/50'
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="font-mono text-xs font-bold text-sky-400 uppercase">State A (Start)</div>
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-sky-500 flex items-center justify-center font-bold text-lg text-white">
              A
            </div>
            <p className="text-[11px] text-slate-400 leading-tight font-sans">
              Initial state. Expects leading '+' or '-' (to State B) or digit (to State C).
            </p>
          </div>

          {/* State B */}
          <div className={`p-4 rounded-xl border transition-all text-center space-y-2 ${
            fsmResult.finalState === 'B'
              ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-950/50'
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="font-mono text-xs font-bold text-amber-400 uppercase">State B (Sign Seen)</div>
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-amber-500 flex items-center justify-center font-bold text-lg text-white">
              B
            </div>
            <p className="text-[11px] text-slate-400 leading-tight font-sans">
              Saw leading sign. MUST be followed by at least one digit (to State C). Non-accepting!
            </p>
          </div>

          {/* State C (Accepting) */}
          <div className={`p-4 rounded-xl border transition-all text-center space-y-2 ${
            fsmResult.isValid
              ? 'bg-emerald-950/40 border-emerald-400 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-500/20'
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="font-mono text-xs font-bold text-emerald-400 uppercase">State C (Accepting ✓)</div>
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-double border-emerald-400 flex items-center justify-center font-bold text-lg text-emerald-200">
              C
            </div>
            <p className="text-[11px] text-slate-400 leading-tight font-sans">
              Reading numeric digits. Double circle indicates valid integer acceptance!
            </p>
          </div>
        </div>

        {/* Character Step Trace */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 font-sans">FSM Transition Trace:</span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-sans ${
              fsmResult.isValid
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
            }`}>
              {fsmResult.isValid ? 'VALID SIGNED INTEGER' : 'INVALID INTEGER'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {fsmResult.steps.map((step, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border flex items-center gap-2 ${
                  step.valid ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-rose-950/40 border-rose-500 text-rose-300'
                }`}
              >
                <span className="font-bold text-amber-300">'{step.char}'</span>
                <span className="text-slate-500">:</span>
                <span>{step.from} → {step.to}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed border-t border-slate-900 pt-2">
            {fsmResult.isValid
              ? `✓ Input "${fsmInput}" successfully completed all transitions and terminated in accepting State C.`
              : `✗ Input "${fsmInput}" is not a valid signed integer: ${
                  fsmResult.finalState === 'ERR'
                    ? 'Encountered unexpected non-digit character.'
                    : fsmResult.finalState === 'B'
                    ? 'Terminated on a sign character without any subsequent numeric digits.'
                    : 'Input string is empty.'
                }`}
          </p>
        </div>
      </div>

      {/* Chapter 6 Quiz */}
      <ChapterQuiz chapter={6} questions={ch6Questions} />
    </div>
  );
};
