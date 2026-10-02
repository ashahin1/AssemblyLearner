// COE224: Assembly Language Studio - Flat Little-Endian Memory Manager

export class MemoryManager {
  private bytes: Map<number, number> = new Map();
  private onWriteCallback?: (address: number, oldValue: number, newValue: number) => void;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.bytes.clear();
  }

  setWriteCallback(cb?: (address: number, oldValue: number, newValue: number) => void): void {
    this.onWriteCallback = cb;
  }

  loadInitialData(data: Map<number, number>): void {
    for (const [addr, val] of data.entries()) {
      this.bytes.set(addr, val & 0xff);
    }
  }

  readByte(address: number): number {
    return this.bytes.get(address >>> 0) ?? 0;
  }

  readWord(address: number): number {
    const addr = address >>> 0;
    const b0 = this.readByte(addr);
    const b1 = this.readByte(addr + 1);
    return ((b1 << 8) | b0) >>> 0;
  }

  readDword(address: number): number {
    const addr = address >>> 0;
    const b0 = this.readByte(addr);
    const b1 = this.readByte(addr + 1);
    const b2 = this.readByte(addr + 2);
    const b3 = this.readByte(addr + 3);
    return (((b3 << 24) | (b2 << 16) | (b1 << 8) | b0) >>> 0);
  }

  writeByte(address: number, value: number): void {
    const addr = address >>> 0;
    const newVal = value & 0xff;
    const oldVal = this.readByte(addr);

    if (this.onWriteCallback) {
      this.onWriteCallback(addr, oldVal, newVal);
    }

    this.bytes.set(addr, newVal);
  }

  writeWord(address: number, value: number): void {
    const addr = address >>> 0;
    const val = value >>> 0;
    this.writeByte(addr, val & 0xff);
    this.writeByte(addr + 1, (val >> 8) & 0xff);
  }

  writeDword(address: number, value: number): void {
    const addr = address >>> 0;
    const val = value >>> 0;
    this.writeByte(addr, val & 0xff);
    this.writeByte(addr + 1, (val >> 8) & 0xff);
    this.writeByte(addr + 2, (val >> 16) & 0xff);
    this.writeByte(addr + 3, (val >> 24) & 0xff);
  }

  getRegion(startAddr: number, length: number): Uint8Array {
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = this.readByte(startAddr + i);
    }
    return result;
  }

  getAllAllocated(): Array<{ address: number; value: number }> {
    const arr: Array<{ address: number; value: number }> = [];
    for (const [address, value] of this.bytes.entries()) {
      arr.push({ address, value });
    }
    return arr.sort((a, b) => a.address - b.address);
  }
}
