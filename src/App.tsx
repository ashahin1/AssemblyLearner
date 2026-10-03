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
import { Cpu, Terminal, BookOpen, Sun, Moon } from 'lucide-react';

const NavigationHeader: React.FC = () => {
  const location = useLocation();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

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

      {/* Right Controls */}
      <div className="flex items-center gap-2">
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

  React.useEffect(() => {
    setTheme(theme);
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
