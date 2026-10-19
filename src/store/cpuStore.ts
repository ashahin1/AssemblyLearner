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
  assembledCode: string | null;
  isCodeDirty: boolean;
  breakpoints: Set<number>;
  wasRunningBeforeInput: boolean;

  // Actions
  assembleCode: (code: string) => boolean;
  checkCodeDirty: (currentCode: string) => void;
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
    assembledCode: null,
    isCodeDirty: false,
    breakpoints: new Set(),
    wasRunningBeforeInput: false,

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
          assembledCode: null,
          isCodeDirty: false,
          currentExecutionLine: null,
          runner: null,
          generator: null,
          wasRunningBeforeInput: false,
        });
        return false;
      }

      memory.loadInitialData(parsed.initialData);

      const entryIndex = (parsed as any).entryInstructionIndex ?? 0;
      if (entryIndex > 0) {
        cpu.setRegister('eip', entryIndex);
      }

      const runner = new ProgramRunner(
        parsed.instructions,
        parsed.symbols,
        cpu,
        memory,
        history,
        (text) => set((s) => ({ consoleOutput: s.consoleOutput + text })),
        () => set({ consoleOutput: '' }),
        () => get().consoleOutput,
        entryIndex
      );

      const generator = runner.runGenerator();

      set({
        runner,
        generator,
        assemblyErrors: [],
        isAssembled: true,
        assembledCode: code,
        isCodeDirty: false,
        cpuState: cpu.getState(),
        changedRegisters: new Set(),
        flagDiagnostics: [],
        consoleOutput: '',
        isWaitingForInput: false,
        isHalted: false,
        isRunning: false,
        wasRunningBeforeInput: false,
        currentStepIndex: 0,
        totalStepsRecorded: 0,
        currentExecutionLine: parsed.instructions[entryIndex]?.sourceLine ?? null,
      });

      return true;
    },

    checkCodeDirty: (currentCode: string) => {
      const { isAssembled, assembledCode, isCodeDirty } = get();
      if (isAssembled && assembledCode !== null) {
        const dirty = currentCode !== assembledCode;
        if (isCodeDirty !== dirty) {
          set({ isCodeDirty: dirty });
        }
      }
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
        const wasRunning = get().isRunning;
        set({
          isWaitingForInput: true,
          inputPrompt: next.value.prompt,
          inputType: next.value.inputType,
          isRunning: false,
          wasRunningBeforeInput: wasRunning,
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
      const { cpu, memory, history, runner } = get();
      const prev = history.popSnapshot(cpu, memory);
      if (!prev) return;

      if (runner) {
        runner.unhalt();
        runner.setStepCount(history.length);
      }
      const generator = runner ? runner.runGenerator() : null;

      set({
        generator,
        cpuState: cpu.getState(),
        currentExecutionLine: prev.sourceLine,
        consoleOutput: prev.consoleOutput ?? get().consoleOutput.slice(0, prev.consoleLength),
        currentStepIndex: history.length,
        totalStepsRecorded: history.length,
        changedRegisters: new Set(prev.changedRegisters ?? []),
        flagDiagnostics: prev.flagDiagnostics ?? [],
        isHalted: false,
        isWaitingForInput: false,
        wasRunningBeforeInput: false,
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
      set({ isRunning: false, wasRunningBeforeInput: false });
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
        wasRunningBeforeInput: false,
        currentExecutionLine: null,
        currentStepIndex: 0,
        totalStepsRecorded: 0,
        isCodeDirty: false,
      });
    },

    submitInput: async (input: string) => {
      const { generator, cpu, history, breakpoints } = get();
      if (!generator) return;

      const oldRegs = { ...cpu.getRegisters() };
      set({
        isWaitingForInput: false,
        consoleOutput: get().consoleOutput + input + '\n',
      });

      // Resume generator with input value
      const next = await generator.next(input);

      if (next.done || next.value?.type === 'HALTED') {
        set({
          isHalted: true,
          isRunning: false,
          wasRunningBeforeInput: false,
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
          wasRunningBeforeInput: false,
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
          flagDiagnostics: next.value.flagDiagnostics ?? [],
          currentStepIndex: history.length,
          totalStepsRecorded: history.length,
        });

        if (breakpoints.has(next.value.line)) {
          set({ isRunning: false, wasRunningBeforeInput: false });
          return;
        }
      }

      if (get().wasRunningBeforeInput) {
        set({ wasRunningBeforeInput: false });
        get().runContinuous();
      }
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
