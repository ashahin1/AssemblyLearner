// COE224: Assembly Language Studio - EFLAGS Computation & Diagnostic Engine

import { Flags, FlagDiagnostic } from './types';

export class FlagEngine {
  /**
   * Computes Parity Flag: 1 if lowest 8 bits of result contain even number of 1s, else 0.
   */
  static computePF(val: number): 0 | 1 {
    let byte = val & 0xff;
    let count = 0;
    while (byte > 0) {
      count += byte & 1;
      byte >>= 1;
    }
    return count % 2 === 0 ? 1 : 0;
  }

  /**
   * Computes flags for ADD operation: dest + src = result
   */
  static computeAddFlags(
    dest: number,
    src: number,
    size: 1 | 2 | 4,
    oldFlags: Flags
  ): { flags: Flags; diagnostics: FlagDiagnostic[] } {
    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
    const signBit = size === 1 ? 0x80 : size === 2 ? 0x8000 : 0x80000000;
    const maxVal = mask;

    const rawResult = dest + src;
    const result = (rawResult & mask) >>> 0;

    const zf: 0 | 1 = result === 0 ? 1 : 0;
    const sf: 0 | 1 = (result & signBit) !== 0 ? 1 : 0;
    const cf: 0 | 1 = rawResult > maxVal ? 1 : 0;

    // OF = (dest sign == src sign) && (dest sign != result sign)
    const destSign = (dest & signBit) !== 0;
    const srcSign = (src & signBit) !== 0;
    const resSign = (result & signBit) !== 0;
    const of: 0 | 1 = destSign === srcSign && destSign !== resSign ? 1 : 0;

    const pf = this.computePF(result);
    const af: 0 | 1 = ((dest & 0x0f) + (src & 0x0f) > 0x0f) ? 1 : 0;

    const newFlags: Flags = {
      ...oldFlags,
      ZF: zf,
      SF: sf,
      CF: cf,
      OF: of,
      PF: pf,
      AF: af,
    };

    const diagnostics = this.generateDiagnostics('ADD', oldFlags, newFlags, {
      dest,
      src,
      result,
      size,
    });

    return { flags: newFlags, diagnostics };
  }

  /**
   * Computes flags for SUB or CMP operation: dest - src = result
   */
  static computeSubFlags(
    dest: number,
    src: number,
    size: 1 | 2 | 4,
    oldFlags: Flags,
    isCmp: boolean = false
  ): { flags: Flags; diagnostics: FlagDiagnostic[] } {
    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
    const signBit = size === 1 ? 0x80 : size === 2 ? 0x8000 : 0x80000000;

    const rawResult = dest - src;
    const result = (rawResult & mask) >>> 0;

    const zf: 0 | 1 = result === 0 ? 1 : 0;
    const sf: 0 | 1 = (result & signBit) !== 0 ? 1 : 0;
    const cf: 0 | 1 = (dest >>> 0) < (src >>> 0) ? 1 : 0; // unsigned borrow

    // OF = (dest sign != src sign) && (dest sign != result sign)
    const destSign = (dest & signBit) !== 0;
    const srcSign = (src & signBit) !== 0;
    const resSign = (result & signBit) !== 0;
    const of: 0 | 1 = destSign !== srcSign && destSign !== resSign ? 1 : 0;

    const pf = this.computePF(result);
    const af: 0 | 1 = ((dest & 0x0f) < (src & 0x0f)) ? 1 : 0;

    const newFlags: Flags = {
      ...oldFlags,
      ZF: zf,
      SF: sf,
      CF: cf,
      OF: of,
      PF: pf,
      AF: af,
    };

    const diagnostics = this.generateDiagnostics(isCmp ? 'CMP' : 'SUB', oldFlags, newFlags, {
      dest,
      src,
      result,
      size,
    });

    return { flags: newFlags, diagnostics };
  }

  /**
   * Computes flags for INC or DEC operation (Note: INC/DEC do NOT alter CF!)
   */
  static computeIncDecFlags(
    dest: number,
    isInc: boolean,
    size: 1 | 2 | 4,
    oldFlags: Flags
  ): { flags: Flags; diagnostics: FlagDiagnostic[] } {
    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
    const signBit = size === 1 ? 0x80 : size === 2 ? 0x8000 : 0x80000000;

    const rawResult = isInc ? dest + 1 : dest - 1;
    const result = (rawResult & mask) >>> 0;

    const zf: 0 | 1 = result === 0 ? 1 : 0;
    const sf: 0 | 1 = (result & signBit) !== 0 ? 1 : 0;

    // OF on INC: was 0x7F... and became 0x80...
    // OF on DEC: was 0x80... and became 0x7F...
    let of: 0 | 1 = 0;
    if (isInc) {
      const maxSigned = signBit - 1;
      of = dest === maxSigned ? 1 : 0;
    } else {
      of = dest === signBit ? 1 : 0;
    }

    const pf = this.computePF(result);

    const newFlags: Flags = {
      ...oldFlags,
      ZF: zf,
      SF: sf,
      OF: of,
      PF: pf,
      // CF remains unchanged in INC / DEC!
    };

    const diagnostics = this.generateDiagnostics(isInc ? 'INC' : 'DEC', oldFlags, newFlags, {
      dest,
      src: 1,
      result,
      size,
    });

    return { flags: newFlags, diagnostics };
  }

  /**
   * Computes flags for bitwise logic operations (AND, OR, XOR, TEST): clears CF and OF!
   */
  static computeLogicFlags(
    result: number,
    size: 1 | 2 | 4,
    oldFlags: Flags,
    opName: string
  ): { flags: Flags; diagnostics: FlagDiagnostic[] } {
    const mask = size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
    const signBit = size === 1 ? 0x80 : size === 2 ? 0x8000 : 0x80000000;
    const res = (result & mask) >>> 0;

    const newFlags: Flags = {
      ...oldFlags,
      CF: 0,
      OF: 0,
      ZF: res === 0 ? 1 : 0,
      SF: (res & signBit) !== 0 ? 1 : 0,
      PF: this.computePF(res),
    };

    const diagnostics = this.generateDiagnostics(opName, oldFlags, newFlags, {
      dest: result,
      src: 0,
      result: res,
      size,
    });

    return { flags: newFlags, diagnostics };
  }

  private static generateDiagnostics(
    op: string,
    oldF: Flags,
    newF: Flags,
    ctx: { dest: number; src: number; result: number; size: 1 | 2 | 4 }
  ): FlagDiagnostic[] {
    const list: FlagDiagnostic[] = [];

    // ZF explanation
    if (newF.ZF !== oldF.ZF) {
      list.push({
        flag: 'ZF',
        oldValue: oldF.ZF,
        newValue: newF.ZF,
        reason:
          newF.ZF === 1
            ? `ZF=1: The result of ${op} was zero (0).`
            : `ZF=0: The result of ${op} was non-zero (${ctx.result.toString(16).toUpperCase()}h).`,
      });
    }

    // CF explanation
    if (newF.CF !== oldF.CF) {
      if (op === 'ADD') {
        list.push({
          flag: 'CF',
          oldValue: oldF.CF,
          newValue: newF.CF,
          reason:
            newF.CF === 1
              ? `CF=1: Unsigned carry occurred — the sum exceeded the maximum ${ctx.size * 8}-bit range.`
              : `CF=0: No unsigned carry occurred.`,
        });
      } else if (op === 'SUB' || op === 'CMP') {
        list.push({
          flag: 'CF',
          oldValue: oldF.CF,
          newValue: newF.CF,
          reason:
            newF.CF === 1
              ? `CF=1: Unsigned borrow occurred — destination (${ctx.dest.toString(16).toUpperCase()}h) was smaller than source (${ctx.src.toString(16).toUpperCase()}h).`
              : `CF=0: No unsigned borrow occurred (destination ≥ source).`,
        });
      } else {
        list.push({
          flag: 'CF',
          oldValue: oldF.CF,
          newValue: newF.CF,
          reason: `CF set to ${newF.CF} by ${op}.`,
        });
      }
    }

    // OF explanation
    if (newF.OF !== oldF.OF) {
      list.push({
        flag: 'OF',
        oldValue: oldF.OF,
        newValue: newF.OF,
        reason:
          newF.OF === 1
            ? `OF=1: Signed 2's complement overflow occurred — the operation generated an invalid signed result.`
            : `OF=0: No signed overflow occurred.`,
      });
    }

    // SF explanation
    if (newF.SF !== oldF.SF) {
      list.push({
        flag: 'SF',
        oldValue: oldF.SF,
        newValue: newF.SF,
        reason:
          newF.SF === 1
            ? `SF=1: Most Significant Bit is 1 (negative in signed 2's complement).`
            : `SF=0: Most Significant Bit is 0 (positive or zero).`,
      });
    }

    return list;
  }
}
