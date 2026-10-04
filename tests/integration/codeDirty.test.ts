import { describe, it, expect, beforeEach } from 'vitest';
import { useCPUStore } from '../../src/store/cpuStore';

describe('Code Modification Awareness & Stale Debugging (Approach 2)', () => {
  const sampleCode = `INCLUDE Irvine32.inc

.code
main PROC
    mov eax, 10
    mov ebx, 20
    add eax, ebx
    exit
main ENDP
END main
`;

  beforeEach(() => {
    useCPUStore.getState().reset();
  });

  it('initializes assembledCode and isCodeDirty correctly on assembly', () => {
    const ok = useCPUStore.getState().assembleCode(sampleCode);
    expect(ok).toBe(true);
    const state = useCPUStore.getState();
    expect(state.isAssembled).toBe(true);
    expect(state.assembledCode).toBe(sampleCode);
    expect(state.isCodeDirty).toBe(false);
  });

  it('preserves registers, stack, and execution line when code is modified during debugging', async () => {
    // 1. Assemble and step once
    useCPUStore.getState().assembleCode(sampleCode);
    await useCPUStore.getState().stepForward();

    const stateAfterStep = useCPUStore.getState();
    expect(stateAfterStep.cpuState.registers.eax).toBe(10);
    expect(stateAfterStep.totalStepsRecorded).toBe(1);
    expect(stateAfterStep.currentExecutionLine).not.toBeNull();
    const preservedLine = stateAfterStep.currentExecutionLine;

    // 2. User modifies code in editor (e.g. changes 20 to 99)
    const modifiedCode = sampleCode.replace('mov ebx, 20', 'mov ebx, 99');
    useCPUStore.getState().checkCodeDirty(modifiedCode);

    // 3. Stale state is detected
    const stateAfterEdit = useCPUStore.getState();
    expect(stateAfterEdit.isCodeDirty).toBe(true);

    // 4. Verification of Approach 2: CPU state and registers remain intact for inspection
    expect(stateAfterEdit.cpuState.registers.eax).toBe(10);
    expect(stateAfterEdit.totalStepsRecorded).toBe(1);
    expect(stateAfterEdit.currentExecutionLine).toBe(preservedLine);

    // 5. If user undoes the edit back to original code, isCodeDirty flips back to false
    useCPUStore.getState().checkCodeDirty(sampleCode);
    expect(useCPUStore.getState().isCodeDirty).toBe(false);
  });

  it('resets and executes new program cleanly upon reassembly after modification', async () => {
    // 1. Run initial code
    useCPUStore.getState().assembleCode(sampleCode);
    await useCPUStore.getState().stepForward(); // mov eax, 10
    expect(useCPUStore.getState().cpuState.registers.eax).toBe(10);

    // 2. Modify code
    const modifiedCode = sampleCode.replace('mov eax, 10', 'mov eax, 42');
    useCPUStore.getState().checkCodeDirty(modifiedCode);
    expect(useCPUStore.getState().isCodeDirty).toBe(true);

    // 3. Deferred reset and reassembly on subsequent step
    useCPUStore.getState().reset();
    const ok = useCPUStore.getState().assembleCode(modifiedCode);
    expect(ok).toBe(true);
    expect(useCPUStore.getState().isCodeDirty).toBe(false);

    // 4. Execute first instruction of new code
    await useCPUStore.getState().stepForward();
    expect(useCPUStore.getState().cpuState.registers.eax).toBe(42);
  });

  it('handles reassembly failure gracefully when modified code has syntax errors', () => {
    useCPUStore.getState().assembleCode(sampleCode);
    const brokenCode = sampleCode.replace('mov eax, 10', 'invalid_mnemonic eax, 10');
    useCPUStore.getState().checkCodeDirty(brokenCode);
    expect(useCPUStore.getState().isCodeDirty).toBe(true);

    useCPUStore.getState().reset();
    const ok = useCPUStore.getState().assembleCode(brokenCode);
    expect(ok).toBe(false);
    expect(useCPUStore.getState().isAssembled).toBe(false);
    expect(useCPUStore.getState().isCodeDirty).toBe(false);
    expect(useCPUStore.getState().assemblyErrors.length).toBeGreaterThan(0);
  });

  it('marks code dirty and allows restarting even if program already completed (halted)', async () => {
    useCPUStore.getState().assembleCode(sampleCode);
    // Step until halted
    while (!useCPUStore.getState().isHalted) {
      await useCPUStore.getState().stepForward();
    }
    expect(useCPUStore.getState().isHalted).toBe(true);
    expect(useCPUStore.getState().totalStepsRecorded).toBeGreaterThan(0);

    // Modify code
    const modifiedCode = sampleCode.replace('mov eax, 10', 'mov eax, 100');
    useCPUStore.getState().checkCodeDirty(modifiedCode);
    expect(useCPUStore.getState().isCodeDirty).toBe(true);

    // Reassembly restarts execution cleanly
    useCPUStore.getState().reset();
    const ok = useCPUStore.getState().assembleCode(modifiedCode);
    expect(ok).toBe(true);
    expect(useCPUStore.getState().isHalted).toBe(false);
    expect(useCPUStore.getState().isCodeDirty).toBe(false);
    await useCPUStore.getState().stepForward();
    expect(useCPUStore.getState().cpuState.registers.eax).toBe(100);
  });
});
