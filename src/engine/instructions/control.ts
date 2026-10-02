// COE224: Assembly Language Studio - Control Flow & Jump Instructions (Ch 6)
// JMP, Jcc, CALL, RET

import { CPU } from '../cpu';
import { MemoryManager } from '../memory';
import { Operand, SymbolEntry } from '../types';
import { StackInstructions } from './stack';

export class ControlInstructions {
  static shouldJump(mnemonic: string, cpu: CPU): boolean {
    const f = cpu.getFlags();
    const m = mnemonic.toLowerCase();

    switch (m) {
      case 'jmp': return true;

      // Flag-based
      case 'jz':
      case 'je':
        return f.ZF === 1;
      case 'jnz':
      case 'jne':
        return f.ZF === 0;
      case 'jc':
        return f.CF === 1;
      case 'jnc':
        return f.CF === 0;
      case 'js':
        return f.SF === 1;
      case 'jns':
        return f.SF === 0;
      case 'jo':
        return f.OF === 1;
      case 'jno':
        return f.OF === 0;

      // Unsigned comparisons
      case 'ja':
      case 'jnbe':
        return f.CF === 0 && f.ZF === 0;
      case 'jae':
      case 'jnb':
        return f.CF === 0;
      case 'jb':
      case 'jnae':
        return f.CF === 1;
      case 'jbe':
      case 'jna':
        return f.CF === 1 || f.ZF === 1;

      // Signed comparisons
      case 'jg':
      case 'jnle':
        return f.ZF === 0 && f.SF === f.OF;
      case 'jge':
      case 'jnl':
        return f.SF === f.OF;
      case 'jl':
      case 'jnge':
        return f.SF !== f.OF;
      case 'jle':
      case 'jng':
        return f.ZF === 1 || f.SF !== f.OF;

      default:
        throw new Error(`Unknown jump instruction '${mnemonic}'`);
    }
  }

  static call(
    target: Operand,
    currentInstructionIndex: number,
    symbols: Map<string, SymbolEntry>,
    cpu: CPU,
    memory: MemoryManager
  ): number {
    const returnAddress = currentInstructionIndex + 1;
    // Push return address onto stack
    StackInstructions.push({ kind: 'immediate', immediate: returnAddress }, cpu, memory);

    // Resolve target label address
    const targetLabel = target.symbolRef?.toLowerCase();
    if (!targetLabel) throw new Error("CALL target must be a procedure or label");

    const sym = symbols.get(targetLabel);
    if (!sym) throw new Error(`Undefined procedure or label '${target.symbolRef}' in CALL`);

    return sym.address;
  }

  static ret(cpu: CPU, memory: MemoryManager): number {
    return StackInstructions.popRaw(cpu, memory);
  }
}
