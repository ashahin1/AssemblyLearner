// COE224: Assembly Language Studio - Shift Instructions (Ch 7)
// SHL, SHR, SAL, SAR

import { CPU } from '../cpu';
import { MemoryManager } from '../memory';
import { Operand, FlagDiagnostic } from '../types';
import { FlagEngine } from '../flags';
import { DataTransferInstructions } from './dataTransfer';

export class ShiftInstructions {
  static shl(dest: Operand, countOp: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    return this.executeShift(dest, countOp, 'SHL', cpu, memory);
  }

  static sal(dest: Operand, countOp: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    return this.executeShift(dest, countOp, 'SHL', cpu, memory);
  }

  static shr(dest: Operand, countOp: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    return this.executeShift(dest, countOp, 'SHR', cpu, memory);
  }

  static sar(dest: Operand, countOp: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    return this.executeShift(dest, countOp, 'SAR', cpu, memory);
  }

  private static executeShift(
    dest: Operand,
    countOp: Operand,
    type: 'SHL' | 'SHR' | 'SAR',
    cpu: CPU,
    memory: MemoryManager
  ): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const count = (DataTransferInstructions.getOperandValue(countOp, cpu, memory) & 0x1f) >>> 0;
    if (count === 0) return []; // 0 count does not alter flags

    const size = dest.size ?? 4;
    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
    const signBit = size === 1 ? 0x80 : size === 2 ? 0x8000 : 0x80000000;
    const bits = size * 8;

    let result = destVal & mask;
    let cf: 0 | 1 = 0;
    let of: 0 | 1 = 0;

    if (type === 'SHL') {
      // Last bit shifted out
      if (count <= bits) {
        cf = ((result >> (bits - count)) & 1) as (0 | 1);
      }
      result = (result << count) & mask;
      if (count === 1) {
        // OF is set if MSB changed
        const msb = (result & signBit) !== 0;
        of = (msb !== (cf === 1)) ? 1 : 0;
      }
    } else if (type === 'SHR') {
      if (count <= bits) {
        cf = ((result >> (count - 1)) & 1) as (0 | 1);
      }
      result = (result >>> count) & mask;
      if (count === 1) {
        // OF is MSB of original operand
        of = ((destVal & signBit) !== 0) ? 1 : 0;
      }
    } else if (type === 'SAR') {
      // Arithmetic shift right preserves sign bit
      const isNegative = (destVal & signBit) !== 0;
      if (count <= bits) {
        cf = ((result >> (count - 1)) & 1) as (0 | 1);
      }
      if (isNegative) {
        // Sign extend
        result = (result >>> count) | (~0 << (bits - count)) & mask;
      } else {
        result = (result >>> count) & mask;
      }
      if (count === 1) {
        of = 0; // OF is always 0 for 1-bit SAR
      }
    }

    result = result >>> 0;
    const zf: 0 | 1 = result === 0 ? 1 : 0;
    const sf: 0 | 1 = (result & signBit) !== 0 ? 1 : 0;
    const pf = FlagEngine.computePF(result);

    const oldFlags = cpu.getFlags();
    const newFlags = {
      ...oldFlags,
      CF: cf,
      OF: of,
      ZF: zf,
      SF: sf,
      PF: pf,
    };
    cpu.setState({ ...cpu.getState(), flags: newFlags });
    DataTransferInstructions.setOperandValue(dest, result, cpu, memory);

    return [
      {
        flag: 'CF',
        oldValue: oldFlags.CF,
        newValue: cf,
        reason: `CF=${cf}: Last bit shifted out of operand was ${cf}.`,
      },
    ];
  }
}
