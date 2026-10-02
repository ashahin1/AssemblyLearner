// COE224: Assembly Language Studio - Basic Arithmetic Instructions (Ch 4)
// ADD, SUB, CMP, INC, DEC, NEG

import { CPU } from '../cpu';
import { MemoryManager } from '../memory';
import { Operand, FlagDiagnostic } from '../types';
import { FlagEngine } from '../flags';
import { DataTransferInstructions } from './dataTransfer';

export class ArithmeticInstructions {
  static add(dest: Operand, src: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const srcVal = DataTransferInstructions.getOperandValue(src, cpu, memory);
    const size = dest.size ?? 4;

    const { flags, diagnostics } = FlagEngine.computeAddFlags(destVal, srcVal, size, cpu.getFlags());
    cpu.setState({ ...cpu.getState(), flags });

    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
    const result = ((destVal + srcVal) & mask) >>> 0;
    DataTransferInstructions.setOperandValue(dest, result, cpu, memory);

    return diagnostics;
  }

  static sub(dest: Operand, src: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const srcVal = DataTransferInstructions.getOperandValue(src, cpu, memory);
    const size = dest.size ?? 4;

    const { flags, diagnostics } = FlagEngine.computeSubFlags(destVal, srcVal, size, cpu.getFlags(), false);
    cpu.setState({ ...cpu.getState(), flags });

    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
    const result = ((destVal - srcVal) & mask) >>> 0;
    DataTransferInstructions.setOperandValue(dest, result, cpu, memory);

    return diagnostics;
  }

  static cmp(dest: Operand, src: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const srcVal = DataTransferInstructions.getOperandValue(src, cpu, memory);
    const size = dest.size ?? 4;

    // CMP performs subtraction, updates flags, but does NOT write result to destination!
    const { flags, diagnostics } = FlagEngine.computeSubFlags(destVal, srcVal, size, cpu.getFlags(), true);
    cpu.setState({ ...cpu.getState(), flags });

    return diagnostics;
  }

  static inc(dest: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const size = dest.size ?? 4;

    const { flags, diagnostics } = FlagEngine.computeIncDecFlags(destVal, true, size, cpu.getFlags());
    cpu.setState({ ...cpu.getState(), flags });

    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
    const result = ((destVal + 1) & mask) >>> 0;
    DataTransferInstructions.setOperandValue(dest, result, cpu, memory);

    return diagnostics;
  }

  static dec(dest: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const size = dest.size ?? 4;

    const { flags, diagnostics } = FlagEngine.computeIncDecFlags(destVal, false, size, cpu.getFlags());
    cpu.setState({ ...cpu.getState(), flags });

    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
    const result = ((destVal - 1) & mask) >>> 0;
    DataTransferInstructions.setOperandValue(dest, result, cpu, memory);

    return diagnostics;
  }

  static neg(dest: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const size = dest.size ?? 4;

    // NEG is 0 - dest
    const { flags, diagnostics } = FlagEngine.computeSubFlags(0, destVal, size, cpu.getFlags(), false);
    // NEG sets CF=1 for any non-zero value, and CF=0 if dest was 0
    flags.CF = destVal === 0 ? 0 : 1;
    cpu.setState({ ...cpu.getState(), flags });

    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
    const result = ((-destVal) & mask) >>> 0;
    DataTransferInstructions.setOperandValue(dest, result, cpu, memory);

    return diagnostics;
  }
}
