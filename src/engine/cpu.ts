// COE224: Assembly Language Studio - IA-32 CPU State & Register Synchronization

import { CPUState, Registers, Flags } from './types';
import { MEMORY_LAYOUT } from './constants';

export class CPU {
  private state: CPUState;

  constructor() {
    this.state = this.createDefaultState();
  }

  private createDefaultState(): CPUState {
    return {
      registers: {
        eax: 0,
        ebx: 0,
        ecx: 0,
        edx: 0,
        esi: 0,
        edi: 0,
        ebp: MEMORY_LAYOUT.STACK_TOP,
        esp: MEMORY_LAYOUT.STACK_TOP,
        eip: 0,
      },
      flags: {
        CF: 0,
        PF: 0,
        AF: 0,
        ZF: 0,
        SF: 0,
        OF: 0,
        DF: 0,
      },
    };
  }

  reset(): void {
    this.state = this.createDefaultState();
  }

  getState(): CPUState {
    return {
      registers: { ...this.state.registers },
      flags: { ...this.state.flags },
    };
  }

  setState(newState: CPUState): void {
    this.state = {
      registers: { ...newState.registers },
      flags: { ...newState.flags },
    };
  }

  getRegisters(): Registers {
    return { ...this.state.registers };
  }

  getFlags(): Flags {
    return { ...this.state.flags };
  }

  setFlag(flag: keyof Flags, value: 0 | 1): void {
    this.state.flags[flag] = value;
  }

  getFlag(flag: keyof Flags): 0 | 1 {
    return this.state.flags[flag];
  }

  // ---------------------------------------------------------------------------
  // Register Access with 32-bit / 16-bit / 8-bit Synchronization
  // ---------------------------------------------------------------------------

  getRegister(name: string): number {
    const reg = name.toLowerCase();

    // 32-bit
    if (reg in this.state.registers) {
      return this.state.registers[reg as keyof Registers] >>> 0;
    }

    // 16-bit
    switch (reg) {
      case 'ax': return this.state.registers.eax & 0xffff;
      case 'bx': return this.state.registers.ebx & 0xffff;
      case 'cx': return this.state.registers.ecx & 0xffff;
      case 'dx': return this.state.registers.edx & 0xffff;
      case 'si': return this.state.registers.esi & 0xffff;
      case 'di': return this.state.registers.edi & 0xffff;
      case 'bp': return this.state.registers.ebp & 0xffff;
      case 'sp': return this.state.registers.esp & 0xffff;
    }

    // 8-bit Low
    switch (reg) {
      case 'al': return this.state.registers.eax & 0xff;
      case 'bl': return this.state.registers.ebx & 0xff;
      case 'cl': return this.state.registers.ecx & 0xff;
      case 'dl': return this.state.registers.edx & 0xff;
    }

    // 8-bit High
    switch (reg) {
      case 'ah': return (this.state.registers.eax >> 8) & 0xff;
      case 'bh': return (this.state.registers.ebx >> 8) & 0xff;
      case 'ch': return (this.state.registers.ecx >> 8) & 0xff;
      case 'dh': return (this.state.registers.edx >> 8) & 0xff;
    }

    throw new Error(`Unknown register '${name}'`);
  }

  setRegister(name: string, value: number): void {
    const reg = name.toLowerCase();
    const val = value >>> 0;

    // 32-bit
    if (reg in this.state.registers) {
      this.state.registers[reg as keyof Registers] = val;
      return;
    }

    // 16-bit (preserves upper 16 bits of 32-bit parent)
    switch (reg) {
      case 'ax':
        this.state.registers.eax = ((this.state.registers.eax & 0xffff0000) | (val & 0xffff)) >>> 0;
        return;
      case 'bx':
        this.state.registers.ebx = ((this.state.registers.ebx & 0xffff0000) | (val & 0xffff)) >>> 0;
        return;
      case 'cx':
        this.state.registers.ecx = ((this.state.registers.ecx & 0xffff0000) | (val & 0xffff)) >>> 0;
        return;
      case 'dx':
        this.state.registers.edx = ((this.state.registers.edx & 0xffff0000) | (val & 0xffff)) >>> 0;
        return;
      case 'si':
        this.state.registers.esi = ((this.state.registers.esi & 0xffff0000) | (val & 0xffff)) >>> 0;
        return;
      case 'di':
        this.state.registers.edi = ((this.state.registers.edi & 0xffff0000) | (val & 0xffff)) >>> 0;
        return;
      case 'bp':
        this.state.registers.ebp = ((this.state.registers.ebp & 0xffff0000) | (val & 0xffff)) >>> 0;
        return;
      case 'sp':
        this.state.registers.esp = ((this.state.registers.esp & 0xffff0000) | (val & 0xffff)) >>> 0;
        return;
    }

    // 8-bit Low (preserves bits 8-31 of 32-bit parent)
    switch (reg) {
      case 'al':
        this.state.registers.eax = ((this.state.registers.eax & 0xffffff00) | (val & 0xff)) >>> 0;
        return;
      case 'bl':
        this.state.registers.ebx = ((this.state.registers.ebx & 0xffffff00) | (val & 0xff)) >>> 0;
        return;
      case 'cl':
        this.state.registers.ecx = ((this.state.registers.ecx & 0xffffff00) | (val & 0xff)) >>> 0;
        return;
      case 'dl':
        this.state.registers.edx = ((this.state.registers.edx & 0xffffff00) | (val & 0xff)) >>> 0;
        return;
    }

    // 8-bit High (preserves bits 0-7 and 16-31 of 32-bit parent)
    switch (reg) {
      case 'ah':
        this.state.registers.eax = ((this.state.registers.eax & 0xffff00ff) | ((val & 0xff) << 8)) >>> 0;
        return;
      case 'bh':
        this.state.registers.ebx = ((this.state.registers.ebx & 0xffff00ff) | ((val & 0xff) << 8)) >>> 0;
        return;
      case 'ch':
        this.state.registers.ecx = ((this.state.registers.ecx & 0xffff00ff) | ((val & 0xff) << 8)) >>> 0;
        return;
      case 'dh':
        this.state.registers.edx = ((this.state.registers.edx & 0xffff00ff) | ((val & 0xff) << 8)) >>> 0;
        return;
    }

    throw new Error(`Unknown register '${name}'`);
  }
}
