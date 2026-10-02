// COE224: Assembly Language Studio - Async Generator Execution Runner

import { CPU } from './cpu';
import { MemoryManager } from './memory';
import { HistoryManager } from './history';
import { ParsedInstruction, SymbolEntry, ExecutionEvent } from './types';
import { InstructionDispatcher } from './instructions';
import { Irvine32Runtime } from './irvine32';
import { MAX_INSTRUCTIONS_PER_RUN } from './constants';

export class ProgramRunner {
  private instructions: ParsedInstruction[];
  private symbols: Map<string, SymbolEntry>;
  private cpu: CPU;
  private memory: MemoryManager;
  private history: HistoryManager;
  private printOutput: (text: string) => void;
  private clearConsole: () => void;
  private getConsoleLength: () => number;

  private isHalted: boolean = false;
  private totalSteps: number = 0;

  constructor(
    instructions: ParsedInstruction[],
    symbols: Map<string, SymbolEntry>,
    cpu: CPU,
    memory: MemoryManager,
    history: HistoryManager,
    printOutput: (text: string) => void,
    clearConsole: () => void,
    getConsoleLength: () => number
  ) {
    this.instructions = instructions;
    this.symbols = symbols;
    this.cpu = cpu;
    this.memory = memory;
    this.history = history;
    this.printOutput = printOutput;
    this.clearConsole = clearConsole;
    this.getConsoleLength = getConsoleLength;
  }

  get halted(): boolean {
    return this.isHalted;
  }

  get stepCount(): number {
    return this.totalSteps;
  }

  /**
   * Generator that steps through the program instruction by instruction.
   * Yields when waiting for input, stepping, halting, or on error.
   */
  async *runGenerator(): AsyncGenerator<ExecutionEvent, void, string | undefined> {
    while (!this.isHalted && this.cpu.getRegisters().eip < this.instructions.length) {
      if (this.totalSteps >= MAX_INSTRUCTIONS_PER_RUN) {
        yield {
          type: 'ERROR',
          message: `Execution paused: limit of ${MAX_INSTRUCTIONS_PER_RUN} instructions reached. Possible infinite loop.`,
          line: this.instructions[this.cpu.getRegisters().eip]?.sourceLine,
          suggestion: 'Check your loop termination condition (e.g. ECX register or Jcc jump).',
        };
        return;
      }

      const eip = this.cpu.getRegisters().eip;
      const instr = this.instructions[eip];
      if (!instr) break;

      // 1. Snapshot for Step-Backward BEFORE execution
      this.history.pushSnapshot(
        this.cpu,
        instr.sourceLine,
        instr.sourceText,
        this.getConsoleLength()
      );

      // 2. Check if instruction is a CALL to an Irvine32 procedure
      const mnemonic = instr.mnemonic.toLowerCase();
      if (mnemonic === 'call' && instr.operands[0]?.symbolRef) {
        const procName = instr.operands[0].symbolRef.toLowerCase();

        if (Irvine32Runtime.isInputProcedure(procName)) {
          // Yield to browser and wait for student input in console
          let prompt = '> ';
          let inputType: 'int' | 'dec' | 'hex' | 'char' | 'string' = 'int';
          if (procName === 'readdec') inputType = 'dec';
          else if (procName === 'readhex') inputType = 'hex';
          else if (procName === 'readchar') inputType = 'char';
          else if (procName === 'readstring') inputType = 'string';
          else if (procName === 'waitmsg') prompt = 'Press any key to continue...';

          const userInput: string | undefined = yield {
            type: 'WAITING_FOR_INPUT',
            prompt,
            inputType,
            maxChars: procName === 'readstring' ? this.cpu.getRegister('ecx') : undefined,
          };

          Irvine32Runtime.handleInputResult(procName, userInput ?? '', this.cpu, this.memory);
          this.cpu.setRegister('eip', eip + 1);
          this.totalSteps++;

          yield {
            type: 'STEP_COMPLETE',
            line: instr.sourceLine,
            flagDiagnostics: [],
          };
          continue;
        }

        if (Irvine32Runtime.isIrvineProcedure(procName)) {
          Irvine32Runtime.executeSync(procName, this.cpu, this.memory, this.printOutput, this.clearConsole);
          this.cpu.setRegister('eip', eip + 1);
          this.totalSteps++;

          yield {
            type: 'STEP_COMPLETE',
            line: instr.sourceLine,
            flagDiagnostics: [],
          };
          continue;
        }
      }

      // 3. Regular Instruction Dispatch
      try {
        const result = InstructionDispatcher.execute(
          instr,
          eip,
          this.symbols,
          this.cpu,
          this.memory
        );

        if (result.isHalt) {
          this.isHalted = true;
          yield { type: 'HALTED' };
          return;
        }

        if (result.nextEip !== undefined) {
          // Find instruction index corresponding to target address or label
          this.cpu.setRegister('eip', result.nextEip);
        } else {
          this.cpu.setRegister('eip', eip + 1);
        }

        this.totalSteps++;

        yield {
          type: 'STEP_COMPLETE',
          line: instr.sourceLine,
          flagDiagnostics: result.flagDiagnostics,
        };
      } catch (err: any) {
        yield {
          type: 'ERROR',
          message: err.message,
          line: instr.sourceLine,
        };
        return;
      }
    }

    this.isHalted = true;
    yield { type: 'HALTED' };
  }
}
