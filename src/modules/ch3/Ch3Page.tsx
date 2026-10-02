// COE224: Module 3 - MASM Program Anatomy & Directives (Chapter 3)

import React, { useState } from 'react';
import { OpenInPlayground } from '../shared/OpenInPlayground';
import { ArrowLeft, Code2, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Ch3Page: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('data');

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
    </div>
  );
};
