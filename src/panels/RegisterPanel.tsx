// COE224: Assembly Language Studio - Register Inspection Panel

import React from 'react';
import { useCPUStore } from '../store/cpuStore';
import { useUIStore, RegisterDisplayFormat } from '../store/uiStore';
import { ChevronDown, ChevronRight } from 'lucide-react';

export const RegisterPanel: React.FC = () => {
  const cpuState = useCPUStore((s) => s.cpuState);
  const changedRegisters = useCPUStore((s) => s.changedRegisters);
  const registerFormat = useUIStore((s) => s.registerFormat);
  const setRegisterFormat = useUIStore((s) => s.setRegisterFormat);
  const expandedRegisters = useUIStore((s) => s.expandedRegisters);
  const toggleRegisterExpansion = useUIStore((s) => s.toggleRegisterExpansion);

  const regs = cpuState.registers;

  const formatValue = (val: number, bits: 8 | 16 | 32, format: RegisterDisplayFormat): string => {
    const unsigned = (val >>> 0) & (bits === 8 ? 0xff : bits === 16 ? 0xffff : 0xffffffff);
    if (format === 'hex') {
      const pad = bits === 8 ? 2 : bits === 16 ? 4 : 8;
      return unsigned.toString(16).toUpperCase().padStart(pad, '0') + 'h';
    }
    if (format === 'unsigned') {
      return unsigned.toString(10);
    }
    if (format === 'signed') {
      let signed = unsigned;
      if (bits === 8 && unsigned > 0x7f) signed -= 0x100;
      else if (bits === 16 && unsigned > 0x7fff) signed -= 0x10000;
      else if (bits === 32 && unsigned > 0x7fffffff) signed -= 0x100000000;
      return signed.toString(10);
    }
    if (format === 'binary') {
      return unsigned.toString(2).padStart(bits, '0');
    }
    return '';
  };

  const generalRegs = [
    { name: 'eax', sub16: 'ax', subHigh: 'ah', subLow: 'al', label: 'Accumulator' },
    { name: 'ebx', sub16: 'bx', subHigh: 'bh', subLow: 'bl', label: 'Base' },
    { name: 'ecx', sub16: 'cx', subHigh: 'ch', subLow: 'cl', label: 'Counter' },
    { name: 'edx', sub16: 'dx', subHigh: 'dh', subLow: 'dl', label: 'Data / I/O' },
  ];

  const pointerRegs = [
    { name: 'esi', label: 'Source Index' },
    { name: 'edi', label: 'Destination Index' },
    { name: 'ebp', label: 'Base Pointer (Stack Frame)' },
    { name: 'esp', label: 'Stack Pointer (TOS)' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-lg flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <span className="font-semibold text-slate-200 tracking-wider uppercase">CPU Registers</span>
        <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
          {(['hex', 'unsigned', 'signed', 'binary'] as RegisterDisplayFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setRegisterFormat(fmt)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition ${
                registerFormat === fmt ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {fmt === 'hex' ? 'HEX' : fmt === 'unsigned' ? 'U-DEC' : fmt === 'signed' ? 'S-DEC' : 'BIN'}
            </button>
          ))}
        </div>
      </div>

      {/* Registers List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
        {/* General Purpose 32/16/8-bit */}
        <div className="space-y-1.5">
          {generalRegs.map(({ name, sub16, subHigh, subLow, label }) => {
            const isChanged = changedRegisters.has(name);
            const isExpanded = expandedRegisters.has(name);
            const val32 = regs[name as keyof typeof regs];
            const val16 = val32 & 0xffff;
            const valH = (val32 >> 8) & 0xff;
            const valL = val32 & 0xff;

            return (
              <div
                key={name}
                className={`rounded border transition ${
                  isChanged
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div
                  className="flex items-center justify-between p-1.5 cursor-pointer hover:bg-slate-800/40"
                  onClick={() => toggleRegisterExpansion(name)}
                >
                  <div className="flex items-center gap-1.5">
                    {isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
                    <span className="font-bold text-sky-400 uppercase">{name}</span>
                    <span className="text-[10px] text-slate-500 hidden sm:inline">({label})</span>
                  </div>
                  <span className={`font-semibold tracking-wider ${isChanged ? 'text-amber-400 font-bold' : 'text-slate-100'}`}>
                    {formatValue(val32, 32, registerFormat)}
                  </span>
                </div>

                {/* Sub-registers breakdown when expanded */}
                {isExpanded && (
                  <div className="px-3 pb-2 pt-1 border-t border-slate-800/60 bg-slate-900/50 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-teal-400 font-medium">{sub16.toUpperCase()} (16-bit)</span>
                      <span>{formatValue(val16, 16, registerFormat)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-0.5 border-t border-slate-800/40 text-[10px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-purple-400">{subHigh.toUpperCase()} (High 8)</span>
                        <span>{formatValue(valH, 8, registerFormat)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-emerald-400">{subLow.toUpperCase()} (Low 8)</span>
                        <span>{formatValue(valL, 8, registerFormat)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Index and Pointer Registers */}
        <div className="pt-2 border-t border-slate-800 grid grid-cols-1 gap-1.5">
          {pointerRegs.map(({ name, label }) => {
            const isChanged = changedRegisters.has(name);
            const val = regs[name as keyof typeof regs];

            return (
              <div
                key={name}
                className={`flex items-center justify-between px-2 py-1.5 rounded border transition ${
                  isChanged
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sky-400 uppercase">{name}</span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">({label})</span>
                </div>
                <span className={`font-semibold tracking-wider ${isChanged ? 'text-amber-400 font-bold' : 'text-slate-100'}`}>
                  {formatValue(val, 32, registerFormat)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
