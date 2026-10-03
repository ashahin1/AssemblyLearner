// COE224: Assembly Language Studio - Memory Grid & Little-Endian Viewer

import React, { useState } from 'react';
import { useCPUStore } from '../store/cpuStore';

export type MemoryFormat = 'hex' | 'unsigned' | 'signed' | 'binary';
export type MemoryUnitSize = 1 | 2 | 4;

export const MemoryPanel: React.FC = () => {
  const memory = useCPUStore((s) => s.memory);

  const [format, setFormat] = useState<MemoryFormat>('hex');
  const [unitSize, setUnitSize] = useState<MemoryUnitSize>(1);

  const allocated = memory.getAllAllocated();

  // Group allocated bytes by unitSize (1, 2, or 4)
  const items: Array<{ address: number; value: number; ascii: string }> = [];

  if (allocated.length > 0) {
    const minAddr = allocated[0].address;
    const maxAddr = allocated[allocated.length - 1].address;
    const alignedStart = minAddr - (minAddr % unitSize);

    for (let addr = alignedStart; addr <= maxAddr; addr += unitSize) {
      let val = 0;
      let ascii = '';

      if (unitSize === 1) {
        val = memory.readByte(addr);
        ascii = val >= 32 && val <= 126 ? String.fromCharCode(val) : '.';
      } else if (unitSize === 2) {
        val = memory.readWord(addr);
        const b0 = memory.readByte(addr);
        const b1 = memory.readByte(addr + 1);
        ascii = (b0 >= 32 && b0 <= 126 ? String.fromCharCode(b0) : '.') +
                (b1 >= 32 && b1 <= 126 ? String.fromCharCode(b1) : '.');
      } else {
        val = memory.readDword(addr);
        for (let j = 0; j < 4; j++) {
          const b = memory.readByte(addr + j);
          ascii += b >= 32 && b <= 126 ? String.fromCharCode(b) : '.';
        }
      }

      items.push({ address: addr, value: val, ascii });
    }
  }

  const formatValue = (val: number, size: MemoryUnitSize, fmt: MemoryFormat): string => {
    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
    const unsigned = (val & mask) >>> 0;

    if (fmt === 'hex') {
      const pad = size === 1 ? 2 : size === 2 ? 4 : 8;
      return unsigned.toString(16).toUpperCase().padStart(pad, '0') + 'h';
    }
    if (fmt === 'unsigned') {
      return unsigned.toString(10);
    }
    if (fmt === 'signed') {
      let signed = unsigned;
      if (size === 1 && unsigned > 0x7f) signed -= 0x100;
      else if (size === 2 && unsigned > 0x7fff) signed -= 0x10000;
      else if (size === 4 && unsigned > 0x7fffffff) signed -= 0x100000000;
      return signed.toString(10);
    }
    if (fmt === 'binary') {
      const bits = size * 8;
      const bin = unsigned.toString(2).padStart(bits, '0');
      if (size === 4) return bin.match(/.{1,8}/g)?.join(' ') ?? bin;
      if (size === 2) return bin.match(/.{1,4}/g)?.join(' ') ?? bin;
      return bin + 'b';
    }
    return '';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-lg flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-1 pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-200 tracking-wider uppercase">Memory (.data)</span>
        </div>

        {/* View Options: Unit Size & Format */}
        <div className="flex items-center gap-1.5">
          {/* Unit Size */}
          <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
            {([1, 2, 4] as MemoryUnitSize[]).map((sz) => (
              <button
                key={sz}
                onClick={() => setUnitSize(sz)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition ${
                  unitSize === sz ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={sz === 1 ? 'Byte (8-bit)' : sz === 2 ? 'Word (16-bit)' : 'DWord (32-bit)'}
              >
                {sz === 1 ? '1B' : sz === 2 ? '2B' : '4B'}
              </button>
            ))}
          </div>

          {/* Value Format */}
          <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
            {(['hex', 'unsigned', 'signed', 'binary'] as MemoryFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition ${
                  format === fmt ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {fmt === 'hex' ? 'HEX' : fmt === 'unsigned' ? 'U-DEC' : fmt === 'signed' ? 'S-DEC' : 'BIN'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Table */}
      <div className="flex-1 overflow-y-auto font-mono text-xs pr-1">
        {items.length === 0 ? (
          <div className="text-slate-500 text-center py-6 italic text-xs">
            No variables allocated in .data segment.
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-1 px-2 py-1 bg-slate-950/90 rounded text-[10px] text-slate-500 uppercase font-semibold">
              <span className="col-span-5">Address</span>
              <span className="col-span-4 text-center">Value</span>
              <span className="col-span-3 text-right">ASCII</span>
            </div>
            {items.map(({ address, value, ascii }) => {
              const hexAddr = address.toString(16).toUpperCase().padStart(8, '0') + 'h';
              const formattedVal = formatValue(value, unitSize, format);

              return (
                <div
                  key={address}
                  className="grid grid-cols-12 gap-1 px-2 py-1 rounded bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800/40 text-[11px] items-center"
                >
                  <span className="col-span-5 text-sky-400 font-medium">{hexAddr}</span>
                  <span className="col-span-4 text-center font-bold text-amber-300 truncate">
                    {formattedVal}
                  </span>
                  <span className="col-span-3 text-right text-emerald-400 font-semibold tracking-wider">
                    {ascii}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
