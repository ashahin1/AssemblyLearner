// Unit tests for Sub-register synchronization (EAX <-> AX <-> AH / AL)

import { describe, it, expect } from 'vitest';
import { CPU } from '../../src/engine/cpu';

describe('CPU Register Synchronization', () => {
  it('updates AX, AH, and AL when EAX is modified', () => {
    const cpu = new CPU();
    cpu.setRegister('eax', 0x12345678);

    expect(cpu.getRegister('eax')).toBe(0x12345678);
    expect(cpu.getRegister('ax')).toBe(0x5678);
    expect(cpu.getRegister('ah')).toBe(0x56);
    expect(cpu.getRegister('al')).toBe(0x78);
  });

  it('modifying AL preserves AH and upper bits of EAX', () => {
    const cpu = new CPU();
    cpu.setRegister('eax', 0x12345678);
    cpu.setRegister('al', 0x99);

    expect(cpu.getRegister('eax')).toBe(0x12345699);
    expect(cpu.getRegister('ah')).toBe(0x56);
    expect(cpu.getRegister('al')).toBe(0x99);
    expect(cpu.getRegister('ax')).toBe(0x5699);
  });

  it('modifying AH preserves AL and upper bits of EAX', () => {
    const cpu = new CPU();
    cpu.setRegister('eax', 0x12345678);
    cpu.setRegister('ah', 0xcc);

    expect(cpu.getRegister('eax')).toBe(0x1234cc78);
    expect(cpu.getRegister('ah')).toBe(0xcc);
    expect(cpu.getRegister('al')).toBe(0x78);
  });

  it('modifying AX preserves upper 16 bits of EAX', () => {
    const cpu = new CPU();
    cpu.setRegister('eax', 0x12345678);
    cpu.setRegister('ax', 0xabcd);

    expect(cpu.getRegister('eax')).toBe(0x1234abcd);
    expect(cpu.getRegister('ah')).toBe(0xab);
    expect(cpu.getRegister('al')).toBe(0xcd);
  });
});
