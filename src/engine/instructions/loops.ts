// COE224: Assembly Language Studio - Loop Instructions (Ch 6)
// LOOP, LOOPE, LOOPZ, LOOPNE, LOOPNZ

import { CPU } from '../cpu';

export class LoopInstructions {
  static executeLoop(mnemonic: string, cpu: CPU): boolean {
    const ecx = cpu.getRegister('ecx');
    const newEcx = (ecx - 1) >>> 0;
    cpu.setRegister('ecx', newEcx);

    const m = mnemonic.toLowerCase();
    const flags = cpu.getFlags();

    if (m === 'loop') {
      return newEcx !== 0;
    }

    if (m === 'loope' || m === 'loopz') {
      return newEcx !== 0 && flags.ZF === 1;
    }

    if (m === 'loopne' || m === 'loopnz') {
      return newEcx !== 0 && flags.ZF === 0;
    }

    return false;
  }
}
