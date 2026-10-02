// Unit tests for Flag Correctness (IA-32 EFLAGS behavior)

import { describe, it, expect } from 'vitest';
import { FlagEngine } from '../../src/engine/flags';
import { Flags } from '../../src/engine/types';

describe('EFLAGS Computation & Boundary Cases', () => {
  const initialFlags: Flags = { CF: 0, PF: 0, AF: 0, ZF: 0, SF: 0, OF: 0, DF: 0 };

  describe('ADD Flags', () => {
    it('detects 32-bit signed overflow: 0x7FFFFFFF + 1 -> OF=1, SF=1, CF=0', () => {
      const { flags } = FlagEngine.computeAddFlags(0x7fffffff, 1, 4, initialFlags);
      expect(flags.OF).toBe(1); // Signed overflow (+ to -)
      expect(flags.SF).toBe(1); // Result is negative in signed view
      expect(flags.CF).toBe(0); // Fits within unsigned 32-bit
      expect(flags.ZF).toBe(0);
    });

    it('detects 32-bit unsigned carry: 0xFFFFFFFF + 1 -> CF=1, ZF=1, OF=0', () => {
      const { flags } = FlagEngine.computeAddFlags(0xffffffff, 1, 4, initialFlags);
      expect(flags.CF).toBe(1); // Unsigned carry
      expect(flags.ZF).toBe(1); // Result is 0
      expect(flags.OF).toBe(0); // No signed overflow
    });

    it('detects 8-bit signed overflow: 7Fh + 1 -> OF=1, SF=1, CF=0', () => {
      const { flags } = FlagEngine.computeAddFlags(0x7f, 1, 1, initialFlags);
      expect(flags.OF).toBe(1);
      expect(flags.SF).toBe(1);
      expect(flags.CF).toBe(0);
    });

    it('detects 8-bit unsigned carry: 0FFh + 1 -> CF=1, ZF=1', () => {
      const { flags } = FlagEngine.computeAddFlags(0xff, 1, 1, initialFlags);
      expect(flags.CF).toBe(1);
      expect(flags.ZF).toBe(1);
      expect(flags.OF).toBe(0);
    });
  });

  describe('SUB and CMP Flags', () => {
    it('equal values set ZF=1, CF=0, SF=0, OF=0', () => {
      const { flags } = FlagEngine.computeSubFlags(10, 10, 4, initialFlags);
      expect(flags.ZF).toBe(1);
      expect(flags.CF).toBe(0);
      expect(flags.SF).toBe(0);
      expect(flags.OF).toBe(0);
    });

    it('smaller - larger sets unsigned borrow CF=1, SF=1', () => {
      const { flags } = FlagEngine.computeSubFlags(3, 5, 4, initialFlags);
      expect(flags.CF).toBe(1); // Unsigned borrow
      expect(flags.SF).toBe(1); // Negative result
      expect(flags.ZF).toBe(0);
    });

    it('signed underflow: 0x80000000 - 1 sets OF=1, SF=0', () => {
      const { flags } = FlagEngine.computeSubFlags(0x80000000, 1, 4, initialFlags);
      expect(flags.OF).toBe(1); // -2147483648 - 1 causes signed underflow
      expect(flags.SF).toBe(0); // result is +2147483647
    });
  });

  describe('INC and DEC Flags', () => {
    it('INC does NOT modify Carry Flag (CF)', () => {
      const flagsWithCarry: Flags = { ...initialFlags, CF: 1 };
      // 0xFFFFFFFF + 1 would set CF in ADD, but INC leaves CF unchanged!
      const { flags } = FlagEngine.computeIncDecFlags(0xffffffff, true, 4, flagsWithCarry);
      expect(flags.ZF).toBe(1);
      expect(flags.CF).toBe(1); // CF remained untouched!
    });
  });
});
