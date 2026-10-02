// COE224: Assembly Language Studio - Zustand UI Store

import { create } from 'zustand';

export type RegisterDisplayFormat = 'hex' | 'unsigned' | 'signed' | 'binary';

interface UIStoreState {
  theme: 'dark' | 'light';
  registerFormat: RegisterDisplayFormat;
  executionSpeedMs: number;
  fontSize: number;
  expandedRegisters: Set<string>;
  isSettingsOpen: boolean;

  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setRegisterFormat: (format: RegisterDisplayFormat) => void;
  setExecutionSpeedMs: (speed: number) => void;
  setFontSize: (size: number) => void;
  toggleRegisterExpansion: (reg: string) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStoreState>((set, get) => ({
  theme: 'dark',
  registerFormat: 'hex',
  executionSpeedMs: 200,
  fontSize: 14,
  expandedRegisters: new Set(['eax']),
  isSettingsOpen: false,

  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setRegisterFormat: (registerFormat) => set({ registerFormat }),
  setExecutionSpeedMs: (executionSpeedMs) => set({ executionSpeedMs }),
  setFontSize: (fontSize) => set({ fontSize }),

  toggleRegisterExpansion: (reg) => {
    const expanded = new Set(get().expandedRegisters);
    if (expanded.has(reg)) expanded.delete(reg);
    else expanded.add(reg);
    set({ expandedRegisters: expanded });
  },

  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
}));
