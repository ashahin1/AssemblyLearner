// COE224: Module 3 - MASM Program Anatomy & Directives (Chapter 3)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, Code2, Database, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChapterQuiz, QuizQuestion } from '../shared/ChapterQuiz';
import { INSTRUCTIONS, ALL_REGISTERS, DIRECTIVES } from '../../engine/constants';

const ch3Questions: QuizQuestion[] = [
  {
    id: 'ch3-q1',
    question: 'Why does the MASM instruction "mov eax, A5h" fail to assemble with an error?',
    options: [
      'Hexadecimal constants starting with a letter (A–F) must begin with a leading zero (0A5h) so MASM does not confuse them with identifiers',
      'The 32-bit register EAX cannot accept an 8-bit immediate value',
      'The "h" suffix must always be uppercase "H"',
      'A5h is a reserved keyword in IA-32 assembly'
    ],
    correctIndex: 0,
    explanation: 'In MASM, numeric literals starting with a letter (A–F) MUST begin with a leading digit 0 (e.g., 0A5h). Otherwise, the assembler interprets the token as a variable or label identifier and raises an "undefined symbol" error.'
  },
  {
    id: 'ch3-q2',
    question: 'How many total bytes of memory are allocated by the data definition "arr DWORD 10 DUP(0)"?',
    options: ['40 bytes', '10 bytes', '20 bytes', '4 bytes'],
    correctIndex: 0,
    explanation: 'A DWORD is 4 bytes. 10 DUP(0) allocates 10 consecutive DWORD elements: 10 × 4 bytes = 40 bytes total.'
  },
  {
    id: 'ch3-q3',
    question: 'Why must strings printed using Irvine32\'s WriteString procedure terminate with ", 0"?',
    options: [
      'WriteString relies on a null-terminator (byte value 0) to know where the string ends in memory',
      'The trailing 0 resets the EFLAGS Zero Flag before printing',
      'Windows console output requires a carriage return byte represented by 0',
      'Without 0, the assembler refuses to compile BYTE definitions containing quotation marks'
    ],
    correctIndex: 0,
    explanation: 'WriteString expects EDX to point to a null-terminated string (C-style string). It continues reading and printing characters sequentially until it encounters byte 00h.'
  },
  {
    id: 'ch3-q4',
    question: 'What is the fundamental difference between an Assembler Directive (.data, DWORD, PROC) and an Instruction (MOV, ADD, CALL)?',
    options: [
      'Directives guide the assembler during compilation and generate no runtime machine code directly, whereas Instructions translate to CPU machine code executed at runtime',
      'Directives execute in CPU Protected Mode while Instructions run in Real Mode',
      'Directives can only be used inside the .code segment',
      'There is no difference; directives and instructions are compiled identically into machine code'
    ],
    correctIndex: 0,
    explanation: 'Directives (like .data, DWORD, PROC, ENDP) are instructions for MASM itself during assembly time to structure memory and segments. Instructions (like MOV, ADD) are translated directly into binary opcodes executed by the CPU hardware.'
  }
];

function validateMasmToken(raw: string) {
  const token = raw.trim();
  if (!token) {
    return {
      category: 'Empty Input',
      valid: false,
      reason: 'Please enter a token or click one of the presets above.'
    };
  }

  // Check 1: Missing leading zero hex literal trap (starts with A-F, ends with h/H)
  if (/^[a-fA-F][0-9a-fA-F]*[hH]$/.test(token)) {
    return {
      category: 'Invalid Hex Literal (Classic Exam Trap!)',
      valid: false,
      reason: `In MASM, hexadecimal literals starting with a letter (A–F) MUST begin with a leading zero (e.g. 0${token} instead of ${token}). Without the leading 0, MASM assumes "${token}" is a variable or label identifier and produces an "undefined symbol" assembly error!`
    };
  }

  // Check 2: Valid numeric literal
  if (/^[0-9][0-9a-fA-F]*[hH]$/.test(token)) {
    return {
      category: 'Valid Hexadecimal Literal',
      valid: true,
      reason: `"${token}" is a valid MASM hex constant. The leading digit (0–9) ensures the assembler correctly parses it as a numeric value rather than a symbol name.`
    };
  }
  if (/^[01]+[bB]$/.test(token)) {
    return {
      category: 'Valid Binary Literal',
      valid: true,
      reason: `"${token}" is a valid binary constant. Contains only binary bits (0 or 1) followed by the "b" radix suffix.`
    };
  }
  if (/^[+-]?[0-9]+[dD]?$/.test(token)) {
    return {
      category: 'Valid Decimal Literal',
      valid: true,
      reason: `"${token}" is a valid decimal integer constant. MASM defaults to decimal representation unless configured otherwise.`
    };
  }

  // Check 3: Reserved word check
  const lower = token.toLowerCase();
  const isInstruction = (INSTRUCTIONS as readonly string[]).includes(lower);
  const isRegister = (ALL_REGISTERS as readonly string[]).includes(lower);
  const isDirective = (DIRECTIVES as readonly string[]).includes(lower) || (DIRECTIVES as readonly string[]).includes('.' + lower);

  if (isInstruction || isRegister || isDirective) {
    const kind = isInstruction ? 'an instruction mnemonic' : isRegister ? 'a CPU register name' : 'an assembler directive';
    return {
      category: 'Invalid Identifier (Reserved Keyword)',
      valid: false,
      reason: `"${token}" is a reserved MASM keyword (${kind}). It cannot be used as a variable name, procedure name, or label.`
    };
  }

  // Check 4: Identifier naming rules
  if (/^[0-9]/.test(token)) {
    return {
      category: 'Invalid Identifier Name',
      valid: false,
      reason: `"${token}" is invalid because MASM identifiers cannot start with a numeric digit (0–9). They must start with an alphabetic character, underscore (_), @, ?, or $.`
    };
  }

  if (/^[a-zA-Z_@?$][a-zA-Z0-9_@?$]{0,246}$/.test(token)) {
    return {
      category: 'Valid MASM Identifier',
      valid: true,
      reason: `"${token}" satisfies all MASM identifier rules: starts with a valid character, uses only letters, digits, and allowed symbols (_ @ ? $), and does not exceed the 247-character limit.`
    };
  }

  return {
    category: 'Invalid Identifier / Token',
    valid: false,
    reason: `"${token}" contains characters not permitted in MASM identifiers (spaces, punctuation like dashes/dots/brackets, or exceeds 247 characters).`
  };
}

export const Ch3Page: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('data');
  const [testToken, setTestToken] = useState<string>('FFh');

  const validationResult = validateMasmToken(testToken);

  const sectionsInfo: Record<string, { title: string; desc: string; tip: string }> = {
    include: {
      title: 'INCLUDE Irvine32.inc Directive',
      desc: 'Includes prototypes for Irvine32 library procedures and sets standard flat-memory model and 32-bit calling conventions.',
      tip: 'Always placed at the very top of your assembly file.',
    },
    data: {
      title: '.data Segment Directive',
      desc: 'Defines the initialized data segment where global variables, arrays, and string constants are allocated memory.',
      tip: 'Variables defined here exist throughout the lifetime of the program.',
    },
    code: {
      title: '.code Segment Directive',
      desc: 'Marks the start of executable machine instructions and procedures.',
      tip: 'Must contain at least one procedure (typically main PROC) that serves as the entry point.',
    },
    proc: {
      title: 'Procedure Boundaries (main PROC / ENDP)',
      desc: 'Declares procedure blocks. Every PROC must be matched with a corresponding ENDP.',
      tip: 'The main procedure starts execution when the OS loads the program.',
    },
    exit: {
      title: 'exit / INVOKE ExitProcess, 0',
      desc: 'Terminates program execution and returns the exit status code (0 = success) to Windows OS.',
      tip: 'Without this, the CPU will keep executing memory past the procedure into undefined bytes!',
    },
  };

  const sampleCode = `INCLUDE Irvine32.inc

.data
    val1 BYTE 10h
    val2 WORD 1000h
    val3 DWORD 100000h
    arr  DWORD 5 DUP(0)
    str1 BYTE "COE224 Assembly", 0

.code
main PROC
    mov eax, val3
    call WriteHex
    call Crlf
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
            <span>Chapter 3: MASM Program Anatomy & Data Definitions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            COE224 • Directives, Segments (.data, .code), and Data Allocation (BYTE, WORD, DWORD)
          </p>
        </div>
        <OpenInPlayground code={sampleCode} />
      </div>

      {/* Widget 1: Code Dissector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm border-b border-slate-800 pb-2">
            <Code2 size={18} />
            <span>Interactive Program Anatomy Dissector (Click sections)</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs space-y-2 border border-slate-800 select-none">
            <div
              onClick={() => setSelectedSection('include')}
              className={`p-1.5 rounded cursor-pointer transition border ${
                selectedSection === 'include'
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'hover:bg-slate-900 border-transparent text-slate-400'
              }`}
            >
              INCLUDE Irvine32.inc
            </div>

            <div
              onClick={() => setSelectedSection('data')}
              className={`p-2 rounded cursor-pointer transition border space-y-1 ${
                selectedSection === 'data'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'hover:bg-slate-900 border-transparent text-slate-400'
              }`}
            >
              <span className="font-bold text-emerald-400">.data</span>
              <div className="pl-4 space-y-0.5 text-slate-300">
                <div>myVar DWORD 12345678h</div>
                <div>greeting BYTE "Welcome", 0</div>
              </div>
            </div>

            <div
              onClick={() => setSelectedSection('code')}
              className={`p-2 rounded cursor-pointer transition border space-y-1 ${
                selectedSection === 'code'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'hover:bg-slate-900 border-transparent text-slate-400'
              }`}
            >
              <span className="font-bold text-amber-400">.code</span>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSection('proc');
                }}
                className={`pl-4 p-1 rounded border my-1 ${
                  selectedSection === 'proc'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                    : 'border-transparent text-slate-300'
                }`}
              >
                <div>main PROC</div>
                <div className="pl-4 py-1 space-y-0.5">
                  <div>mov eax, myVar</div>
                  <div>call WriteInt</div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSection('exit');
                    }}
                    className={`inline-block px-1 rounded border ${
                      selectedSection === 'exit'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                        : 'border-transparent text-rose-400 font-semibold'
                    }`}
                  >
                    exit
                  </div>
                </div>
                <div>main ENDP</div>
              </div>
              <div className="text-slate-500">END main</div>
            </div>
          </div>
        </div>

        {/* Section Info Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm border-b border-slate-800 pb-2">
              <Database size={18} />
              <span>Section Details</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">
                {sectionsInfo[selectedSection]?.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {sectionsInfo[selectedSection]?.desc}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-amber-300">
              <strong>💡 Pedagogical Tip:</strong> {sectionsInfo[selectedSection]?.tip}
            </div>
          </div>
        </div>
      </div>

      {/* Widget 2: MASM Identifier & Literal Validator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <ShieldAlert size={18} />
            <span>MASM Identifier & Literal Validator (The Hex Leading-Zero Trap)</span>
          </div>
          <span className="text-xs text-slate-400">Test token validity under MASM rules</span>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400">Quick Test Cases:</span>
          {[
            { label: 'FFh (Exam Trap!)', val: 'FFh' },
            { label: '0FFh (Valid Hex)', val: '0FFh' },
            { label: 'myVar_1', val: 'myVar_1' },
            { label: '1stCount (Starts with digit)', val: '1stCount' },
            { label: 'mov (Reserved Keyword)', val: 'mov' },
            { label: '@loop_label', val: '@loop_label' },
          ].map((preset) => (
            <button
              key={preset.val}
              onClick={() => setTestToken(preset.val)}
              className={`px-2.5 py-1 text-xs font-mono rounded border transition ${
                testToken === preset.val
                  ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <label className="text-xs text-slate-400 font-mono whitespace-nowrap">
            Token / Identifier to Validate:
          </label>
          <input
            type="text"
            value={testToken}
            onChange={(e) => setTestToken(e.target.value)}
            placeholder="e.g. FFh, 0A5h, count1, eax..."
            className="flex-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Diagnostic Result Card */}
        <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
          validationResult.valid
            ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-200'
            : validationResult.category.includes('Trap')
            ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
            : 'bg-rose-950/20 border-rose-500/50 text-rose-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {validationResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="font-bold text-sm tracking-wide font-mono">
                {validationResult.category}
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
              validationResult.valid
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {validationResult.valid ? 'VALID MASM TOKEN' : 'SYNTAX ERROR'}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-200 font-sans">
            {validationResult.reason}
          </p>
        </div>
      </div>

      {/* Chapter 3 Quiz */}
      <ChapterQuiz chapter={3} questions={ch3Questions} />
    </div>
  );
};
