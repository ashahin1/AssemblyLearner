// COE224: Assembly Language Studio - Zustand UI Store

import { create } from 'zustand';

export type RegisterDisplayFormat = 'hex' | 'unsigned' | 'signed' | 'binary';

const getInitialTheme = (): 'dark' | 'light' => {
  try {
    const saved = localStorage.getItem('coe224_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return 'dark';
};

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
  theme: getInitialTheme(),
  registerFormat: 'hex',
  executionSpeedMs: 200,
  fontSize: 14,
  expandedRegisters: new Set(['eax']),
  isSettingsOpen: false,

  setTheme: (theme) => {
    set({ theme });
    try {
      localStorage.setItem('coe224_theme', theme);
    } catch {}

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
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
