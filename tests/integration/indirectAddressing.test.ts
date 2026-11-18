// COE224: Assembly Language Studio - Indirect/Indexed Addressing & Operand Size Inference Tests

import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/engine/lexer';
import { Parser } from '../../src/engine/parser';
import { CPU } from '../../src/engine/cpu';
import { MemoryManager } from '../../src/engine/memory';
import { HistoryManager } from '../../src/engine/history';
import { ProgramRunner } from '../../src/engine/runner';
import { MEMORY_LAYOUT } from '../../src/engine/constants';
import { CODE_EXAMPLES } from '../../src/examples';

async function assembleAndRun(code: string) {
  const tokens = new Lexer(code).tokenize();
  const parsed = new Parser(tokens).assemble();

  const cpu = new CPU();
  const memory = new MemoryManager();
  memory.loadInitialData(parsed.initialData);
  const history = new HistoryManager();
  let consoleOut = '';

  if (!parsed.success) {
    return { parsed, cpu, memory, consoleOut, runtimeError: null as string | null };
  }

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

  let runtimeError: string | null = null;
  const gen = runner.runGenerator();
  let step = await gen.next();
  while (!step.done && step.value?.type !== 'HALTED') {
    if (step.value?.type === 'ERROR') {
      runtimeError = step.value.message;
      break;
    }
    step = await gen.next();
  }

  return { parsed, cpu, memory, consoleOut, runtimeError };
}

function assembleOnly(code: string) {
  const tokens = new Lexer(code).tokenize();
  return new Parser(tokens).assemble();
}

describe('Indirect & Indexed Addressing and Operand Size Inference', () => {
  it('supports indirect WORD access by inferring size from destination register (mov ax, [esi])', async () => {
    const code = `
.data
    var1 WORD 1234h, 5678h
.code
main PROC
    mov esi, OFFSET var1
    mov ax, [esi]
    mov bx, [esi + 2]
    exit
main ENDP
END main
`;
    const { parsed, cpu, runtimeError } = await assembleAndRun(code);
    expect(parsed.errors).toEqual([]);
    expect(runtimeError).toBeNull();
    expect(cpu.getRegister('ax')).toBe(0x1234);
    expect(cpu.getRegister('bx')).toBe(0x5678);
  });

  it('infers 8-bit, 16-bit, and 32-bit operand sizes for reads, writes, and ALU ops without clobbering adjacent bytes', async () => {
    const code = `
.data
    buf BYTE 11h, 22h, 33h, 44h, 55h, 66h, 77h, 88h
.code
main PROC
    mov esi, OFFSET buf

    ; 16-bit read, write, xchg, and bitwise ops
    mov bx, [esi + 4]      ; BX = 6655h (little-endian)
    mov cx, 0BEEFh
    xchg cx, [esi + 6]     ; buf[6..7] = BEEFh, CX = 8877h

    mov ax, [esi + 4]      ; 6655h
    xor ax, [esi + 6]      ; 6655h XOR BEEFh = D8BAh

    ; 8-bit read, write, add, and cmp (keep DL and ZF intact at exit)
    mov dl, [esi]          ; DL = 11h
    mov dh, 0AAh
    mov [esi + 1], dh      ; buf[1] becomes AAh, neighbors untouched
    add [esi + 2], dl      ; buf[2] = 33h + 11h = 44h
    cmp dl, [esi]          ; sets ZF=1
    exit
main ENDP
END main
`;
    const { parsed, cpu, memory, runtimeError } = await assembleAndRun(code);
    expect(parsed.errors).toEqual([]);
    expect(runtimeError).toBeNull();

    expect(cpu.getRegister('dl')).toBe(0x11);
    expect(cpu.getFlags().ZF).toBe(1);
    expect(cpu.getRegister('bx')).toBe(0x6655);
    expect(cpu.getRegister('cx')).toBe(0x8877);
    expect(cpu.getRegister('ax')).toBe(0xd8ba);

    // Memory byte checks (verify 1-byte and 2-byte writes did not clobber neighbors)
    const base = MEMORY_LAYOUT.DATA_BASE;
    expect(memory.readByte(base + 0)).toBe(0x11);
    expect(memory.readByte(base + 1)).toBe(0xaa);
    expect(memory.readByte(base + 2)).toBe(0x44);
    expect(memory.readByte(base + 3)).toBe(0x44);
    expect(memory.readWord(base + 4)).toBe(0x6655);
    expect(memory.readWord(base + 6)).toBe(0xbeef);
  });

  it('infers 16-bit size in 2-operand and 3-operand IMUL with untyped memory', async () => {
    const code = `
.data
    w1 WORD 10
    w2 WORD -3
.code
main PROC
    mov esi, OFFSET w1
    mov ax, 5
    imul ax, [esi]         ; AX = 50
    imul bx, [esi + 2], 4  ; BX = -12 (0FFF4h)
    exit
main ENDP
END main
`;
    const { parsed, cpu, runtimeError } = await assembleAndRun(code);
    expect(parsed.errors).toEqual([]);
    expect(runtimeError).toBeNull();
    expect(cpu.getRegister('ax')).toBe(50);
    expect(cpu.getRegister('bx')).toBe(0xfff4);
  });

  it('supports scaled-index addressing ([esi * 4], arrayD[esi * TYPE arrayD], [esi * 4 + ebx], table[ebx][esi * TYPE table])', async () => {
    const code = `
.data
    arrayD DWORD 100, 200, 300, 400
    table  WORD  10h, 20h, 30h, 40h, 50h, 60h
.code
main PROC
    mov esi, 2
    mov ebx, OFFSET arrayD

    ; Base + scaled index (scale on first reg)
    mov eax, [esi * 4 + ebx]          ; 300

    ; Variable + scaled index with constant or TYPE
    mov ecx, arrayD[esi * 4]          ; 300
    mov edx, arrayD[esi * TYPE arrayD] ; 300

    ; 2D table[ebx][esi * TYPE table] -> row 1 (offset 6 bytes for 3 WORDs), col 1 (offset 1*2 = 2) => index 4 => 50h
    mov ebx, 6
    mov esi, 1
    mov di, table[ebx][esi * TYPE table]

    ; Single-register scaled index [esi * 4] pointing to arrayD[1] (DATA_BASE + 4)
    mov esi, 101001h                  ; 101001h * 4 = 00404004h = DATA_BASE + 4
    mov ebx, [esi * 4]                ; 200

    exit
main ENDP
END main
`;
    const { parsed, cpu, runtimeError } = await assembleAndRun(code);
    expect(parsed.errors).toEqual([]);
    expect(runtimeError).toBeNull();
    expect(cpu.getRegister('eax')).toBe(300);
    expect(cpu.getRegister('ecx')).toBe(300);
    expect(cpu.getRegister('edx')).toBe(300);
    expect(cpu.getRegister('di')).toBe(0x50);
    expect(cpu.getRegister('ebx')).toBe(200);
  });

  it('evaluates constant expressions, MASM operators, bracket forms, and negative displacements in memory operands', async () => {
    const code = `
MY_CONST EQU 42
.data
    arrayD DWORD 111, 222, 333
    arrayB BYTE 10h, 20h, 30h, 40h
.code
main PROC
    mov eax, [arrayD + TYPE arrayD]   ; 222 (TYPE arrayD = 4)
    mov esi, OFFSET arrayD
    mov ebx, [esi + 2 * 4]            ; 333 (2*4 displacement, not scale!)
    mov cl, arrayB - 1 + 2            ; arrayB[1] = 20h
    mov edx, 4[esi]                   ; arrayD[1] = 222
    mov ebp, OFFSET arrayB + 3
    mov ch, [ebp - 1]                 ; arrayB[2] = 30h
    mov edi, MY_CONST                 ; 42 constant operand
    exit
main ENDP
END main
`;
    const { parsed, cpu, runtimeError } = await assembleAndRun(code);
    expect(parsed.errors).toEqual([]);
    expect(runtimeError).toBeNull();
    expect(cpu.getRegister('eax')).toBe(222);
    expect(cpu.getRegister('ebx')).toBe(333);
    expect(cpu.getRegister('cl')).toBe(0x20);
    expect(cpu.getRegister('edx')).toBe(222);
    expect(cpu.getRegister('ch')).toBe(0x30);
    expect(cpu.getRegister('edi')).toBe(42);
  });

  it('handles MOVZX and MOVSX with inferred 16<-8, explicit PTR/SBYTE/SWORD, and bracketed PTR', async () => {
    const code = `
.data
    bVal SBYTE -128    ; 80h
    wVal SWORD -2      ; FFFEh
.code
main PROC
    mov esi, OFFSET bVal
    movzx ax, [esi]              ; infers BYTE -> 0080h
    movsx bx, [esi]              ; infers BYTE -> FF80h
    movsx ecx, SBYTE PTR [esi]   ; explicit SBYTE PTR -> FFFFFF80h
    movzx edx, [BYTE PTR esi]    ; PTR inside brackets -> 00000080h

    mov edi, OFFSET wVal
    movsx esi, SWORD PTR [edi]   ; FFFFFFFEh
    exit
main ENDP
END main
`;
    const { parsed, cpu, runtimeError } = await assembleAndRun(code);
    expect(parsed.errors).toEqual([]);
    expect(runtimeError).toBeNull();
    expect(cpu.getRegister('ax')).toBe(0x0080);
    expect(cpu.getRegister('bx')).toBe(0xff80);
    expect(cpu.getRegister('ecx')).toBe(0xffffff80);
    expect(cpu.getRegister('edx')).toBe(0x00000080);
    expect(cpu.getRegister('esi')).toBe(0xfffffffe);
  });

  it('supports LEA with BYTE, WORD, DWORD, and untyped indirect memory operands', async () => {
    const code = `
.data
    byteMsg BYTE "Hello", 0
    wordArr WORD 10h, 20h, 30h
.code
main PROC
    lea edx, byteMsg                 ; DATA_BASE
    mov ebx, 2
    lea esi, wordArr[ebx]            ; DATA_BASE + 6 + 2 = DATA_BASE + 8
    lea eax, [edx + ebx * 4 + 8]     ; DATA_BASE + 8 + 8 = DATA_BASE + 16
    exit
main ENDP
END main
`;
    const { parsed, cpu, runtimeError } = await assembleAndRun(code);
    expect(parsed.errors).toEqual([]);
    expect(runtimeError).toBeNull();
    expect(cpu.getRegister('edx')).toBe(MEMORY_LAYOUT.DATA_BASE);
    expect(cpu.getRegister('esi')).toBe(MEMORY_LAYOUT.DATA_BASE + 6 + 2);
    expect(cpu.getRegister('eax')).toBe(MEMORY_LAYOUT.DATA_BASE + 16);
  });

  it('rejects ambiguous untyped memory operands and invalid addressing syntax like MASM', () => {
    const ambiguousCases = [
      'inc [esi]',
      'dec [esi]',
      'neg [esi]',
      'not [esi]',
      'mov [esi], 10',
      'add [esi], 5',
      'and [esi], 0Fh',
      'test [esi], 1',
      'shl [esi], 1',
      'shl [esi], cl',
      'mul [esi]',
      'div [esi]',
      'idiv [esi]',
      'imul [esi]',
      'movzx eax, [esi]',
      'movsx eax, [esi]',
    ];

    for (const stmt of ambiguousCases) {
      const parsed = assembleOnly(`.code\nmain PROC\n${stmt}\nexit\nmain ENDP\nEND main`);
      expect(parsed.success, `Expected '${stmt}' to fail assembly due to missing size`).toBe(false);
    }

    // Explicit PTR resolves the ambiguity cleanly
    const validExplicit = assembleOnly(`
.code
main PROC
    inc BYTE PTR [esi]
    mov WORD PTR [esi], 10
    shl DWORD PTR [esi], cl
    movzx eax, BYTE PTR [esi]
    exit
main ENDP
END main
`);
    expect(validExplicit.errors).toEqual([]);

    // Mismatched sizes still fail
    const mismatch = assembleOnly(`
.data
    varD DWORD 100
.code
main PROC
    mov ax, varD
    exit
main ENDP
END main
`);
    expect(mismatch.success).toBe(false);
    expect(mismatch.errors[0].message).toContain('size mismatch');

    // Immediate in MUL/DIV/MOVZX fails
    for (const badImm of ['mul 5', 'div 2', 'idiv 3', 'movzx eax, 5', 'movsx eax, 5']) {
      const p = assembleOnly(`.code\nmain PROC\n${badImm}\nexit\nmain ENDP\nEND main`);
      expect(p.success, `Expected '${badImm}' to fail assembly`).toBe(false);
    }

    // Invalid bracket expressions fail
    const badBrackets = [
      'mov eax, []',
      'mov eax, [ebx - esi]',
      'mov eax, [esi * 3]',
      'mov eax, [eax + ebx + ecx]',
      'mov eax, [esi * 2 + ebx * 4]',
      'mov eax, QWORD PTR [esi]',
    ];
    for (const stmt of badBrackets) {
      const parsed = assembleOnly(`.code\nmain PROC\n${stmt}\nexit\nmain ENDP\nEND main`);
      expect(parsed.success, `Expected '${stmt}' to fail assembly`).toBe(false);
    }
  });

  it('assembles all non-bug curated CODE_EXAMPLES cleanly', () => {
    for (const example of CODE_EXAMPLES) {
      if (example.id === 'bug-ch4-mem-to-mem') continue;
      const parsed = assembleOnly(example.code);
      expect(parsed.errors, `Example '${example.id}' had unexpected assembly errors`).toEqual([]);
    }
  });
});
