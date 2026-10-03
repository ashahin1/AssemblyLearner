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

const getInitialFontSize = (): number => {
  try {
    const saved = localStorage.getItem('coe224_font_size');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 12 && parsed <= 32) return parsed;
    }
  } catch {}
  return 14;
};

const getInitialUiScale = (): number => {
  try {
    const saved = localStorage.getItem('coe224_ui_scale');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 80 && parsed <= 200) return parsed;
    }
  } catch {}
  return 100;
};

interface UIStoreState {
  theme: 'dark' | 'light';
  registerFormat: RegisterDisplayFormat;
  executionSpeedMs: number;
  fontSize: number;
  uiScale: number;
  expandedRegisters: Set<string>;
  isSettingsOpen: boolean;

  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setRegisterFormat: (format: RegisterDisplayFormat) => void;
  setExecutionSpeedMs: (speed: number) => void;
  setFontSize: (size: number) => void;
  setUiScale: (scale: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleTvMode: () => void;
  toggleRegisterExpansion: (reg: string) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStoreState>((set, get) => ({
  theme: getInitialTheme(),
  registerFormat: 'hex',
  executionSpeedMs: 200,
  fontSize: getInitialFontSize(),
  uiScale: getInitialUiScale(),
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
  setFontSize: (fontSize) => {
    const clamped = Math.max(12, Math.min(32, fontSize));
    set({ fontSize: clamped });
    try {
      localStorage.setItem('coe224_font_size', clamped.toString());
    } catch {}
  },

  setUiScale: (scale) => {
    const clamped = Math.max(80, Math.min(200, Math.round(scale)));
    set({ uiScale: clamped });
    try {
      localStorage.setItem('coe224_ui_scale', clamped.toString());
    } catch {}

    if (typeof document !== 'undefined') {
      (document.documentElement.style as any).zoom = `${clamped}%`;
      document.documentElement.style.setProperty('--app-ui-scale', (clamped / 100).toString());
    }
  },

  zoomIn: () => {
    const current = get().uiScale;
    get().setUiScale(current + 10);
  },

  zoomOut: () => {
    const current = get().uiScale;
    get().setUiScale(current - 10);
  },

  resetZoom: () => {
    get().setUiScale(100);
  },

  toggleTvMode: () => {
    const current = get().uiScale;
    if (current >= 135) {
      get().setUiScale(100);
    } else {
      get().setUiScale(140);
    }
  },

  toggleRegisterExpansion: (reg) => {
    const expanded = new Set(get().expandedRegisters);
    if (expanded.has(reg)) expanded.delete(reg);
    else expanded.add(reg);
    set({ expandedRegisters: expanded });
  },

  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
}));
