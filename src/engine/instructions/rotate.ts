// COE224: Assembly Language Studio - Rotate Instructions (Ch 7)
// ROL, ROR, RCL, RCR

import { CPU } from '../cpu';
import { MemoryManager } from '../memory';
import { Operand, FlagDiagnostic } from '../types';
import { DataTransferInstructions } from './dataTransfer';

export class RotateInstructions {
  static rol(dest: Operand, countOp: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    return this.executeRotate(dest, countOp, 'ROL', cpu, memory);
  }

  static ror(dest: Operand, countOp: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    return this.executeRotate(dest, countOp, 'ROR', cpu, memory);
  }

  static rcl(dest: Operand, countOp: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    return this.executeRotate(dest, countOp, 'RCL', cpu, memory);
  }

  static rcr(dest: Operand, countOp: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    return this.executeRotate(dest, countOp, 'RCR', cpu, memory);
  }

  private static executeRotate(
    dest: Operand,
    countOp: Operand,
    type: 'ROL' | 'ROR' | 'RCL' | 'RCR',
    cpu: CPU,
    memory: MemoryManager
  ): FlagDiagnostic[] {
    const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
    const rawCount = DataTransferInstructions.getOperandValue(countOp, cpu, memory) & 0x1f;
    if (rawCount === 0) return [];

    const size = dest.size ?? 4;
    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
    const bits = size * 8;
    const signBit = size === 1 ? 0x80 : size === 2 ? 0x8000 : 0x80000000;

    let result = destVal & mask;
    let cf = cpu.getFlag('CF');
    let of: 0 | 1 = 0;

    for (let i = 0; i < rawCount; i++) {
      if (type === 'ROL') {
        const msb = ((result & signBit) !== 0 ? 1 : 0) as (0 | 1);
        result = ((result << 1) | msb) & mask;
        cf = msb;
      } else if (type === 'ROR') {
        const lsb = ((result & 1) !== 0 ? 1 : 0) as (0 | 1);
        result = ((result >>> 1) | (lsb << (bits - 1))) & mask;
        cf = lsb;
      } else if (type === 'RCL') {
        const msb = ((result & signBit) !== 0 ? 1 : 0) as (0 | 1);
        result = ((result << 1) | cf) & mask;
        cf = msb;
      } else if (type === 'RCR') {
        const lsb = ((result & 1) !== 0 ? 1 : 0) as (0 | 1);
        result = ((result >>> 1) | (cf << (bits - 1))) & mask;
        cf = lsb;
      }
    }

    if (rawCount === 1) {
      if (type === 'ROL' || type === 'RCL') {
        const msb = (result & signBit) !== 0 ? 1 : 0;
        of = (msb !== cf ? 1 : 0) as (0 | 1);
      } else {
        const msb = (result & signBit) !== 0 ? 1 : 0;
        const nextMsb = (result & (signBit >> 1)) !== 0 ? 1 : 0;
        of = (msb !== nextMsb ? 1 : 0) as (0 | 1);
      }
    }

    result = result >>> 0;
    const oldFlags = cpu.getFlags();
    cpu.setState({
      ...cpu.getState(),
      flags: {
        ...oldFlags,
        CF: cf,
        OF: of,
      },
    });

    DataTransferInstructions.setOperandValue(dest, result, cpu, memory);

    return [
      {
        flag: 'CF',
        oldValue: oldFlags.CF,
        newValue: cf,
        reason: `CF=${cf}: Last bit rotated into CF was ${cf}.`,
      },
    ];
  }
}
