// COE224: Assembly Language Studio - Zustand CPU Store

import { create } from 'zustand';
import { CPU } from '../engine/cpu';
import { MemoryManager } from '../engine/memory';
import { HistoryManager } from '../engine/history';
import { ProgramRunner } from '../engine/runner';
import { Lexer } from '../engine/lexer';
import { Parser } from '../engine/parser';
import { CPUState, FlagDiagnostic, AssemblyError } from '../engine/types';

interface CPUStoreState {
  // Engine Instances
  cpu: CPU;
  memory: MemoryManager;
  history: HistoryManager;
  runner: ProgramRunner | null;
  generator: AsyncGenerator<any, void, string | undefined> | null;

  // Reactive State
  cpuState: CPUState;
  changedRegisters: Set<string>;
  flagDiagnostics: FlagDiagnostic[];
  consoleOutput: string;
  isWaitingForInput: boolean;
  inputPrompt: string;
  inputType: 'int' | 'dec' | 'hex' | 'char' | 'string';
  currentExecutionLine: number | null;
  currentStepIndex: number;
  totalStepsRecorded: number;
  isRunning: boolean;
  isHalted: boolean;
  assemblyErrors: AssemblyError[];
  isAssembled: boolean;
  breakpoints: Set<number>;

  // Actions
  assembleCode: (code: string) => boolean;
  runContinuous: (delayMs?: number) => Promise<void>;
  stepForward: () => Promise<void>;
  stepBackward: () => void;
  pause: () => void;
  reset: () => void;
  submitInput: (input: string) => Promise<void>;
  toggleBreakpoint: (line: number) => void;
  clearConsole: () => void;
}

export const useCPUStore = create<CPUStoreState>((set, get) => {
  const cpu = new CPU();
  const memory = new MemoryManager();
  const history = new HistoryManager();

  memory.setWriteCallback((address, oldValue) => {
    history.recordMemoryChange(address, oldValue);
  });

  return {
    cpu,
    memory,
    history,
    runner: null,
    generator: null,

    cpuState: cpu.getState(),
    changedRegisters: new Set(),
    flagDiagnostics: [],
    consoleOutput: '',
    isWaitingForInput: false,
    inputPrompt: '> ',
    inputType: 'int',
    currentExecutionLine: null,
    currentStepIndex: 0,
    totalStepsRecorded: 0,
    isRunning: false,
    isHalted: false,
    assemblyErrors: [],
    isAssembled: false,
    breakpoints: new Set(),

    assembleCode: (code: string) => {
      const { cpu, memory, history } = get();
      cpu.reset();
      memory.reset();
      history.reset();

      const tokens = new Lexer(code).tokenize();
      const parsed = new Parser(tokens).assemble();

      if (!parsed.success) {
        set({
          assemblyErrors: parsed.errors,
          isAssembled: false,
          currentExecutionLine: null,
          runner: null,
          generator: null,
        });
        return false;
      }

      memory.loadInitialData(parsed.initialData);

      const runner = new ProgramRunner(
        parsed.instructions,
        parsed.symbols,
        cpu,
        memory,
        history,
        (text) => set((s) => ({ consoleOutput: s.consoleOutput + text })),
        () => set({ consoleOutput: '' }),
        () => get().consoleOutput.length
      );

      const generator = runner.runGenerator();

      set({
        runner,
        generator,
        assemblyErrors: [],
        isAssembled: true,
        cpuState: cpu.getState(),
        changedRegisters: new Set(),
        flagDiagnostics: [],
        consoleOutput: '',
        isWaitingForInput: false,
        isHalted: false,
        isRunning: false,
        currentStepIndex: 0,
        totalStepsRecorded: 0,
        currentExecutionLine: parsed.instructions[0]?.sourceLine ?? null,
      });

      return true;
    },

    stepForward: async () => {
      const { generator, cpu, history, breakpoints } = get();
      if (!generator) return;

      const oldRegs = { ...cpu.getRegisters() };
      const next = await generator.next();

      if (next.done || next.value?.type === 'HALTED') {
        set({
          isHalted: true,
          isRunning: false,
          currentExecutionLine: null,
          cpuState: cpu.getState(),
        });
        return;
      }

      if (next.value?.type === 'WAITING_FOR_INPUT') {
        set({
          isWaitingForInput: true,
          inputPrompt: next.value.prompt,
          inputType: next.value.inputType,
          isRunning: false,
        });
        return;
      }

      if (next.value?.type === 'ERROR') {
        set({
          assemblyErrors: [
            {
              line: next.value.line ?? 1,
              message: next.value.message,
              suggestion: next.value.suggestion,
            },
          ],
          isRunning: false,
          isHalted: true,
        });
        return;
      }

      if (next.value?.type === 'STEP_COMPLETE') {
        const newRegs = cpu.getRegisters();
        const changed = new Set<string>();
        for (const [key, val] of Object.entries(newRegs)) {
          if ((oldRegs as any)[key] !== val) {
            changed.add(key);
          }
        }

        set({
          currentExecutionLine: next.value.line,
          cpuState: cpu.getState(),
          changedRegisters: changed,
          flagDiagnostics: next.value.flagDiagnostics,
          currentStepIndex: history.length,
          totalStepsRecorded: history.length,
        });

        // Pause if hit breakpoint
        if (breakpoints.has(next.value.line)) {
          set({ isRunning: false });
        }
      }
    },

    stepBackward: () => {
      const { cpu, memory, history } = get();
      const prev = history.popSnapshot(cpu, memory);
      if (!prev) return;

      set({
        cpuState: cpu.getState(),
        currentExecutionLine: prev.sourceLine,
        consoleOutput: get().consoleOutput.slice(0, prev.consoleLength),
        currentStepIndex: history.length,
        changedRegisters: new Set(),
        flagDiagnostics: [],
        isHalted: false,
      });
    },

    runContinuous: async (delayMs = 200) => {
      set({ isRunning: true });
      const { stepForward } = get();

      while (get().isRunning && !get().isHalted && !get().isWaitingForInput) {
        await stepForward();
        if (delayMs > 0) {
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    },

    pause: () => {
      set({ isRunning: false });
    },

    reset: () => {
      const { cpu, memory, history } = get();
      cpu.reset();
      memory.reset();
      history.reset();
      set({
        cpuState: cpu.getState(),
        changedRegisters: new Set(),
        flagDiagnostics: [],
        consoleOutput: '',
        isWaitingForInput: false,
        isRunning: false,
        isHalted: false,
        currentExecutionLine: null,
        currentStepIndex: 0,
        totalStepsRecorded: 0,
      });
    },

    submitInput: async (input: string) => {
      const { generator } = get();
      if (!generator) return;

      set({
        isWaitingForInput: false,
        consoleOutput: get().consoleOutput + input + '\n',
      });

      // Resume generator with input value
      await generator.next(input);
      set({ cpuState: get().cpu.getState() });
    },

    toggleBreakpoint: (line: number) => {
      const b = new Set(get().breakpoints);
      if (b.has(line)) b.delete(line);
      else b.add(line);
      set({ breakpoints: b });
    },

    clearConsole: () => {
      set({ consoleOutput: '' });
    },
  };
});
