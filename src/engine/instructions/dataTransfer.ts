// COE224: Assembly Language Studio - Data Transfer Instructions (Ch 4)
// MOV, MOVZX, MOVSX, XCHG, LEA

import { CPU } from '../cpu';
import { MemoryManager } from '../memory';
import { Operand } from '../types';

export class DataTransferInstructions {
  static mov(dest: Operand, src: Operand, cpu: CPU, memory: MemoryManager): void {
    const srcVal = this.getOperandValue(src, cpu, memory);
    this.setOperandValue(dest, srcVal, cpu, memory);
  }

  static movzx(dest: Operand, src: Operand, cpu: CPU, memory: MemoryManager): void {
    const srcVal = this.getOperandValue(src, cpu, memory);
    // Zero-extend into destination register
    this.setOperandValue(dest, srcVal >>> 0, cpu, memory);
  }

  static movsx(dest: Operand, src: Operand, cpu: CPU, memory: MemoryManager): void {
    const rawVal = this.getOperandValue(src, cpu, memory);
    const srcSize = src.size ?? 1;
    let signExtended = rawVal;

    if (srcSize === 1) {
      // 8-bit sign extend to 16/32-bit
      signExtended = (rawVal << 24) >> 24;
    } else if (srcSize === 2) {
      // 16-bit sign extend to 32-bit
      signExtended = (rawVal << 16) >> 16;
    }

    this.setOperandValue(dest, signExtended >>> 0, cpu, memory);
  }

  static xchg(op1: Operand, op2: Operand, cpu: CPU, memory: MemoryManager): void {
    const val1 = this.getOperandValue(op1, cpu, memory);
    const val2 = this.getOperandValue(op2, cpu, memory);
    this.setOperandValue(op1, val2, cpu, memory);
    this.setOperandValue(op2, val1, cpu, memory);
  }

  static lea(dest: Operand, src: Operand, cpu: CPU, memory: MemoryManager): void {
    // Load Effective Address
    if (src.kind !== 'memory') {
      throw new Error("LEA requires a memory operand as source");
    }
    const effAddr = this.getEffectiveAddress(src, cpu);
    this.setOperandValue(dest, effAddr, cpu, memory);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  static getEffectiveAddress(op: Operand, cpu: CPU): number {
    let addr = op.displacement ?? 0;
    if (op.baseReg) {
      addr += cpu.getRegister(op.baseReg);
    }
    if (op.indexReg) {
      const scale = op.scale ?? 1;
      addr += cpu.getRegister(op.indexReg) * scale;
    }
    return addr >>> 0;
  }

  static getOperandValue(op: Operand, cpu: CPU, memory: MemoryManager): number {
    if (op.kind === 'register' && op.register) {
      return cpu.getRegister(op.register);
    }
    if (op.kind === 'immediate') {
      return op.immediate ?? 0;
    }
    if (op.kind === 'memory') {
      const addr = this.getEffectiveAddress(op, cpu);
      const size = op.size ?? 4;
      if (size === 1) return memory.readByte(addr);
      if (size === 2) return memory.readWord(addr);
      return memory.readDword(addr);
    }
    throw new Error(`Unsupported operand kind for read: ${op.kind}`);
  }

  static setOperandValue(op: Operand, value: number, cpu: CPU, memory: MemoryManager): void {
    const val = value >>> 0;
    if (op.kind === 'register' && op.register) {
      cpu.setRegister(op.register, val);
      return;
    }
    if (op.kind === 'memory') {
      const addr = this.getEffectiveAddress(op, cpu);
      const size = op.size ?? 4;
      if (size === 1) memory.writeByte(addr, val & 0xff);
      else if (size === 2) memory.writeWord(addr, val & 0xffff);
      else memory.writeDword(addr, val);
      return;
    }
    throw new Error(`Cannot write to operand kind: ${op.kind}`);
  }
}
