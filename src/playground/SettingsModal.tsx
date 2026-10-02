// COE224: Assembly Language Studio - Settings Modal

import React from 'react';
import { useUIStore, RegisterDisplayFormat } from '../store/uiStore';
import { X, Settings, Moon, Sun } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen);
  const setIsSettingsOpen = useUIStore((s) => s.setIsSettingsOpen);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const executionSpeedMs = useUIStore((s) => s.executionSpeedMs);
  const setExecutionSpeedMs = useUIStore((s) => s.setExecutionSpeedMs);
  const registerFormat = useUIStore((s) => s.registerFormat);
  const setRegisterFormat = useUIStore((s) => s.setRegisterFormat);
  const fontSize = useUIStore((s) => s.fontSize);
  const setFontSize = useUIStore((s) => s.setFontSize);

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
            <Settings size={18} className="text-sky-400" />
            <span>Studio Preferences</span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-4">
          {/* Execution Speed */}
          <div>
            <div className="flex items-center justify-between mb-1.5 font-medium text-slate-300">
              <span>Continuous Run Speed</span>
              <span className="font-mono text-sky-400 font-bold">{executionSpeedMs} ms / instruction</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={executionSpeedMs}
              onChange={(e) => setExecutionSpeedMs(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Fast (50ms)</span>
              <span>Slow (1000ms)</span>
            </div>
          </div>

          {/* Register Display Format */}
          <div>
            <label className="block mb-1.5 font-medium text-slate-300">Default Register Display</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['hex', 'unsigned', 'signed', 'binary'] as RegisterDisplayFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setRegisterFormat(fmt)}
                  className={`py-1.5 rounded border text-center font-mono font-medium transition ${
                    registerFormat === fmt
                      ? 'bg-sky-600 border-sky-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex items-center justify-between mb-1.5 font-medium text-slate-300">
              <span>Code Editor Font Size</span>
              <span className="font-mono text-sky-400 font-bold">{fontSize} px</span>
            </div>
            <input
              type="range"
              min="12"
              max="20"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="font-medium text-slate-300">Interface Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            >
              {theme === 'dark' ? <Moon size={14} className="text-sky-400" /> : <Sun size={14} className="text-amber-400" />}
              <span className="capitalize">{theme} Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
