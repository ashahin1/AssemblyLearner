// COE224: Assembly Language Studio - Persistence & Share-by-URL

import LZString from 'lz-string';

const STORAGE_KEY = 'coe224_studio_saved_code';

export class PersistenceManager {
  static saveCode(code: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // LocalStorage might be full or disabled
    }
  }

  static loadCode(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Compresses MASM code into a URL-safe Base64 string for sharing with the professor
   */
  static encodeCodeToUrl(code: string): string {
    const compressed = LZString.compressToEncodedURIComponent(code);
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}#/playground?code=${compressed}`;
  }

  /**
   * Reads and decompresses code from the URL hash or query param
   */
  static decodeCodeFromUrl(): string | null {
    try {
      // HashRouter style: #/playground?code=...
      const hash = window.location.hash;
      const qIndex = hash.indexOf('?');
      if (qIndex === -1) return null;

      const params = new URLSearchParams(hash.slice(qIndex));
      const codeParam = params.get('code');
      if (!codeParam) return null;

      const decompressed = LZString.decompressFromEncodedURIComponent(codeParam);
      return decompressed && decompressed.length > 0 ? decompressed : null;
    } catch {
      return null;
    }
  }
}
