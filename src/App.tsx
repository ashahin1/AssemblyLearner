// COE224: Assembly Language Studio - Root Application Component

import React from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { PlaygroundPage } from './playground/PlaygroundPage';
import { ModulesIndex } from './modules/ModulesIndex';
import { Ch1Page } from './modules/ch1/Ch1Page';
import { Ch2Page } from './modules/ch2/Ch2Page';
import { Ch3Page } from './modules/ch3/Ch3Page';
import { Ch4Page } from './modules/ch4/Ch4Page';
import { Ch5Page } from './modules/ch5/Ch5Page';
import { Ch6Page } from './modules/ch6/Ch6Page';
import { Ch7Page } from './modules/ch7/Ch7Page';
import { useUIStore } from './store/uiStore';
import { Cpu, Terminal, BookOpen, Sun, Moon, Tv, Maximize, Minimize, Plus, Minus } from 'lucide-react';

const NavigationHeader: React.FC = () => {
  const location = useLocation();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const uiScale = useUIStore((s) => s.uiScale);
  const zoomIn = useUIStore((s) => s.zoomIn);
  const zoomOut = useUIStore((s) => s.zoomOut);
  const resetZoom = useUIStore((s) => s.resetZoom);
  const toggleTvMode = useUIStore((s) => s.toggleTvMode);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const isPlayground = location.pathname.startsWith('/playground');
  const isChapters = location.pathname.startsWith('/chapters');

  return (
    <header className="h-[53px] bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shadow-md shrink-0">
      {/* Brand */}
      <Link to="/playground" className="flex items-center gap-2.5 text-white font-extrabold text-sm tracking-tight group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-600/30 group-hover:scale-105 transition">
          <Cpu size={18} />
        </div>
        <div className="flex flex-col">
          <span className="leading-none text-sky-400 font-bold">COE224: Assembly Studio</span>
          <span className="text-[10px] text-slate-400 font-normal">Buraydah College • x86 IA-32</span>
        </div>
      </Link>

      {/* Center Navigation Links */}
      <nav className="flex items-center gap-1 text-xs">
        <Link
          to="/playground"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
            isPlayground
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Terminal size={14} />
          <span>IDE & Simulator</span>
        </Link>

        <Link
          to="/chapters"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
            isChapters
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen size={14} />
          <span>Lecture Modules (Ch 1–7)</span>
        </Link>
      </nav>

      {/* Right Controls: Classroom TV, Zoom, Fullscreen & Theme */}
      <div className="flex items-center gap-2">
        {/* Classroom TV Mode Toggle Button */}
        <button
          onClick={toggleTvMode}
          title={uiScale >= 135 ? "Exit Classroom TV Mode (Reset to 100%)" : "Switch to Classroom TV Mode (140% Large UI for back rows)"}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-semibold text-xs transition shadow-sm ${
            uiScale >= 135
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/10'
              : 'bg-slate-800 text-slate-300 border-slate-700/60 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Tv size={15} className={uiScale >= 135 ? 'text-amber-400 animate-pulse' : 'text-slate-400'} />
          <span className="hidden sm:inline">TV Mode</span>
          {uiScale >= 135 && (
            <span className="text-[10px] font-mono px-1 py-0.2 bg-amber-400 text-slate-950 font-bold rounded">
              {uiScale}%
            </span>
          )}
        </button>

        {/* Zoom Granular Control */}
        <div className="flex items-center bg-slate-800 border border-slate-700/60 rounded-lg p-0.5 text-xs shadow-sm">
          <button
            onClick={zoomOut}
            disabled={uiScale <= 80}
            title="Zoom Out (Smaller UI)"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={resetZoom}
            title="Click to reset UI scale to 100%"
            className="px-1.5 py-0.5 text-[11px] font-mono font-bold text-slate-300 hover:text-sky-400 transition"
          >
            {uiScale}%
          </button>
          <button
            onClick={zoomIn}
            disabled={uiScale >= 200}
            title="Zoom In (Enlarge UI for Classroom TV)"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen (Classroom Presentation)"}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700/60"
        >
          {isFullscreen ? <Minimize size={15} className="text-emerald-400" /> : <Maximize size={15} />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700/60"
        >
          {theme === 'dark' ? <Moon size={15} className="text-sky-400" /> : <Sun size={15} className="text-amber-400" />}
        </button>
      </div>
    </header>
  );
};

export const App: React.FC = () => {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const uiScale = useUIStore((s) => s.uiScale);
  const setUiScale = useUIStore((s) => s.setUiScale);

  React.useEffect(() => {
    setTheme(theme);
    setUiScale(uiScale);
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <NavigationHeader />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/playground" replace />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/chapters" element={<ModulesIndex />} />
            <Route path="/chapters/1" element={<Ch1Page />} />
            <Route path="/chapters/2" element={<Ch2Page />} />
            <Route path="/chapters/3" element={<Ch3Page />} />
            <Route path="/chapters/4" element={<Ch4Page />} />
            <Route path="/chapters/5" element={<Ch5Page />} />
            <Route path="/chapters/6" element={<Ch6Page />} />
            <Route path="/chapters/7" element={<Ch7Page />} />
            <Route path="*" element={<Navigate to="/playground" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
