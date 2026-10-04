// Integration test: Real-time debug execution line tracking and step synchronization

import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/engine/lexer';
import { Parser } from '../../src/engine/parser';
import { CPU } from '../../src/engine/cpu';
import { MemoryManager } from '../../src/engine/memory';
import { HistoryManager } from '../../src/engine/history';
import { ProgramRunner } from '../../src/engine/runner';

describe('Debug Execution Line Synchronization', () => {
  it('advances currentExecutionLine instruction by instruction and supports undo', async () => {
    const code = `INCLUDE Irvine32.inc

.data
    val DWORD 10

.code
main PROC
    mov eax, 1
    add eax, 2
    mov ebx, 3
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

    const runner = new ProgramRunner(
      parsed.instructions,
      parsed.symbols,
      cpu,
      memory,
      history,
      () => {},
      () => {},
      () => 0
    );

    // Initial instruction line should be line 8 (mov eax, 1)
    expect(parsed.instructions[0].sourceLine).toBe(8);
    expect(parsed.instructions[1].sourceLine).toBe(9);
    expect(parsed.instructions[2].sourceLine).toBe(10);
    expect(parsed.instructions[3].sourceLine).toBe(11);

    const gen = runner.runGenerator();

    // Step 1: executes line 8 (mov eax, 1), next is line 9 (add eax, 2)
    const step1 = await gen.next();
    expect(step1.value?.type).toBe('STEP_COMPLETE');
    if (step1.value?.type === 'STEP_COMPLETE') {
      expect(step1.value.line).toBe(9);
    }
    expect(cpu.getRegister('eax')).toBe(1);

    // Step 2: executes line 9 (add eax, 2), next is line 10 (mov ebx, 3)
    const step2 = await gen.next();
    expect(step2.value?.type).toBe('STEP_COMPLETE');
    if (step2.value?.type === 'STEP_COMPLETE') {
      expect(step2.value.line).toBe(10);
    }
    expect(cpu.getRegister('eax')).toBe(3);

    // Step backward (Undo step 2): restores CPU state before add eax, 2
    const popped = history.popSnapshot(cpu, memory);
    expect(popped).not.toBeNull();
    expect(popped?.sourceLine).toBe(9); // line 9 is pending execution again
    expect(cpu.getRegister('eax')).toBe(1);

    // Step backward (Undo step 1): restores CPU state before mov eax, 1
    const popped1 = history.popSnapshot(cpu, memory);
    expect(popped1).not.toBeNull();
    expect(popped1?.sourceLine).toBe(8); // line 8 is pending execution again
    expect(cpu.getRegister('eax')).toBe(0);
  });

  it('correctly updates execution line through loops', async () => {
    const code = `.code
main PROC
    mov ecx, 2
L1:
    inc eax
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
    const history = new HistoryManager();

    const runner = new ProgramRunner(
      parsed.instructions,
      parsed.symbols,
      cpu,
      memory,
      history,
      () => {},
      () => {},
      () => 0
    );

    const gen = runner.runGenerator();

    // Step 1: mov ecx, 2 -> next is L1: inc eax (line 5)
    const s1 = await gen.next();
    expect(s1.value?.type).toBe('STEP_COMPLETE');
    if (s1.value?.type === 'STEP_COMPLETE') expect(s1.value.line).toBe(5);

    // Step 2: inc eax (1st iteration) -> next is loop L1 (line 6)
    const s2 = await gen.next();
    expect(s2.value?.type).toBe('STEP_COMPLETE');
    if (s2.value?.type === 'STEP_COMPLETE') expect(s2.value.line).toBe(6);

    // Step 3: loop L1 (branches back) -> next is inc eax (line 5)
    const s3 = await gen.next();
    expect(s3.value?.type).toBe('STEP_COMPLETE');
    if (s3.value?.type === 'STEP_COMPLETE') expect(s3.value.line).toBe(5);

    // Step 4: inc eax (2nd iteration) -> next is loop L1 (line 6)
    const s4 = await gen.next();
    expect(s4.value?.type).toBe('STEP_COMPLETE');
    if (s4.value?.type === 'STEP_COMPLETE') expect(s4.value.line).toBe(6);

    // Step 5: loop L1 (ecx becomes 0, falls through) -> next is exit (line 7)
    const s5 = await gen.next();
    expect(s5.value?.type).toBe('STEP_COMPLETE');
    if (s5.value?.type === 'STEP_COMPLETE') expect(s5.value.line).toBe(7);

    // Step 6: exit -> HALTED
    const s6 = await gen.next();
    expect(s6.value?.type).toBe('HALTED');
  });
});
