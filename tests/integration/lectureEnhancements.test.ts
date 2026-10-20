import { describe, it, expect } from 'vitest';
import { INSTRUCTIONS, ALL_REGISTERS, DIRECTIVES } from '../../src/engine/constants';
import { CODE_EXAMPLES } from '../../src/examples';

describe('Lecture Enhancements & Widgets Verification', () => {
  it('should verify 8-bit Ripple-Carry Adder logic (CF and OF calculation)', () => {
    function computeRippleCarry(a: number, b: number) {
      const a8 = (a & 0xff) >>> 0;
      const b8 = (b & 0xff) >>> 0;
      const carries: number[] = new Array(9).fill(0);
      const sumBits: number[] = new Array(8).fill(0);

      for (let bit = 0; bit < 8; bit++) {
        const bitA = (a8 >> bit) & 1;
        const bitB = (b8 >> bit) & 1;
        const cIn = carries[bit];
        sumBits[bit] = bitA ^ bitB ^ cIn;
        carries[bit + 1] = (bitA & bitB) | (cIn & (bitA ^ bitB));
      }

      const cf = carries[8];
      const cIntoMsb = carries[7];
      const of = cIntoMsb ^ cf;
      const sumUnsigned = (a8 + b8) & 0xff;
      return { cf, of, sumUnsigned };
    }

    // Case 1: 127 + 1 = 128 (Signed overflow OF=1, CF=0)
    const res1 = computeRippleCarry(127, 1);
    expect(res1.cf).toBe(0);
    expect(res1.of).toBe(1);
    expect(res1.sumUnsigned).toBe(128);

    // Case 2: 255 + 1 = 256 (Unsigned carry CF=1, OF=0)
    const res2 = computeRippleCarry(255, 1);
    expect(res2.cf).toBe(1);
    expect(res2.of).toBe(0);
    expect(res2.sumUnsigned).toBe(0);

    // Case 3: 150 + 150 = 300 (Both CF=1 and OF=1: -106 + -106 = -212 < -128)
    const res3 = computeRippleCarry(150, 150);
    expect(res3.cf).toBe(1);
    expect(res3.of).toBe(1);

    // Case 4: 200 + 100 = 300 (CF=1, but OF=0 because -56 + +100 = +44)
    const res4 = computeRippleCarry(200, 100);
    expect(res4.cf).toBe(1);
    expect(res4.of).toBe(0);
  });

  it('should verify MASM identifier and hex leading-zero token validation rules', () => {
    function validateToken(token: string) {
      if (/^[a-fA-F][0-9a-fA-F]*[hH]$/.test(token)) {
        return { valid: false, trap: true };
      }
      if (/^[0-9][0-9a-fA-F]*[hH]$/.test(token)) {
        return { valid: true, trap: false };
      }
      const lower = token.toLowerCase();
      if ((INSTRUCTIONS as readonly string[]).includes(lower) || (ALL_REGISTERS as readonly string[]).includes(lower) || (DIRECTIVES as readonly string[]).includes(lower)) {
        return { valid: false, reserved: true };
      }
      if (/^[0-9]/.test(token)) {
        return { valid: false, startsWithDigit: true };
      }
      if (/^[a-zA-Z_@?$][a-zA-Z0-9_@?$]{0,246}$/.test(token)) {
        return { valid: true };
      }
      return { valid: false };
    }

    // Trap: missing leading zero
    expect(validateToken('FFh')).toEqual({ valid: false, trap: true });
    expect(validateToken('A5h')).toEqual({ valid: false, trap: true });

    // Valid hex with leading zero
    expect(validateToken('0FFh')).toEqual({ valid: true, trap: false });
    expect(validateToken('0A5h')).toEqual({ valid: true, trap: false });

    // Reserved words
    expect(validateToken('mov')).toEqual({ valid: false, reserved: true });
    expect(validateToken('eax')).toEqual({ valid: false, reserved: true });
    expect(validateToken('dword')).toEqual({ valid: false, reserved: true });

    // Identifier naming
    expect(validateToken('1stVar')).toEqual({ valid: false, startsWithDigit: true });
    expect(validateToken('myVar_1')).toEqual({ valid: true });
    expect(validateToken('@label')).toEqual({ valid: true });
  });

  it('should verify FSM signed integer parsing logic', () => {
    function parseFSM(input: string) {
      let state = 'A';
      for (const char of input) {
        if (state === 'A') {
          if (char === '+' || char === '-') state = 'B';
          else if (char >= '0' && char <= '9') state = 'C';
          else return false;
        } else if (state === 'B' || state === 'C') {
          if (char >= '0' && char <= '9') state = 'C';
          else return false;
        }
      }
      return state === 'C';
    }

    expect(parseFSM('-425')).toBe(true);
    expect(parseFSM('+12')).toBe(true);
    expect(parseFSM('999')).toBe(true);
    expect(parseFSM('--5')).toBe(false);
    expect(parseFSM('+')).toBe(false);
    expect(parseFSM('-')).toBe(false);
    expect(parseFSM('12a')).toBe(false);
    expect(parseFSM('')).toBe(false);
  });

  it('should verify 16-bit MS-DOS file date stamp bitfield encoding & decoding', () => {
    const year = 2026;
    const month = 10;
    const day = 20;

    const yearOffset = year - 1980; // 46
    const packedDX = ((yearOffset & 0x7f) << 9) | ((month & 0x0f) << 5) | (day & 0x1f);

    // Extraction simulation
    const extractedDay = packedDX & 0x1f;
    const extractedMonth = (packedDX >> 5) & 0x0f;
    const extractedYear = ((packedDX >> 9) & 0x7f) + 1980;

    expect(extractedDay).toBe(20);
    expect(extractedMonth).toBe(10);
    expect(extractedYear).toBe(2026);
  });

  it('should verify that all 5 "Fix the Bug" debugging challenges are registered in CODE_EXAMPLES', () => {
    const bugExamples = CODE_EXAMPLES.filter(e => e.chapter === 8);
    expect(bugExamples.length).toBe(5);

    const ids = bugExamples.map(e => e.id);
    expect(ids).toContain('bug-ch4-mem-to-mem');
    expect(ids).toContain('bug-ch4-dword-offset');
    expect(ids).toContain('bug-ch5-corrupted-ecx');
    expect(ids).toContain('bug-ch6-signed-vs-unsigned');
    expect(ids).toContain('bug-ch7-missing-cdq');
  });
});
