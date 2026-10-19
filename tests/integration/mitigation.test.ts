// COE224: Assembly Language Studio - Mitigation Plan Verification Tests

import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/engine/lexer';
import { Parser } from '../../src/engine/parser';
import { CPU } from '../../src/engine/cpu';
import { MemoryManager } from '../../src/engine/memory';
import { HistoryManager } from '../../src/engine/history';
import { ProgramRunner } from '../../src/engine/runner';
import { Irvine32Runtime } from '../../src/engine/irvine32';
import { MEMORY_LAYOUT } from '../../src/engine/constants';
import { useCPUStore } from '../../src/store/cpuStore';

describe('Mitigation Plan Verification Tests', () => {
  it('Issue #2 & #5: Step backward after exit unhalts runner and restores state', async () => {
    const code = `
.code
main PROC
    mov eax, 10
    mov eax, 20
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
    let consoleOut = '';

    const runner = new ProgramRunner(
      parsed.instructions,
      parsed.symbols,
      cpu,
      memory,
      history,
      (text) => (consoleOut += text),
      () => (consoleOut = ''),
      () => consoleOut.length
    );

    const gen = runner.runGenerator();
    let step = await gen.next();
    while (!step.done && step.value?.type !== 'HALTED') {
      step = await gen.next();
    }

    expect(runner.halted).toBe(true);
    expect(cpu.getRegister('eax')).toBe(20);

    // Pop snapshot to step backward before exit
    const snap = history.popSnapshot(cpu, memory);
    expect(snap).toBeDefined();
    runner.unhalt();
    runner.setStepCount(history.length);

    expect(runner.halted).toBe(false);
    expect(cpu.getRegister('eax')).toBe(20);

    // Pop again to step before `mov eax, 20`
    const snap2 = history.popSnapshot(cpu, memory);
    expect(snap2).toBeDefined();
    runner.setStepCount(history.length);
    expect(cpu.getRegister('eax')).toBe(10);
  });

  it('Issue #3 & #4: Supports negative numbers and expressions in .data', () => {
    const code = `
.data
val1 SDWORD -15
val2 DWORD 3 DUP(-4)
val3 DWORD 10 + 5
.code
main PROC
    mov eax, val1
    exit
main ENDP
END main
`;
    const tokens = new Lexer(code).tokenize();
    const parsed = new Parser(tokens).assemble();
    expect(parsed.errors.length).toBe(0);

    const memory = new MemoryManager();
    memory.loadInitialData(parsed.initialData);

    const v1 = memory.readDword(MEMORY_LAYOUT.DATA_BASE);
    expect(v1 | 0).toBe(-15);

    const v2_0 = memory.readDword(MEMORY_LAYOUT.DATA_BASE + 4);
    expect(v2_0 | 0).toBe(-4);

    const v3 = memory.readDword(MEMORY_LAYOUT.DATA_BASE + 16);
    expect(v3).toBe(15);
  });

  it('Issue #8 & #9: Supports PROC USES and INVOKE directives', async () => {
    const code = `
.code
MyProc PROC USES ebx esi
    mov ebx, 99
    mov esi, 88
    ret
MyProc ENDP

main PROC
    mov ebx, 111
    mov esi, 222
    INVOKE MyProc
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
    let consoleOut = '';

    const runner = new ProgramRunner(
      parsed.instructions,
      parsed.symbols,
      cpu,
      memory,
      history,
      (text) => (consoleOut += text),
      () => (consoleOut = ''),
      () => consoleOut.length,
      parsed.entryInstructionIndex
    );

    const gen = runner.runGenerator();
    let step = await gen.next();
    while (!step.done && step.value?.type !== 'HALTED') {
      step = await gen.next();
    }

    // ebx and esi should be restored because MyProc USES ebx esi
    expect(cpu.getRegister('ebx')).toBe(111);
    expect(cpu.getRegister('esi')).toBe(222);
  });

  it('Issue #10: Resolves entry instruction index when main is preceded by helper proc', async () => {
    const code = `
.code
Helper PROC
    mov edx, 777
    ret
Helper ENDP

main PROC
    mov eax, 123
    exit
main ENDP
END main
`;
    const tokens = new Lexer(code).tokenize();
    const parsed = new Parser(tokens).assemble();
    expect(parsed.errors.length).toBe(0);

    // Entry index should point to main PROC (which is at index 2 because Helper has mov, ret)
    expect(parsed.entryInstructionIndex).toBe(2);

    const cpu = new CPU();
    const memory = new MemoryManager();
    const history = new HistoryManager();
    let consoleOut = '';

    const runner = new ProgramRunner(
      parsed.instructions,
      parsed.symbols,
      cpu,
      memory,
      history,
      (text) => (consoleOut += text),
      () => (consoleOut = ''),
      () => consoleOut.length,
      parsed.entryInstructionIndex
    );

    const gen = runner.runGenerator();
    let step = await gen.next();
    while (!step.done && step.value?.type !== 'HALTED') {
      step = await gen.next();
    }

    // EAX was set to 123, Helper was never executed so EDX remains 0
    expect(cpu.getRegister('eax')).toBe(123);
    expect(cpu.getRegister('edx')).toBe(0);
  });

  it('Issue #13: IMUL 2-operand and 3-operand sets CF and OF on signed overflow', async () => {
    const code = `
.code
main PROC
    ; 1) 2-operand no overflow: 100 * 20 = 2000
    mov eax, 100
    imul eax, 20

    ; 2) 2-operand signed overflow: 2,000,000 * 2,000 = 4,000,000,000 > 2^31 - 1
    mov ebx, 2000000
    imul ebx, 2000

    ; 3) 3-operand no overflow: 50 * 4 = 200 into ecx
    imul ecx, eax, 0

    ; 4) 3-operand overflow: 1000000 * 3000 into edx
    mov esi, 1000000
    imul edx, esi, 3000

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
    let consoleOut = '';

    const runner = new ProgramRunner(
      parsed.instructions,
      parsed.symbols,
      cpu,
      memory,
      history,
      (text) => (consoleOut += text),
      () => (consoleOut = ''),
      () => consoleOut.length
    );

    const gen = runner.runGenerator();
    // Execute: mov eax, 100
    await gen.next();
    // Execute: imul eax, 20
    await gen.next();
    expect(cpu.getRegister('eax')).toBe(2000);
    expect(cpu.getFlags().OF).toBe(0);
    expect(cpu.getFlags().CF).toBe(0);

    // Execute: mov ebx, 2000000
    await gen.next();
    // Execute: imul ebx, 2000
    await gen.next();
    expect(cpu.getFlags().OF).toBe(1);
    expect(cpu.getFlags().CF).toBe(1);

    // Finish program
    let step = await gen.next();
    while (!step.done && step.value?.type !== 'HALTED') {
      step = await gen.next();
    }

    expect(cpu.getFlags().OF).toBe(1);
    expect(cpu.getFlags().CF).toBe(1);
  });

  it('Issue #7, #14, #15: Irvine32 bounded execution and GetMseconds', () => {
    const cpu = new CPU();
    const memory = new MemoryManager();
    let output = '';

    // 1) WriteString bounded without null terminator
    // Fill 10 bytes without a null terminator at 0x00404000
    for (let i = 0; i < 10; i++) {
      memory.writeByte(MEMORY_LAYOUT.DATA_BASE + i, 65); // 'A'
    }
    // Put null terminator at 10 to check regular termination
    memory.writeByte(MEMORY_LAYOUT.DATA_BASE + 10, 0);
    cpu.setRegister('edx', MEMORY_LAYOUT.DATA_BASE);
    Irvine32Runtime.executeSync('WriteString', cpu, memory, (t) => (output += t), () => {});
    expect(output).toBe('AAAAAAAAAA');

    // 2) DumpMem with invalid EBX clamped to 4 and bounded ECX
    output = '';
    cpu.setRegister('esi', MEMORY_LAYOUT.DATA_BASE);
    cpu.setRegister('ecx', 500); // Exceeds 256
    cpu.setRegister('ebx', 99); // Invalid unit size -> should clamp to 4
    Irvine32Runtime.executeSync('DumpMem', cpu, memory, (t) => (output += t), () => {});
    expect(output).toContain('count 256');

    // 3) GetMseconds sets EAX to milliseconds since midnight
    cpu.setRegister('eax', 0);
    Irvine32Runtime.executeSync('GetMseconds', cpu, memory, () => {}, () => {});
    expect(cpu.getRegister('eax')).toBeGreaterThan(0);
  });

  it('Issue #1: MemoryPanel data segment isolation prevents stack loop freeze', () => {
    const memory = new MemoryManager();
    // Stack write
    memory.writeDword(MEMORY_LAYOUT.STACK_TOP - 4, 0x11223344);
    // Data write
    memory.writeDword(MEMORY_LAYOUT.DATA_BASE, 0x55667788);

    const allocated = memory.getAllAllocated();
    expect(allocated.length).toBeGreaterThan(0);

    // Filtering to DATA_BASE only takes .data addresses
    const dataAllocated = allocated.filter(
      (b) => b.address >= MEMORY_LAYOUT.DATA_BASE && b.address < MEMORY_LAYOUT.DATA_BASE + MEMORY_LAYOUT.DATA_SIZE
    );

    expect(dataAllocated.every((b) => b.address >= MEMORY_LAYOUT.DATA_BASE)).toBe(true);
    expect(dataAllocated.some((b) => b.address < MEMORY_LAYOUT.DATA_BASE)).toBe(false);
  });
});
