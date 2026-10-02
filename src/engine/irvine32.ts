// COE224: Assembly Language Studio - Irvine32 Library Runtime Emulation

import { CPU } from './cpu';
import { MemoryManager } from './memory';

export interface IrvineConsoleIO {
  print(text: string): void;
  clear(): void;
  requestInput(type: 'int' | 'dec' | 'hex' | 'char' | 'string', maxChars?: number): Promise<string>;
}

export class Irvine32Runtime {
  static isIrvineProcedure(name: string): boolean {
    const procs = [
      'writestring', 'writeint', 'writedec', 'writehex', 'writebin', 'writechar',
      'crlf', 'clrscr', 'readint', 'readdec', 'readhex', 'readchar', 'readstring',
      'dumpregs', 'dumpmem', 'random32', 'randomrange', 'randomize', 'waitmsg',
      'delay', 'getmseconds', 'str_length'
    ];
    return procs.includes(name.toLowerCase());
  }

  static isInputProcedure(name: string): boolean {
    const inputProcs = ['readint', 'readdec', 'readhex', 'readchar', 'readstring', 'waitmsg'];
    return inputProcs.includes(name.toLowerCase());
  }

  static executeSync(
    procName: string,
    cpu: CPU,
    memory: MemoryManager,
    printOutput: (text: string) => void,
    clearConsole: () => void
  ): void {
    const name = procName.toLowerCase();

    switch (name) {
      case 'writestring': {
        const edx = cpu.getRegister('edx');
        let str = '';
        let offset = edx;
        while (true) {
          const byte = memory.readByte(offset++);
          if (byte === 0) break;
          str += String.fromCharCode(byte);
        }
        printOutput(str);
        break;
      }

      case 'writeint': {
        const eax = cpu.getRegister('eax') | 0; // signed 32-bit
        const prefix = eax >= 0 ? '+' : '';
        printOutput(`${prefix}${eax}`);
        break;
      }

      case 'writedec': {
        const eax = cpu.getRegister('eax') >>> 0;
        printOutput(`${eax}`);
        break;
      }

      case 'writehex': {
        const eax = cpu.getRegister('eax') >>> 0;
        printOutput(eax.toString(16).toUpperCase().padStart(8, '0'));
        break;
      }

      case 'writebin': {
        const eax = cpu.getRegister('eax') >>> 0;
        const bin = eax.toString(2).padStart(32, '0');
        // Group into 4-bit nibbles like Irvine32
        const formatted = bin.match(/.{1,4}/g)?.join(' ') ?? bin;
        printOutput(formatted);
        break;
      }

      case 'writechar': {
        const al = cpu.getRegister('al');
        printOutput(String.fromCharCode(al));
        break;
      }

      case 'crlf': {
        printOutput('\n');
        break;
      }

      case 'clrscr': {
        clearConsole();
        break;
      }

      case 'dumpregs': {
        const r = cpu.getRegisters();
        const f = cpu.getFlags();
        const hex = (val: number, pad = 8) => (val >>> 0).toString(16).toUpperCase().padStart(pad, '0');

        const dump =
          `  EAX=${hex(r.eax)}  EBX=${hex(r.ebx)}  ECX=${hex(r.ecx)}  EDX=${hex(r.edx)}\n` +
          `  ESI=${hex(r.esi)}  EDI=${hex(r.edi)}  EBP=${hex(r.ebp)}  ESP=${hex(r.esp)}\n` +
          `  EIP=${hex(r.eip)}  CF=${f.CF}  SF=${f.SF}  ZF=${f.ZF}  OF=${f.OF}  AF=${f.AF}  PF=${f.PF}\n`;
        printOutput(dump);
        break;
      }

      case 'dumpmem': {
        const esi = cpu.getRegister('esi');
        const ecx = cpu.getRegister('ecx');
        const ebx = cpu.getRegister('ebx') || 1; // unit size: 1, 2, or 4
        let out = `Dump of Memory: address ${esi.toString(16).toUpperCase()}h, count ${ecx}\n`;
        for (let i = 0; i < ecx; i++) {
          const addr = esi + i * ebx;
          let val = 0;
          if (ebx === 1) val = memory.readByte(addr);
          else if (ebx === 2) val = memory.readWord(addr);
          else val = memory.readDword(addr);
          out += `${addr.toString(16).toUpperCase().padStart(8, '0')}: ${val.toString(16).toUpperCase().padStart(ebx * 2, '0')} `;
          if ((i + 1) % 4 === 0) out += '\n';
        }
        printOutput(out + '\n');
        break;
      }

      case 'random32': {
        const rand = Math.floor(Math.random() * 0x100000000) >>> 0;
        cpu.setRegister('eax', rand);
        break;
      }

      case 'randomrange': {
        const range = cpu.getRegister('eax');
        if (range > 0) {
          const rand = Math.floor(Math.random() * range) >>> 0;
          cpu.setRegister('eax', rand);
        } else {
          cpu.setRegister('eax', 0);
        }
        break;
      }

      case 'randomize': {
        // Automatic in JS
        break;
      }

      case 'str_length': {
        const edx = cpu.getRegister('edx');
        let len = 0;
        let addr = edx;
        while (memory.readByte(addr++) !== 0) {
          len++;
        }
        cpu.setRegister('eax', len);
        break;
      }

      default:
        break;
    }
  }

  static handleInputResult(procName: string, input: string, cpu: CPU, memory: MemoryManager): void {
    const name = procName.toLowerCase();

    if (name === 'readint') {
      const parsed = parseInt(input.trim(), 10);
      cpu.setRegister('eax', isNaN(parsed) ? 0 : parsed >>> 0);
    } else if (name === 'readdec') {
      const parsed = Math.max(0, parseInt(input.trim(), 10));
      cpu.setRegister('eax', isNaN(parsed) ? 0 : parsed >>> 0);
    } else if (name === 'readhex') {
      const parsed = parseInt(input.trim(), 16);
      cpu.setRegister('eax', isNaN(parsed) ? 0 : parsed >>> 0);
    } else if (name === 'readchar') {
      const charCode = input.length > 0 ? input.charCodeAt(0) : 0;
      cpu.setRegister('al', charCode & 0xff);
    } else if (name === 'readstring') {
      const edx = cpu.getRegister('edx');
      const ecx = cpu.getRegister('ecx');
      const maxLen = Math.max(0, ecx - 1);
      const strToStore = input.slice(0, maxLen);
      for (let i = 0; i < strToStore.length; i++) {
        memory.writeByte(edx + i, strToStore.charCodeAt(i));
      }
      memory.writeByte(edx + strToStore.length, 0); // null terminator
      cpu.setRegister('eax', strToStore.length);
    }
  }
}
