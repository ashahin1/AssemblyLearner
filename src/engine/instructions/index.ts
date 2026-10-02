// COE224: Assembly Language Studio - Central Instruction Dispatcher

import { CPU } from '../cpu';
import { MemoryManager } from '../memory';
import { ParsedInstruction, SymbolEntry, FlagDiagnostic } from '../types';
import { DataTransferInstructions } from './dataTransfer';
import { ArithmeticInstructions } from './arithmetic';
import { StackInstructions } from './stack';
import { ControlInstructions } from './control';
import { LoopInstructions } from './loops';
import { LogicInstructions } from './logic';
import { ShiftInstructions } from './shift';
import { RotateInstructions } from './rotate';
import { MultiplyDivideInstructions } from './multiply';

export interface InstructionExecutionResult {
  nextEip?: number;
  flagDiagnostics: FlagDiagnostic[];
  isHalt?: boolean;
}

export class InstructionDispatcher {
  static execute(
    instr: ParsedInstruction,
    currentIndex: number,
    symbols: Map<string, SymbolEntry>,
    cpu: CPU,
    memory: MemoryManager
  ): InstructionExecutionResult {
    const m = instr.mnemonic.toLowerCase();
    const ops = instr.operands;
    let diagnostics: FlagDiagnostic[] = [];

    // Data Transfer (Ch 4)
    if (m === 'mov') {
      DataTransferInstructions.mov(ops[0], ops[1], cpu, memory);
      return { flagDiagnostics: [] };
    }
    if (m === 'movzx') {
      DataTransferInstructions.movzx(ops[0], ops[1], cpu, memory);
      return { flagDiagnostics: [] };
    }
    if (m === 'movsx') {
      DataTransferInstructions.movsx(ops[0], ops[1], cpu, memory);
      return { flagDiagnostics: [] };
    }
    if (m === 'xchg') {
      DataTransferInstructions.xchg(ops[0], ops[1], cpu, memory);
      return { flagDiagnostics: [] };
    }
    if (m === 'lea') {
      DataTransferInstructions.lea(ops[0], ops[1], cpu, memory);
      return { flagDiagnostics: [] };
    }

    // Arithmetic (Ch 4)
    if (m === 'add') {
      diagnostics = ArithmeticInstructions.add(ops[0], ops[1], cpu, memory);
      return { flagDiagnostics: diagnostics };
    }
    if (m === 'sub') {
      diagnostics = ArithmeticInstructions.sub(ops[0], ops[1], cpu, memory);
      return { flagDiagnostics: diagnostics };
    }
    if (m === 'cmp') {
      diagnostics = ArithmeticInstructions.cmp(ops[0], ops[1], cpu, memory);
      return { flagDiagnostics: diagnostics };
    }
    if (m === 'inc') {
      diagnostics = ArithmeticInstructions.inc(ops[0], cpu, memory);
      return { flagDiagnostics: diagnostics };
    }
    if (m === 'dec') {
      diagnostics = ArithmeticInstructions.dec(ops[0], cpu, memory);
      return { flagDiagnostics: diagnostics };
    }
    if (m === 'neg') {
      diagnostics = ArithmeticInstructions.neg(ops[0], cpu, memory);
      return { flagDiagnostics: diagnostics };
    }

    // Stack (Ch 5)
    if (m === 'push') {
      StackInstructions.push(ops[0], cpu, memory);
      return { flagDiagnostics: [] };
    }
    if (m === 'pop') {
      StackInstructions.pop(ops[0], cpu, memory);
      return { flagDiagnostics: [] };
    }
    if (m === 'pushad') {
      StackInstructions.pushad(cpu, memory);
      return { flagDiagnostics: [] };
    }
    if (m === 'popad') {
      StackInstructions.popad(cpu, memory);
      return { flagDiagnostics: [] };
    }
    if (m === 'pushfd') {
      StackInstructions.pushfd(cpu, memory);
      return { flagDiagnostics: [] };
    }
    if (m === 'popfd') {
      StackInstructions.popfd(cpu, memory);
      return { flagDiagnostics: [] };
    }

    // Control Flow: JMP, Jcc, CALL, RET (Ch 6)
    if (m.startsWith('j')) {
      const takeJump = ControlInstructions.shouldJump(m, cpu);
      if (takeJump) {
        const targetLabel = ops[0].symbolRef?.toLowerCase();
        if (!targetLabel) throw new Error(`${m.toUpperCase()} target label is missing`);
        const sym = symbols.get(targetLabel);
        if (!sym) throw new Error(`Undefined target label '${ops[0].symbolRef}'`);
        return { nextEip: sym.address, flagDiagnostics: [] };
      }
      return { flagDiagnostics: [] };
    }

    if (m === 'call') {
      const targetAddr = ControlInstructions.call(ops[0], currentIndex, symbols, cpu, memory);
      return { nextEip: targetAddr, flagDiagnostics: [] };
    }

    if (m === 'ret') {
      const returnAddr = ControlInstructions.ret(cpu, memory);
      return { nextEip: returnAddr, flagDiagnostics: [] };
    }

    // Loops (Ch 6)
    if (m.startsWith('loop')) {
      const takeLoop = LoopInstructions.executeLoop(m, cpu);
      if (takeLoop) {
        const targetLabel = ops[0].symbolRef?.toLowerCase();
        const sym = symbols.get(targetLabel!);
        if (!sym) throw new Error(`Undefined target label '${ops[0].symbolRef}' in ${m.toUpperCase()}`);
        return { nextEip: sym.address, flagDiagnostics: [] };
      }
      return { flagDiagnostics: [] };
    }

    // Logic (Ch 7)
    if (m === 'and') return { flagDiagnostics: LogicInstructions.and(ops[0], ops[1], cpu, memory) };
    if (m === 'or') return { flagDiagnostics: LogicInstructions.or(ops[0], ops[1], cpu, memory) };
    if (m === 'xor') return { flagDiagnostics: LogicInstructions.xor(ops[0], ops[1], cpu, memory) };
    if (m === 'test') return { flagDiagnostics: LogicInstructions.test(ops[0], ops[1], cpu, memory) };
    if (m === 'not') return { flagDiagnostics: LogicInstructions.not(ops[0], cpu, memory) };

    // Shifts & Rotates (Ch 7)
    if (m === 'shl') return { flagDiagnostics: ShiftInstructions.shl(ops[0], ops[1], cpu, memory) };
    if (m === 'sal') return { flagDiagnostics: ShiftInstructions.sal(ops[0], ops[1], cpu, memory) };
    if (m === 'shr') return { flagDiagnostics: ShiftInstructions.shr(ops[0], ops[1], cpu, memory) };
    if (m === 'sar') return { flagDiagnostics: ShiftInstructions.sar(ops[0], ops[1], cpu, memory) };
    if (m === 'rol') return { flagDiagnostics: RotateInstructions.rol(ops[0], ops[1], cpu, memory) };
    if (m === 'ror') return { flagDiagnostics: RotateInstructions.ror(ops[0], ops[1], cpu, memory) };
    if (m === 'rcl') return { flagDiagnostics: RotateInstructions.rcl(ops[0], ops[1], cpu, memory) };
    if (m === 'rcr') return { flagDiagnostics: RotateInstructions.rcr(ops[0], ops[1], cpu, memory) };

    // Multiply & Divide (Ch 7)
    if (m === 'mul') return { flagDiagnostics: MultiplyDivideInstructions.mul(ops[0], cpu, memory) };
    if (m === 'imul') return { flagDiagnostics: MultiplyDivideInstructions.imul(ops, cpu, memory) };
    if (m === 'div') {
      MultiplyDivideInstructions.div(ops[0], cpu, memory);
      return { flagDiagnostics: [] };
    }
    if (m === 'idiv') {
      MultiplyDivideInstructions.idiv(ops[0], cpu, memory);
      return { flagDiagnostics: [] };
    }
    if (m === 'cbw') {
      MultiplyDivideInstructions.cbw(cpu);
      return { flagDiagnostics: [] };
    }
    if (m === 'cwd') {
      MultiplyDivideInstructions.cwd(cpu);
      return { flagDiagnostics: [] };
    }
    if (m === 'cdq') {
      MultiplyDivideInstructions.cdq(cpu);
      return { flagDiagnostics: [] };
    }

    // Exit
    if (m === 'exit' || m === 'invoke_exit') {
      return { isHalt: true, flagDiagnostics: [] };
    }

    throw new Error(`Unimplemented instruction '${instr.mnemonic}'`);
  }
}
