// COE224: Assembly Language Studio - Bitwise Logic Instructions (Ch 7)
// AND, OR, XOR, NOT, TEST

import { CPU } from '../cpu';
import { MemoryManager } from '../memory';
import { Operand, FlagDiagnostic } from '../types';
import { FlagEngine } from '../flags';
import { DataTransferInstructions } from './dataTransfer';

export class LogicInstructions {
  static and(dest: Operand, src: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const srcVal = DataTransferInstructions.getOperandValue(src, cpu, memory);
    const size = dest.size ?? 4;
    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;

    const result = ((destVal & srcVal) & mask) >>> 0;
    const { flags, diagnostics } = FlagEngine.computeLogicFlags(result, size, cpu.getFlags(), 'AND');
    cpu.setState({ ...cpu.getState(), flags });

    DataTransferInstructions.setOperandValue(dest, result, cpu, memory);
    return diagnostics;
  }

  static or(dest: Operand, src: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const srcVal = DataTransferInstructions.getOperandValue(src, cpu, memory);
    const size = dest.size ?? 4;
    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;

    const result = ((destVal | srcVal) & mask) >>> 0;
    const { flags, diagnostics } = FlagEngine.computeLogicFlags(result, size, cpu.getFlags(), 'OR');
    cpu.setState({ ...cpu.getState(), flags });

    DataTransferInstructions.setOperandValue(dest, result, cpu, memory);
    return diagnostics;
  }

  static xor(dest: Operand, src: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const srcVal = DataTransferInstructions.getOperandValue(src, cpu, memory);
    const size = dest.size ?? 4;
    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;

    const result = ((destVal ^ srcVal) & mask) >>> 0;
    const { flags, diagnostics } = FlagEngine.computeLogicFlags(result, size, cpu.getFlags(), 'XOR');
    cpu.setState({ ...cpu.getState(), flags });

    DataTransferInstructions.setOperandValue(dest, result, cpu, memory);
    return diagnostics;
  }

  static test(dest: Operand, src: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const srcVal = DataTransferInstructions.getOperandValue(src, cpu, memory);
    const size = dest.size ?? 4;
    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;

    const result = ((destVal & srcVal) & mask) >>> 0;
    // TEST sets flags identically to AND, but does NOT write result!
    const { flags, diagnostics } = FlagEngine.computeLogicFlags(result, size, cpu.getFlags(), 'TEST');
    cpu.setState({ ...cpu.getState(), flags });

    return diagnostics;
  }

  static not(dest: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const size = dest.size ?? 4;
    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;

    // NOT does NOT affect any flags!
    const result = ((~destVal) & mask) >>> 0;
    DataTransferInstructions.setOperandValue(dest, result, cpu, memory);
    return [];
  }
}
