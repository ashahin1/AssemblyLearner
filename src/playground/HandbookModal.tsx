// COE224: Assembly Language Studio - Student Handbook & IDE Guide Modal
// Buraydah Private Colleges • Department of Computer Engineering

import React, { useState } from 'react';
import { useUIStore } from '../store/uiStore';
import {
  X,
  BookOpen,
  Terminal,
  Cpu,
  Layers,
  Play,
  RotateCcw,
  StepForward,
  StepBack,
  Share2,
  Tv,
  CheckCircle,
  Sparkles,
  Info,
  Code2,
} from 'lucide-react';

type HandbookTab = 'quickstart' | 'tour' | 'masm' | 'debugging' | 'devices';

export const HandbookModal: React.FC = () => {
  const isHandbookOpen = useUIStore((s) => s.isHandbookOpen);
  const setIsHandbookOpen = useUIStore((s) => s.setIsHandbookOpen);
  const [activeTab, setActiveTab] = useState<HandbookTab>('quickstart');

  if (!isHandbookOpen) return null;

  const TABS: Array<{ id: HandbookTab; label: string; icon: React.ReactNode }> = [
    { id: 'quickstart', label: 'Quick Start', icon: <Sparkles size={15} /> },
    { id: 'tour', label: 'IDE & Panels Tour', icon: <Cpu size={15} /> },
    { id: 'masm', label: 'MASM & Irvine32', icon: <BookOpen size={15} /> },
    { id: 'debugging', label: 'Debugging Guide', icon: <Terminal size={15} /> },
    { id: 'devices', label: 'TV & Mobile Tips', icon: <Tv size={15} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-600/30 shrink-0">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 truncate">
                <span>COE224 Student Handbook &amp; IDE Guide</span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-semibold">
                  v2.0
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Buraydah Private Colleges • Department of Computer Engineering • Kip Irvine x86
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHandbookOpen(false)}
            title="Close Handbook (Esc)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-3 sm:px-6 py-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto shrink-0 scrollbar-none text-xs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Handbook Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {/* TAB 1: QUICK START */}
          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-4 sm:p-5 text-sky-100">
                <h3 className="text-base font-bold text-sky-400 mb-2 flex items-center gap-2">
                  <Sparkles size={18} />
                  <span>Welcome to COE224 Assembly Language Studio!</span>
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  This interactive simulator is specifically synchronized with Chapters 1 through 7 of Kip R. Irvine’s
                  textbook <em>"Assembly Language for x86 Processors"</em>. You can write MASM assembly, execute instructions
                  step-by-step, inspect 32-bit registers, status flags, runtime stack frames, memory, and Irvine32 I/O in real time.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-extrabold flex items-center justify-center text-xs">1</span>
                  <span>How to Run Your First Program (In 4 Easy Steps)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3">
                    <div className="font-semibold text-slate-100 mb-1 flex items-center gap-1.5">
                      <Code2 size={14} className="text-sky-400" />
                      <span>Step 1: Write or Select Code</span>
                    </div>
                    <p className="text-slate-400">
                      Type your MASM code in the editor, or click <strong>Lecture Examples</strong> in the toolbar to pick from pre-loaded textbook examples.
                    </p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3">
                    <div className="font-semibold text-slate-100 mb-1 flex items-center gap-1.5">
                      <StepForward size={14} className="text-amber-400" />
                      <span>Step 2: Step-by-Step Execution</span>
                    </div>
                    <p className="text-slate-400">
                      Click <strong>Step</strong> to execute one instruction at a time. The yellow arrow (▶) shows exactly which instruction will run next.
                    </p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3">
                    <div className="font-semibold text-slate-100 mb-1 flex items-center gap-1.5">
                      <Cpu size={14} className="text-emerald-400" />
                      <span>Step 3: Watch Dynamic Changes</span>
                    </div>
                    <p className="text-slate-400">
                      Watch modified registers glow yellow, check how status flags (ZF, CF, SF, OF) update, and inspect the runtime stack in real time.
                    </p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3">
                    <div className="font-semibold text-slate-100 mb-1 flex items-center gap-1.5">
                      <Play size={14} className="text-teal-400" />
                      <span>Step 4: Continuous Running &amp; Undo</span>
                    </div>
                    <p className="text-slate-400">
                      Click <strong>Run</strong> to run continuously at custom speed. Click <strong>Back</strong> at any time to undo steps and reverse execution!
                    </p>
                  </div>
                </div>
              </div>

              {/* The 2-Step Restart Flow Feature */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <RotateCcw size={16} />
                  <span>The 2-Step Restart Flow (Pedagogical Safety)</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When a program reaches <code className="text-sky-300">exit</code> or when you modify code:
                </p>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-amber-400 shrink-0">Press 1 (Restart):</span>
                    <span>Wipes CPU memory and parks the yellow pointer (▶) on <strong>Line 1</strong> with all registers at <code className="text-sky-300">0</code>. Line 1 is <em>not</em> executed yet, giving you full visibility into the initial state.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400 shrink-0">Press 2 (Step):</span>
                    <span>Executes Line 1, updates registers, and advances the pointer to Line 2!</span>
                  </div>
                </div>
              </div>

              {/* Standard Starter Code Template */}
              <div>
                <h4 className="text-sm font-bold text-white mb-2">Standard MASM Program Structure</h4>
                <pre className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
{`INCLUDE Irvine32.inc

.data
    val1 DWORD 25
    val2 DWORD 15

.code
main PROC
    mov  eax, val1      ; EAX = 25
    add  eax, val2      ; EAX = 25 + 15 = 40
    call DumpRegs       ; Display registers & flags in console
    exit                ; Terminate execution cleanly
main ENDP
END main`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: IDE & PANELS TOUR */}
          {activeTab === 'tour' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white mb-1">Complete Tour of the Studio Panels</h3>
                <p className="text-slate-400 text-xs">
                  Assembly Studio divides the screen into specialized architectural inspection panels modeled after real x86 hardware.
                </p>
              </div>

              {/* Top Toolbar */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                  <span>1. Top Execution Toolbar</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60">
                    <span className="font-semibold text-emerald-400">Run / Pause:</span> Continuously executes instructions with animated delay. Click Pause at any time to freeze execution.
                  </div>
                  <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60">
                    <span className="font-semibold text-sky-400">Step / Restart:</span> Advances one single instruction. Automatically transforms into "Restart" when the program finishes or code is modified.
                  </div>
                  <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60">
                    <span className="font-semibold text-amber-400">Step Backward (Undo):</span> Reversible time-travel debugging! Pops the last state snapshot and restores previous registers &amp; memory.
                  </div>
                  <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60">
                    <span className="font-semibold text-rose-400">Reset:</span> Resets the CPU and memory back to clean slate, parking at Line 1.
                  </div>
                  <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60">
                    <span className="font-semibold text-teal-400">Lecture Examples:</span> Opens pre-loaded, tested assembly programs from Irvine Chapters 1 through 7.
                  </div>
                  <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60">
                    <span className="font-semibold text-amber-300">Share Link:</span> Encodes your entire assembly program into a direct shareable URL link for assignments or questions.
                  </div>
                </div>
              </div>

              {/* Code Editor */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                  <span>2. Code Editor (MASM IA-32)</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 ml-2">
                  <li><strong>Instruction Hover Tooltips:</strong> Hover your mouse over any mnemonic (<code className="text-sky-300">mov</code>, <code className="text-sky-300">add</code>, <code className="text-sky-300">loop</code>, <code className="text-sky-300">call</code>) to see its syntax, textbook chapter, description, and affected flags!</li>
                  <li><strong>Execution Gutter Arrow (▶):</strong> The yellow pointer marks the instruction currently pending execution.</li>
                  <li><strong>Clickable Breakpoints:</strong> Click any line number in the gutter to set or clear a breakpoint. Running will automatically pause at that line.</li>
                  <li><strong>Quick Font Size Controls (A- / A+):</strong> Quickly adjust font size up to 32px for classroom presentation.</li>
                </ul>
              </div>

              {/* CPU Registers Panel */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span>3. CPU Registers Panel</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Inspects all ten 32-bit IA-32 registers: <code className="text-sky-300">EAX</code>, <code className="text-sky-300">EBX</code>, <code className="text-sky-300">ECX</code>, <code className="text-sky-300">EDX</code>, <code className="text-sky-300">ESI</code>, <code className="text-sky-300">EDI</code>, <code className="text-sky-300">ESP</code>, <code className="text-sky-300">EBP</code>, <code className="text-sky-300">EIP</code>, and <code className="text-sky-300">EFLAGS</code>.
                </p>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-xs space-y-1.5">
                  <div><strong>Sub-register Breakdown:</strong> Click the arrow next to EAX, EBX, ECX, or EDX to inspect their 16-bit (<code className="text-teal-300">AX</code>) and 8-bit (<code className="text-teal-300">AH</code>, <code className="text-teal-300">AL</code>) partitions.</div>
                  <div><strong>Format Toggle:</strong> Toggle between <strong>Hex</strong> (default), <strong>Signed decimal</strong> (+/-), <strong>Unsigned decimal</strong>, and <strong>Binary</strong> (32-bit).</div>
                  <div><strong>Change Glow:</strong> Whenever an instruction alters a register, its row lights up with an animated yellow border.</div>
                </div>
              </div>

              {/* Status Flags Panel */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  <span>4. Status Flags Panel &amp; Real-Time Diagnostics</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-slate-800/60 rounded border border-slate-700/60">
                    <span className="font-bold text-rose-400">ZF (Zero):</span> Set to 1 when the result of an arithmetic or logical operation is zero.
                  </div>
                  <div className="p-2 bg-slate-800/60 rounded border border-slate-700/60">
                    <span className="font-bold text-amber-400">CF (Carry):</span> Set to 1 when an unsigned operation overflows the register width (carry/borrow).
                  </div>
                  <div className="p-2 bg-slate-800/60 rounded border border-slate-700/60">
                    <span className="font-bold text-sky-400">SF (Sign):</span> Set to 1 when the most significant bit (MSB) is 1, indicating a negative signed result.
                  </div>
                  <div className="p-2 bg-slate-800/60 rounded border border-slate-700/60">
                    <span className="font-bold text-purple-400">OF (Overflow):</span> Set to 1 when signed arithmetic overflows into the sign bit.
                  </div>
                  <div className="p-2 bg-slate-800/60 rounded border border-slate-700/60">
                    <span className="font-bold text-teal-400">PF (Parity):</span> Set to 1 if the lowest byte of the result contains an even number of 1-bits.
                  </div>
                  <div className="p-2 bg-slate-800/60 rounded border border-slate-700/60">
                    <span className="font-bold text-emerald-400">AF (Auxiliary):</span> Set when there is a carry out of bit 3 into bit 4 (BCD arithmetic).
                  </div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs text-sky-300">
                  💡 <strong>Flag Diagnostics Box:</strong> Beneath the flags, plain-English explanations appear after instructions (e.g., <em>"SUB resulted in 0: ZF set to 1; no borrow: CF cleared to 0"</em>).
                </div>
              </div>

              {/* Memory & Stack Panels */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                  <span>5. Memory Dump &amp; Runtime Stack Panels</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                    <h5 className="font-semibold text-slate-100 mb-1">Memory Dump (Little-Endian)</h5>
                    <p className="text-slate-400 mb-1.5">
                      Displays bytes allocated in the <code className="text-sky-300">.data</code> segment. Notice how x86 stores multi-byte values in Little-Endian order (least significant byte first)!
                    </p>
                    <div className="font-mono text-[11px] text-amber-300 bg-slate-950 p-1 rounded">
                      DWORD 12345678h ➔ stored as 78 56 34 12
                    </div>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                    <h5 className="font-semibold text-slate-100 mb-1">Runtime Stack (ESP / EBP)</h5>
                    <p className="text-slate-400 mb-1.5">
                      Visually renders the 32-bit stack. As instructions execute <code className="text-sky-300">PUSH</code>, <code className="text-sky-300">POP</code>, <code className="text-sky-300">CALL</code>, and <code className="text-sky-300">RET</code>, you will see ESP decrement and increment in 4-byte steps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Console Output */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span>6. Interactive Terminal Console</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Simulates standard terminal I/O for Irvine32 procedures. When instructions like <code className="text-sky-300">ReadInt</code> or <code className="text-sky-300">ReadString</code> are called, an interactive keyboard prompt appears, allowing you to enter input directly!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: MASM & IRVINE32 REFERENCE */}
          {activeTab === 'masm' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white mb-1">MASM &amp; Irvine32 Reference Cheatsheet</h3>
                <p className="text-slate-400 text-xs">
                  Summary of data types, instructions, and Irvine32 library procedures supported in COE224.
                </p>
              </div>

              {/* Data Types */}
              <div>
                <h4 className="text-sm font-bold text-sky-400 mb-2">1. Data Allocation Directives</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-800 rounded">
                    <thead className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-2">Directive</th>
                        <th className="p-2">Size</th>
                        <th className="p-2">Example</th>
                        <th className="p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                      <tr>
                        <td className="p-2 text-amber-300 font-bold">BYTE</td>
                        <td className="p-2 text-slate-400">8 bits (1 byte)</td>
                        <td className="p-2 text-sky-300">age BYTE 21</td>
                        <td className="p-2 font-sans text-slate-300">Single character or small integer</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-amber-300 font-bold">WORD</td>
                        <td className="p-2 text-slate-400">16 bits (2 bytes)</td>
                        <td className="p-2 text-sky-300">count WORD 1000</td>
                        <td className="p-2 font-sans text-slate-300">16-bit integer (AX register size)</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-amber-300 font-bold">DWORD</td>
                        <td className="p-2 text-slate-400">32 bits (4 bytes)</td>
                        <td className="p-2 text-sky-300">total DWORD 50000</td>
                        <td className="p-2 font-sans text-slate-300">Standard 32-bit integer (EAX register size)</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-teal-300 font-bold">DUP</td>
                        <td className="p-2 text-slate-400">Array repeat</td>
                        <td className="p-2 text-sky-300">arr DWORD 5 DUP(0)</td>
                        <td className="p-2 font-sans text-slate-300">Allocates array of 5 elements initialized to 0</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-teal-300 font-bold">OFFSET</td>
                        <td className="p-2 text-slate-400">Address operator</td>
                        <td className="p-2 text-sky-300">mov edx, OFFSET str</td>
                        <td className="p-2 font-sans text-slate-300">Returns memory address of variable</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Supported Instructions */}
              <div>
                <h4 className="text-sm font-bold text-amber-400 mb-2">2. Supported Assembly Instructions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60 space-y-1">
                    <span className="font-bold text-sky-300">Data Transfer:</span>
                    <p className="font-mono text-[11px] text-slate-300">MOV, XCHG, PUSH, POP, LEA</p>
                    <p className="text-slate-400 text-[11px]">Copies values between registers and memory. Cannot move memory to memory directly.</p>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60 space-y-1">
                    <span className="font-bold text-emerald-300">Arithmetic:</span>
                    <p className="font-mono text-[11px] text-slate-300">ADD, SUB, INC, DEC, NEG, MUL, IMUL, DIV, IDIV</p>
                    <p className="text-slate-400 text-[11px]">Computes calculations and updates CF, OF, ZF, SF flags.</p>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60 space-y-1">
                    <span className="font-bold text-purple-300">Logic &amp; Bitwise:</span>
                    <p className="font-mono text-[11px] text-slate-300">AND, OR, XOR, NOT, TEST</p>
                    <p className="text-slate-400 text-[11px]">Performs bitwise logic. XOR eax, eax quickly zeroes EAX.</p>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60 space-y-1">
                    <span className="font-bold text-teal-300">Shifts &amp; Rotates:</span>
                    <p className="font-mono text-[11px] text-slate-300">SHL, SHR, SAL, SAR, ROL, ROR</p>
                    <p className="text-slate-400 text-[11px]">Bit-shifting for fast power-of-2 multiplication/division.</p>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60 space-y-1">
                    <span className="font-bold text-rose-300">Comparison &amp; Jumps:</span>
                    <p className="font-mono text-[11px] text-slate-300">CMP, JMP, JE, JNE, JG, JL, JGE, JLE, JA, JB</p>
                    <p className="text-slate-400 text-[11px]">CMP subtracts operands and sets flags without modifying the destination register.</p>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60 space-y-1">
                    <span className="font-bold text-amber-300">Loops &amp; Procedures:</span>
                    <p className="font-mono text-[11px] text-slate-300">LOOP, LOOPE, LOOPNE, CALL, RET</p>
                    <p className="text-slate-400 text-[11px]">LOOP automatically decrements ECX and jumps if ECX != 0.</p>
                  </div>
                </div>
              </div>

              {/* Irvine32 Library Procedures */}
              <div>
                <h4 className="text-sm font-bold text-emerald-400 mb-2">3. Supported Irvine32 Library Procedures</h4>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
                  <div><strong className="text-sky-300">WriteString:</strong> Prints a null-terminated string. (Pass address in <code className="text-amber-300">EDX</code>).</div>
                  <div><strong className="text-sky-300">WriteInt / WriteDec:</strong> Prints integer value in <code className="text-amber-300">EAX</code> (signed or unsigned).</div>
                  <div><strong className="text-sky-300">WriteHex / WriteBin:</strong> Prints value in <code className="text-amber-300">EAX</code> formatted in hexadecimal or binary.</div>
                  <div><strong className="text-sky-300">WriteChar:</strong> Prints the single ASCII character in <code className="text-amber-300">AL</code>.</div>
                  <div><strong className="text-sky-300">Crlf:</strong> Prints a carriage return / line feed (new line).</div>
                  <div><strong className="text-sky-300">ReadInt:</strong> Prompts user for an integer, returns the number in <code className="text-amber-300">EAX</code>.</div>
                  <div><strong className="text-sky-300">ReadString:</strong> Prompts user for a string. (Address in <code className="text-amber-300">EDX</code>, max length in <code className="text-amber-300">ECX</code>).</div>
                  <div><strong className="text-sky-300">DumpRegs:</strong> Prints a complete diagnostic snapshot of all registers and flags to the console.</div>
                  <div><strong className="text-sky-300">DumpMem:</strong> Dumps memory bytes starting at address in <code className="text-amber-300">ESI</code>, count in <code className="text-amber-300">ECX</code>, unit in <code className="text-amber-300">EBX</code>.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEBUGGING GUIDE */}
          {activeTab === 'debugging' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white mb-1">Debugging Masterclass &amp; Best Practices</h3>
                <p className="text-slate-400 text-xs">
                  How to systematically inspect, troubleshoot, and trace assembly code like an engineer.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
                  <h4 className="font-bold text-sky-400 text-xs sm:text-sm flex items-center gap-1.5">
                    <CheckCircle size={15} />
                    <span>Technique 1: Stepping &amp; Flag Observation</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Always use <strong>Step</strong> when tracing conditional logic (<code className="text-sky-300">CMP</code> followed by <code className="text-sky-300">JNZ</code> or <code className="text-sky-300">JG</code>). Watch the Flags panel after the CMP instruction to predict whether the jump will be taken!
                  </p>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
                  <h4 className="font-bold text-amber-400 text-xs sm:text-sm flex items-center gap-1.5">
                    <StepBack size={15} />
                    <span>Technique 2: Time-Travel Debugging (Undo)</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Over-stepped past a bug? Click <strong>Step Backward (Back)</strong>! The simulator restores the exact register and memory values of the previous instruction, letting you step back and forward as many times as you need.
                  </p>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
                  <h4 className="font-bold text-teal-400 text-xs sm:text-sm flex items-center gap-1.5">
                    <RotateCcw size={15} />
                    <span>Technique 3: Stale Code Awareness</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    If you spot an error in your code while paused mid-debugging, you can edit it immediately! The simulator keeps your registers and output <strong>frozen on screen</strong> so you can reference them while writing the fix. When you click <strong>Restart</strong>, it automatically compiles the fix and starts at Line 1.
                  </p>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
                  <h4 className="font-bold text-rose-400 text-xs sm:text-sm flex items-center gap-1.5">
                    <Info size={15} />
                    <span>Technique 4: Understanding Assembly Errors</span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    If you write an invalid instruction (e.g. moving memory to memory directly, or mismatched operand sizes like moving 32-bit EAX into 16-bit BX), the simulator highlights the exact line and displays a helpful 💡 tip explaining how to fix it.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DEVICES & PRESENTATION */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white mb-1">Classroom Presentation &amp; Device Compatibility</h3>
                <p className="text-slate-400 text-xs">
                  Optimized for smart TV projectors, lecture hall screens, laptops, tablets, and smartphones.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Tv size={15} />
                    <span>Classroom TV &amp; Projector Mode</span>
                  </h4>
                  <p className="text-slate-400">
                    Click <strong>TV Mode</strong> in the top header or use the zoom controls (+ / -) to enlarge the UI up to <strong>140% – 200%</strong>. This ensures students in the back rows of lecture halls can clearly read assembly code, register numbers, and flags.
                  </p>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-sky-300 flex items-center gap-1.5">
                    <Layers size={15} />
                    <span>Mobile &amp; Tablet Bottom Navigation</span>
                  </h4>
                  <p className="text-slate-400">
                    On screens smaller than 1024px (phones &amp; vertical tablets), the IDE seamlessly presents dedicated bottom tabs: <strong>Code</strong>, <strong>Registers</strong>, <strong>Memory</strong>, and <strong>Console</strong>. Panels maintain state across tab switches without resetting.
                  </p>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-teal-300 flex items-center gap-1.5">
                    <Share2 size={15} />
                    <span>Instant Cloud Sharing via URL</span>
                  </h4>
                  <p className="text-slate-400">
                    Click <strong>Share</strong> in the toolbar. It compresses your entire assembly source into a URL link. You can paste this link into WhatsApp, Blackboard discussions, or email—opening it loads your exact code instantly!
                  </p>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-rose-300 flex items-center gap-1.5">
                    <RotateCcw size={15} />
                    <span>Restore Clean Slate (Factory Reset)</span>
                  </h4>
                  <p className="text-slate-400">
                    Need a completely fresh start? Open <strong>Settings</strong> (gear icon) and click <strong>Restore Clean Slate</strong> in the danger zone. It wipes saved browser cache and restores factory defaults.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950 shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Buraydah Private Colleges • COE224 Architecture</span>
          </div>
          <button
            onClick={() => setIsHandbookOpen(false)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition"
          >
            Got it, Let's Code!
          </button>
        </div>
      </div>
    </div>
  );
};
