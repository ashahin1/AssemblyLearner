// COE224: Assembly Language Studio - Execution History & Step-Backward Engine

import { CPU } from './cpu';
import { MemoryManager } from './memory';
import { ExecutionSnapshot, FlagDiagnostic } from './types';
import { MAX_HISTORY_STEPS } from './constants';

export class HistoryManager {
  private history: ExecutionSnapshot[] = [];
  private currentMemoryChanges: Array<{ address: number; oldValue: number }> = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.history = [];
    this.currentMemoryChanges = [];
  }

  get length(): number {
    return this.history.length;
  }

  /**
   * Called by MemoryManager write callback to record memory modifications
   */
  recordMemoryChange(address: number, oldValue: number): void {
    this.currentMemoryChanges.push({ address, oldValue });
  }

  /**
   * Saves a checkpoint before executing an instruction
   */
  pushSnapshot(
    cpu: CPU,
    sourceLine: number,
    instructionText: string,
    consoleInfo: number | string = 0,
    changedRegisters: string[] = [],
    diagnostics: FlagDiagnostic[] = []
  ): void {
    const consoleText = typeof consoleInfo === 'string' ? consoleInfo : undefined;
    const consoleLength = typeof consoleInfo === 'number' ? consoleInfo : consoleInfo.length;

    const snapshot: ExecutionSnapshot = {
      eip: cpu.getRegisters().eip,
      registers: cpu.getRegisters(),
      flags: cpu.getFlags(),
      modifiedMemory: [...this.currentMemoryChanges],
      consoleOutputLength: consoleLength,
      consoleOutput: consoleText,
      changedRegisters: [...changedRegisters],
      sourceLine,
      instructionText,
      flagDiagnostics: diagnostics,
    };

    this.history.push(snapshot);
    if (this.history.length > MAX_HISTORY_STEPS) {
      this.history.shift(); // Evict oldest
    }

    this.currentMemoryChanges = [];
  }

  /**
   * Steps backward by restoring the previous snapshot and reverting memory writes
   */
  popSnapshot(
    cpu: CPU,
    memory: MemoryManager
  ): {
    sourceLine: number;
    consoleLength: number;
    consoleOutput?: string;
    changedRegisters?: string[];
    flagDiagnostics?: FlagDiagnostic[];
  } | null {
    if (this.history.length === 0) return null;

    const snapshot = this.history.pop()!;

    // Revert memory writes
    for (let i = snapshot.modifiedMemory.length - 1; i >= 0; i--) {
      const change = snapshot.modifiedMemory[i];
      memory.writeByte(change.address, change.oldValue);
    }

    // Restore CPU state
    cpu.setState({
      registers: snapshot.registers,
      flags: snapshot.flags,
    });

    return {
      sourceLine: snapshot.sourceLine,
      consoleLength: snapshot.consoleOutputLength,
      consoleOutput: snapshot.consoleOutput,
      changedRegisters: snapshot.changedRegisters,
      flagDiagnostics: snapshot.flagDiagnostics,
    };
  }

  getSnapshotAt(index: number): ExecutionSnapshot | undefined {
    return this.history[index];
  }

  getAllSnapshots(): ExecutionSnapshot[] {
    return this.history;
  }
}
