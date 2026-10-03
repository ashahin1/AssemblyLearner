// COE224: Assembly Language Studio - Interactive Modules Index (Chapters 1-7)

import React from 'react';
import { Link } from 'react-router-dom';
import { Binary, Cpu, Code2, Database, Layers, GitBranch, Repeat, ArrowRight, Play } from 'lucide-react';

export const ModulesIndex: React.FC = () => {
  const modules = [
    {
      ch: 1,
      title: 'Number Systems & Data Representation',
      desc: 'Interactive 8-bit bitboard, Two\'s complement negation animator, signed vs unsigned ranges, and base conversions.',
      icon: Binary,
      color: 'from-blue-500/20 to-sky-500/10 text-sky-400 border-sky-500/30',
    },
    {
      ch: 2,
      title: 'IA-32 Architecture & Register Explorer',
      desc: 'Visual nested hierarchy of EAX down to AX, AH, and AL. Taxonomy of general, index, and pointer registers.',
      icon: Cpu,
      color: 'from-teal-500/20 to-emerald-500/10 text-teal-400 border-teal-500/30',
    },
    {
      ch: 3,
      title: 'MASM Program Anatomy & Directives',
      desc: 'Interactive code dissector for .data, .code, PROC/ENDP, and memory definitions (BYTE, WORD, DWORD, DUP).',
      icon: Code2,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
    },
    {
      ch: 4,
      title: 'Data Transfers, Addressing & Little-Endian',
      desc: 'Little-endian byte-order storage animator, indirect memory addressing with [ESI], and MOV restriction checker.',
      icon: Database,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
    },
    {
      ch: 5,
      title: 'Procedures & Stack Architecture',
      desc: 'Dynamic downward-growing stack animator (PUSH / POP), ESP & EBP pointer tracking, and CALL / RET frame builder.',
      icon: Layers,
      color: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30',
    },
    {
      ch: 6,
      title: 'Conditional Processing & Status Flags',
      desc: 'Interactive CMP internal subtraction visualizer, live status flags evaluation, and signed vs unsigned jump decision matrix.',
      icon: GitBranch,
      color: 'from-emerald-500/20 to-green-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      ch: 7,
      title: 'Bit Shifts, Rotations & Integer Arithmetic',
      desc: 'Animated shift & rotate barrel (SHL, SHR, ROL, ROR) with Carry Flag bucket, and 32-bit MUL / DIV register pairs.',
      icon: Repeat,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <span>COE224 • Buraydah Private Colleges</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Curriculum Interactive Learning Modules
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Synchronized directly with Chapters 1 through 7 of Kip R. Irvine’s <em>Assembly Language for x86 Processors</em>. Explore concepts with dedicated interactive sandboxes or jump straight into the full IDE.
          </p>
        </div>

        <Link
          to="/playground"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-600/20 transition shrink-0"
        >
          <Play size={16} fill="currentColor" />
          <span>Open Full IDE</span>
        </Link>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(({ ch, title, desc, icon: Icon, color }) => (
          <Link
            key={ch}
            to={`/chapters/${ch}`}
            className="group relative bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-lg border bg-gradient-to-br ${color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-slate-400">
                  CHAPT_0{ch}
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-100 group-hover:text-sky-300 transition line-clamp-1">
                  Chapter {ch}: {title}
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  {desc}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:text-sky-300">
              <span>Launch Interactive Lab</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
