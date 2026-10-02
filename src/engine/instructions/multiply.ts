// COE224: Assembly Language Studio - Integer Arithmetic & Multiply/Divide (Ch 7)
// MUL, IMUL, DIV, IDIV, CBW, CWD, CDQ

import { CPU } from '../cpu';
import { MemoryManager } from '../memory';
import { Operand, FlagDiagnostic } from '../types';
import { DataTransferInstructions } from './dataTransfer';

export class MultiplyDivideInstructions {
  static mul(src: Operand, cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const srcVal = DataTransferInstructions.getOperandValue(src, cpu, memory);
    const size = src.size ?? 4;
    const oldFlags = cpu.getFlags();
    let cfOf: 0 | 1 = 0;

    if (size === 1) {
      const al = cpu.getRegister('al');
      const product = (al * (srcVal & 0xff)) >>> 0;
      cpu.setRegister('ax', product & 0xffff);
      cfOf = (product >> 8) !== 0 ? 1 : 0;
    } else if (size === 2) {
      const ax = cpu.getRegister('ax');
      const product = (ax * (srcVal & 0xffff)) >>> 0;
      cpu.setRegister('ax', product & 0xffff);
      cpu.setRegister('dx', (product >> 16) & 0xffff);
      cfOf = (product >> 16) !== 0 ? 1 : 0;
    } else {
      // 32-bit multiplication using BigInt for precision
      const eax = BigInt(cpu.getRegister('eax'));
      const multiplicand = BigInt(srcVal >>> 0);
      const product = eax * multiplicand;
      const low = Number(product & BigInt(0xffffffff)) >>> 0;
      const high = Number((product >> BigInt(32)) & BigInt(0xffffffff)) >>> 0;
      cpu.setRegister('eax', low);
      cpu.setRegister('edx', high);
      cfOf = high !== 0 ? 1 : 0;
    }

    cpu.setState({
      ...cpu.getState(),
      flags: {
        ...oldFlags,
        CF: cfOf,
        OF: cfOf,
      },
    });

    return [
      {
        flag: 'CF',
        oldValue: oldFlags.CF,
        newValue: cfOf,
        reason:
          cfOf === 1
            ? 'CF=OF=1: The upper half of the product was non-zero.'
            : 'CF=OF=0: The product fits completely in the lower half destination register.',
      },
    ];
  }

  static imul(operands: Operand[], cpu: CPU, memory: MemoryManager): FlagDiagnostic[] {
    const oldFlags = cpu.getFlags();

    // 1-operand form: IMUL reg/mem
    if (operands.length === 1) {
      const src = operands[0];
      const srcVal = DataTransferInstructions.getOperandValue(src, cpu, memory);
      const size = src.size ?? 4;
      let cfOf: 0 | 1 = 0;

      if (size === 1) {
        const al = (cpu.getRegister('al') << 24) >> 24; // signed 8-bit
        const sVal = (srcVal << 24) >> 24;
        const product = al * sVal;
        cpu.setRegister('ax', product & 0xffff);
        cfOf = product < -128 || product > 127 ? 1 : 0;
      } else if (size === 2) {
        const ax = (cpu.getRegister('ax') << 16) >> 16;
        const sVal = (srcVal << 16) >> 16;
        const product = ax * sVal;
        cpu.setRegister('ax', product & 0xffff);
        cpu.setRegister('dx', (product >> 16) & 0xffff);
        cfOf = product < -32768 || product > 32767 ? 1 : 0;
      } else {
        const eax = BigInt((cpu.getRegister('eax') | 0));
        const sVal = BigInt((srcVal | 0));
        const product = eax * sVal;
        const low = Number(BigInt.asIntN(32, product)) >>> 0;
        const high = Number(BigInt.asIntN(32, product >> BigInt(32))) >>> 0;
        cpu.setRegister('eax', low);
        cpu.setRegister('edx', high);
        cfOf = product < BigInt(-2147483648) || product > BigInt(2147483647) ? 1 : 0;
      }

      cpu.setState({
        ...cpu.getState(),
        flags: { ...oldFlags, CF: cfOf, OF: cfOf },
      });

      return [
        {
          flag: 'OF',
          oldValue: oldFlags.OF,
          newValue: cfOf,
          reason: `OF=CF=${cfOf}: Signed product ${cfOf === 1 ? 'overflowed' : 'fits within'} lower register.`,
        },
      ];
    }

    // 2-operand form: IMUL reg, reg/mem/imm
    if (operands.length === 2) {
      const dest = operands[0];
      const src = operands[1];
      const destVal = DataTransferInstructions.getOperandValue(dest, cpu, memory);
      const srcVal = DataTransferInstructions.getOperandValue(src, cpu, memory);
      const product = ((destVal | 0) * (srcVal | 0)) | 0;
      DataTransferInstructions.setOperandValue(dest, product >>> 0, cpu, memory);
      return [];
    }

    // 3-operand form: IMUL reg, reg/mem, imm
    if (operands.length === 3) {
      const dest = operands[0];
      const src1 = operands[1];
      const src2 = operands[2];
      const v1 = DataTransferInstructions.getOperandValue(src1, cpu, memory);
      const v2 = DataTransferInstructions.getOperandValue(src2, cpu, memory);
      const product = ((v1 | 0) * (v2 | 0)) | 0;
      DataTransferInstructions.setOperandValue(dest, product >>> 0, cpu, memory);
      return [];
    }

    return [];
  }

  static div(src: Operand, cpu: CPU, memory: MemoryManager): void {
    const divisor = DataTransferInstructions.getOperandValue(src, cpu, memory);
    const size = src.size ?? 4;

    if (divisor === 0) {
      throw new Error("Division by zero (DIV error: divisor is 0)");
    }

    if (size === 1) {
      const ax = cpu.getRegister('ax');
      const quot = Math.floor(ax / divisor);
      const rem = ax % divisor;
      if (quot > 255) throw new Error("Divide overflow: quotient exceeds 8-bit AL capacity");
      cpu.setRegister('al', quot);
      cpu.setRegister('ah', rem);
    } else if (size === 2) {
      const dividend = ((cpu.getRegister('dx') << 16) | cpu.getRegister('ax')) >>> 0;
      const quot = Math.floor(dividend / divisor);
      const rem = dividend % divisor;
      if (quot > 65535) throw new Error("Divide overflow: quotient exceeds 16-bit AX capacity");
      cpu.setRegister('ax', quot);
      cpu.setRegister('dx', rem);
    } else {
      const high = BigInt(cpu.getRegister('edx'));
      const low = BigInt(cpu.getRegister('eax'));
      const dividend = (high << BigInt(32)) | low;
      const d = BigInt(divisor >>> 0);
      const quot = dividend / d;
      const rem = dividend % d;
      if (quot > BigInt(0xffffffff)) throw new Error("Divide overflow: quotient exceeds 32-bit EAX capacity");
      cpu.setRegister('eax', Number(quot) >>> 0);
      cpu.setRegister('edx', Number(rem) >>> 0);
    }
  }

  static idiv(src: Operand, cpu: CPU, memory: MemoryManager): void {
    const divisor = DataTransferInstructions.getOperandValue(src, cpu, memory);
    const size = src.size ?? 4;

    if (divisor === 0) {
      throw new Error("Division by zero (IDIV error: divisor is 0)");
    }

    if (size === 1) {
      const ax = (cpu.getRegister('ax') << 16) >> 16;
      const d = (divisor << 24) >> 24;
      const quot = Math.trunc(ax / d);
      const rem = ax % d;
      if (quot < -128 || quot > 127) throw new Error("Divide overflow: signed quotient exceeds 8-bit AL");
      cpu.setRegister('al', quot & 0xff);
      cpu.setRegister('ah', rem & 0xff);
    } else if (size === 2) {
      const high = cpu.getRegister('dx');
      const low = cpu.getRegister('ax');
      const dividend = (high << 16) | low; // 32-bit signed
      const d = (divisor << 16) >> 16;
      const quot = Math.trunc(dividend / d);
      const rem = dividend % d;
      if (quot < -32768 || quot > 32767) throw new Error("Divide overflow: signed quotient exceeds 16-bit AX");
      cpu.setRegister('ax', quot & 0xffff);
      cpu.setRegister('dx', rem & 0xffff);
    } else {
      const high = BigInt(cpu.getRegister('edx') | 0);
      const low = BigInt(cpu.getRegister('eax') >>> 0);
      const dividend = (high << BigInt(32)) | low;
      const d = BigInt(divisor | 0);
      const quot = dividend / d;
      const rem = dividend % d;
      if (quot < BigInt(-2147483648) || quot > BigInt(2147483647)) {
        throw new Error("Divide overflow: signed quotient exceeds 32-bit EAX");
      }
      cpu.setRegister('eax', Number(BigInt.asIntN(32, quot)) >>> 0);
      cpu.setRegister('edx', Number(BigInt.asIntN(32, rem)) >>> 0);
    }
  }

  static cbw(cpu: CPU): void {
    const al = cpu.getRegister('al');
    const signExt = (al << 24) >> 24;
    cpu.setRegister('ax', signExt & 0xffff);
  }

  static cwd(cpu: CPU): void {
    const ax = (cpu.getRegister('ax') << 16) >> 16;
    cpu.setRegister('dx', ax < 0 ? 0xffff : 0);
  }

  static cdq(cpu: CPU): void {
    const eax = cpu.getRegister('eax') | 0;
    cpu.setRegister('edx', eax < 0 ? 0xffffffff : 0);
  }
}
