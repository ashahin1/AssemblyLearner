// Integration tests: Full MASM textbook programs execution

import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/engine/lexer';
import { Parser } from '../../src/engine/parser';
import { CPU } from '../../src/engine/cpu';
import { MemoryManager } from '../../src/engine/memory';
import { HistoryManager } from '../../src/engine/history';
import { ProgramRunner } from '../../src/engine/runner';

describe('Textbook Programs Execution', () => {
  it('executes simple arithmetic and exits', async () => {
    const code = `
.data
val1 DWORD 10h
val2 DWORD 20h
.code
main PROC
    mov eax, val1
    add eax, val2
    exit
main ENDP
END main
`;
    const tokens = new Lexer(code).tokenize();
    const parsed = new Parser(tokens).assemble();
    expect(parsed.errors.length).toBe(0);

    const cpu = new CPU();
    const memory = new MemoryManager();
    memory.loadInitialData(parsed.initialData);
    const history = new HistoryManager();
    let consoleOutput = '';

    const runner = new ProgramRunner(
      parsed.instructions,
      parsed.symbols,
      cpu,
      memory,
      history,
      (text) => (consoleOutput += text),
      () => (consoleOutput = ''),
      () => consoleOutput.length
    );

    const gen = runner.runGenerator();
    let result = await gen.next();
    while (!result.done && result.value?.type !== 'HALTED' && result.value?.type !== 'ERROR') {
      result = await gen.next();
    }

    expect(cpu.getRegister('eax')).toBe(0x30); // 10h + 20h = 30h (48)
  });

  it('executes a counting loop to sum array elements', async () => {
    const code = `
.data
myArray DWORD 10, 20, 30, 40
.code
main PROC
    mov esi, OFFSET myArray
    mov ecx, 4
    mov eax, 0
L1:
    add eax, [esi]
    add esi, 4
    loop L1
    exit
main ENDP
END main
`;
    const tokens = new Lexer(code).tokenize();
    const parsed = new Parser(tokens).assemble();
    expect(parsed.errors.length).toBe(0);

    const cpu = new CPU();
    const memory = new MemoryManager();
    memory.loadInitialData(parsed.initialData);
    const history = new HistoryManager();
    let consoleOutput = '';

    const runner = new ProgramRunner(
      parsed.instructions,
      parsed.symbols,
      cpu,
      memory,
      history,
      (text) => (consoleOutput += text),
      () => (consoleOutput = ''),
      () => consoleOutput.length
    );

    const gen = runner.runGenerator();
    let result = await gen.next();
    while (!result.done && result.value?.type !== 'HALTED' && result.value?.type !== 'ERROR') {
      result = await gen.next();
    }

    // 10 + 20 + 30 + 40 = 100
    expect(cpu.getRegister('eax')).toBe(100);
    expect(cpu.getRegister('ecx')).toBe(0);
  });

  it('executes stack operations and preserves registers', async () => {
    const code = `
.code
main PROC
    mov eax, 1234h
    mov ebx, 5678h
    push eax
    push ebx
    pop eax
    pop ebx
    exit
main ENDP
END main
`;
    const tokens = new Lexer(code).tokenize();
    const parsed = new Parser(tokens).assemble();
    expect(parsed.errors.length).toBe(0);

    const cpu = new CPU();
    const memory = new MemoryManager();
    const history = new HistoryManager();
    let consoleOutput = '';

    const runner = new ProgramRunner(
      parsed.instructions,
      parsed.symbols,
      cpu,
      memory,
      history,
      (text) => (consoleOutput += text),
      () => (consoleOutput = ''),
      () => consoleOutput.length
    );

    const gen = runner.runGenerator();
    let result = await gen.next();
    while (!result.done && result.value?.type !== 'HALTED' && result.value?.type !== 'ERROR') {
      result = await gen.next();
    }

    // Values were swapped via stack
    expect(cpu.getRegister('eax')).toBe(0x5678);
    expect(cpu.getRegister('ebx')).toBe(0x1234);
  });

  it('calls Irvine32 WriteString and Crlf successfully', async () => {
    const code = `
INCLUDE Irvine32.inc
.data
msg BYTE "Buraydah Private Colleges", 0
.code
main PROC
    mov edx, OFFSET msg
    call WriteString
    call Crlf
    exit
main ENDP
END main
`;
    const tokens = new Lexer(code).tokenize();
    const parsed = new Parser(tokens).assemble();
    expect(parsed.errors.length).toBe(0);

    const cpu = new CPU();
    const memory = new MemoryManager();
    memory.loadInitialData(parsed.initialData);
    const history = new HistoryManager();
    let consoleOutput = '';

    const runner = new ProgramRunner(
      parsed.instructions,
      parsed.symbols,
      cpu,
      memory,
      history,
      (text) => (consoleOutput += text),
      () => (consoleOutput = ''),
      () => consoleOutput.length
    );

    const gen = runner.runGenerator();
    let result = await gen.next();
    while (!result.done && result.value?.type !== 'HALTED' && result.value?.type !== 'ERROR') {
      result = await gen.next();
    }

    expect(consoleOutput).toBe("Buraydah Private Colleges\n");
  });

  it('executes Chapter 4 Little-Endian example with ah and BYTE PTR [val1 + 3]', async () => {
    const code = `
INCLUDE Irvine32.inc

.data
    val1 DWORD 12345678h

.code
main PROC
    ; Read the lowest byte (78h)
    mov al, BYTE PTR val1

    ; Read the highest byte (12h)
    mov ah, BYTE PTR [val1 + 3]

    call DumpRegs
    exit
main ENDP
END main
`;
    const tokens = new Lexer(code).tokenize();
    const parsed = new Parser(tokens).assemble();
    expect(parsed.errors.length).toBe(0);

    const cpu = new CPU();
    const memory = new MemoryManager();
    memory.loadInitialData(parsed.initialData);
    const history = new HistoryManager();
    let consoleOutput = '';

    const runner = new ProgramRunner(
      parsed.instructions,
      parsed.symbols,
      cpu,
      memory,
      history,
      (text) => (consoleOutput += text),
      () => (consoleOutput = ''),
      () => consoleOutput.length
    );

    const gen = runner.runGenerator();
    let result = await gen.next();
    while (!result.done && result.value?.type !== 'HALTED' && result.value?.type !== 'ERROR') {
      result = await gen.next();
    }

    expect(cpu.getRegister('al')).toBe(0x78);
    expect(cpu.getRegister('ah')).toBe(0x12);
    expect(cpu.getRegister('ax')).toBe(0x1278);
  });
});
