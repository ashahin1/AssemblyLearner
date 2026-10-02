// COE224: Assembly Language Studio - Stack Instructions (Ch 5)
// PUSH, POP, PUSHAD, POPAD, PUSHFD, POPFD

import { CPU } from '../cpu';
import { MemoryManager } from '../memory';
import { Operand } from '../types';
import { MEMORY_LAYOUT } from '../constants';
import { DataTransferInstructions } from './dataTransfer';

export class StackInstructions {
  static push(src: Operand, cpu: CPU, memory: MemoryManager): void {
    const val = DataTransferInstructions.getOperandValue(src, cpu, memory);
    const esp = cpu.getRegister('esp');

    if (esp - 4 < MEMORY_LAYOUT.STACK_BOTTOM) {
      throw new Error(`Stack overflow: ESP (${(esp - 4).toString(16)}h) exceeded allocated stack boundary.`);
    }

    const newEsp = (esp - 4) >>> 0;
    cpu.setRegister('esp', newEsp);
    memory.writeDword(newEsp, val);
  }

  static pop(dest: Operand, cpu: CPU, memory: MemoryManager): void {
    const esp = cpu.getRegister('esp');

    if (esp >= MEMORY_LAYOUT.STACK_TOP) {
      throw new Error(`Stack underflow: POP with ESP (${esp.toString(16)}h) at or above top of stack.`);
    }

    const val = memory.readDword(esp);
    cpu.setRegister('esp', (esp + 4) >>> 0);
    DataTransferInstructions.setOperandValue(dest, val, cpu, memory);
  }

  static pushad(cpu: CPU, memory: MemoryManager): void {
    const eax = cpu.getRegister('eax');
    const ecx = cpu.getRegister('ecx');
    const edx = cpu.getRegister('edx');
    const ebx = cpu.getRegister('ebx');
    const esp = cpu.getRegister('esp');
    const ebp = cpu.getRegister('ebp');
    const esi = cpu.getRegister('esi');
    const edi = cpu.getRegister('edi');

    this.push({ kind: 'immediate', immediate: eax }, cpu, memory);
    this.push({ kind: 'immediate', immediate: ecx }, cpu, memory);
    this.push({ kind: 'immediate', immediate: edx }, cpu, memory);
    this.push({ kind: 'immediate', immediate: ebx }, cpu, memory);
    this.push({ kind: 'immediate', immediate: esp }, cpu, memory);
    this.push({ kind: 'immediate', immediate: ebp }, cpu, memory);
    this.push({ kind: 'immediate', immediate: esi }, cpu, memory);
    this.push({ kind: 'immediate', immediate: edi }, cpu, memory);
  }

  static popad(cpu: CPU, memory: MemoryManager): void {
    const edi = this.popRaw(cpu, memory);
    const esi = this.popRaw(cpu, memory);
    const ebp = this.popRaw(cpu, memory);
    this.popRaw(cpu, memory); // skip stored ESP
    const ebx = this.popRaw(cpu, memory);
    const edx = this.popRaw(cpu, memory);
    const ecx = this.popRaw(cpu, memory);
    const eax = this.popRaw(cpu, memory);

    cpu.setRegister('edi', edi);
    cpu.setRegister('esi', esi);
    cpu.setRegister('ebp', ebp);
    cpu.setRegister('ebx', ebx);
    cpu.setRegister('edx', edx);
    cpu.setRegister('ecx', ecx);
    cpu.setRegister('eax', eax);
  }

  static pushfd(cpu: CPU, memory: MemoryManager): void {
    const f = cpu.getFlags();
    let eflags = 0;
    if (f.CF) eflags |= 1 << 0;
    if (f.PF) eflags |= 1 << 2;
    if (f.AF) eflags |= 1 << 4;
    if (f.ZF) eflags |= 1 << 6;
    if (f.SF) eflags |= 1 << 7;
    if (f.DF) eflags |= 1 << 10;
    if (f.OF) eflags |= 1 << 11;

    this.push({ kind: 'immediate', immediate: eflags }, cpu, memory);
  }

  static popfd(cpu: CPU, memory: MemoryManager): void {
    const val = this.popRaw(cpu, memory);
    cpu.setState({
      ...cpu.getState(),
      flags: {
        CF: (val & (1 << 0)) ? 1 : 0,
        PF: (val & (1 << 2)) ? 1 : 0,
        AF: (val & (1 << 4)) ? 1 : 0,
        ZF: (val & (1 << 6)) ? 1 : 0,
        SF: (val & (1 << 7)) ? 1 : 0,
        DF: (val & (1 << 10)) ? 1 : 0,
        OF: (val & (1 << 11)) ? 1 : 0,
      },
    });
  }

  static popRaw(cpu: CPU, memory: MemoryManager): number {
    const esp = cpu.getRegister('esp');
    if (esp >= MEMORY_LAYOUT.STACK_TOP) {
      throw new Error("Stack underflow in POP operation");
    }
    const val = memory.readDword(esp);
    cpu.setRegister('esp', (esp + 4) >>> 0);
    return val;
  }
}
