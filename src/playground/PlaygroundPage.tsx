// COE224: Assembly Language Studio - Playground IDE Page

import React, { useState, useEffect, useRef } from 'react';
import { EditorPanel } from '../editor/EditorPanel';
import { RegisterPanel } from '../panels/RegisterPanel';
import { FlagsPanel } from '../panels/FlagsPanel';
import { MemoryPanel } from '../panels/MemoryPanel';
import { StackPanel } from '../panels/StackPanel';
import { ConsolePanel } from '../panels/ConsolePanel';
import { TimelinePanel } from '../panels/TimelinePanel';
import { Toolbar } from './Toolbar';
import { ExamplesMenu } from './ExamplesMenu';
import { SettingsModal } from './SettingsModal';
import { PersistenceManager } from '../store/persistence';
import { useCPUStore } from '../store/cpuStore';
import { CodeExample } from '../engine/types';
import { Code2, Cpu, Layers, Terminal, type LucideIcon } from 'lucide-react';

const DEFAULT_CODE = `INCLUDE Irvine32.inc

.data
    msg BYTE "Welcome to COE224 Assembly Studio!", 0

.code
main PROC
    mov  edx, OFFSET msg
    call WriteString
    call Crlf
    call DumpRegs
    exit
main ENDP
END main
`;

// Mobile (< lg) view tabs. On lg+ screens all panels are shown in the 3-column grid.
type MobileTab = 'editor' | 'registers' | 'memory' | 'console';

const MOBILE_TABS: Array<{ id: MobileTab; label: string; Icon: LucideIcon }> = [
  { id: 'editor', label: 'Code', Icon: Code2 },
  { id: 'registers', label: 'Registers', Icon: Cpu },
  { id: 'memory', label: 'Memory', Icon: Layers },
  { id: 'console', label: 'Console', Icon: Terminal },
];

export const PlaygroundPage: React.FC = () => {
  const [code, setCode] = useState<string>(() => {
    const urlCode = PersistenceManager.decodeCodeFromUrl();
    if (urlCode) return urlCode;
    const savedCode = PersistenceManager.loadCode();
    return savedCode ?? DEFAULT_CODE;
  });

  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor');
  const [hasUnseenOutput, setHasUnseenOutput] = useState(false);
  const assembleCode = useCPUStore((s) => s.assembleCode);
  const isWaitingForInput = useCPUStore((s) => s.isWaitingForInput);
  const consoleOutput = useCPUStore((s) => s.consoleOutput);
  const prevOutputRef = useRef(consoleOutput);

  useEffect(() => {
    // Initial assembly on load
    assembleCode(code);
  }, []);

  // On mobile, jump to the console when the program needs keyboard input
  useEffect(() => {
    if (isWaitingForInput) setMobileTab('console');
  }, [isWaitingForInput]);

  // Flag new console output on the mobile tab bar while another tab is active
  useEffect(() => {
    if (consoleOutput !== prevOutputRef.current && consoleOutput) {
      if (mobileTab !== 'console') setHasUnseenOutput(true);
    }
    prevOutputRef.current = consoleOutput;
  }, [consoleOutput]);

  useEffect(() => {
    if (mobileTab === 'console') setHasUnseenOutput(false);
  }, [mobileTab]);

  const handleSelectExample = (example: CodeExample) => {
    setCode(example.code);
    assembleCode(example.code);
    setMobileTab('editor');
  };

  // Visibility helper: on mobile only the active tab is displayed; on lg+ everything is displayed.
  // Panels stay mounted (CSS-hidden) so editor state and scroll positions are preserved.
  const vis = (tab: MobileTab) => (mobileTab === tab ? 'flex' : 'hidden lg:flex');

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden select-none">
      {/* Top Controls Toolbar */}
      <Toolbar currentCode={code} onOpenExamples={() => setIsExamplesOpen(true)} />

      {/* Main Workspace Grid */}
      <div
        className={`${
          mobileTab === 'console' ? 'hidden lg:grid' : 'grid'
        } flex-1 grid-cols-1 lg:grid-cols-12 gap-2 p-2 min-h-0 overflow-hidden`}
      >
        {/* Left Column: Code Editor (5 cols) */}
        <div className={`${vis('editor')} lg:col-span-5 flex-col h-full min-h-0 overflow-hidden`}>
          <EditorPanel
            initialCode={code}
            onCodeChange={(newCode) => {
              setCode(newCode);
            }}
          />
        </div>

        {/* Middle Column: Registers & Flags (4 cols) */}
        <div className={`${vis('registers')} lg:col-span-4 flex-col gap-2 h-full min-h-0 overflow-y-auto`}>
          <div className="flex-1 min-h-[280px]">
            <RegisterPanel />
          </div>
          <div className="shrink-0">
            <FlagsPanel />
          </div>
        </div>

        {/* Right Column: Memory & Stack (3 cols) */}
        <div className={`${vis('memory')} lg:col-span-3 flex-col gap-2 h-full min-h-0 overflow-y-auto`}>
          <div className="flex-1 min-h-[200px]">
            <StackPanel />
          </div>
          <div className="flex-1 min-h-[200px]">
            <MemoryPanel />
          </div>
        </div>
      </div>

      {/* Bottom Row: Console & Timeline (full-height tab on mobile, fixed strip on lg+) */}
      <div
        className={`${
          mobileTab === 'console' ? 'flex flex-1 min-h-0' : 'hidden'
        } lg:flex lg:flex-none lg:h-44 lg:shrink-0 p-2 lg:pt-0 flex-col gap-1.5`}
      >
        <div className="flex-1 min-h-0">
          <ConsolePanel />
        </div>
        <TimelinePanel />
      </div>

      {/* Mobile Tab Bar */}
      <nav className="lg:hidden shrink-0 grid grid-cols-4 bg-slate-900 border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
        {MOBILE_TABS.map(({ id, label, Icon }) => {
          const active = mobileTab === id;
          return (
            <button
              key={id}
              onClick={() => setMobileTab(id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-semibold transition ${
                active ? 'text-sky-400 bg-slate-800/60' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
              {id === 'console' && !active && (hasUnseenOutput || isWaitingForInput) && (
                <span
                  className={`absolute top-1 right-[30%] w-2 h-2 rounded-full ${
                    isWaitingForInput ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      <ExamplesMenu
        isOpen={isExamplesOpen}
        onClose={() => setIsExamplesOpen(false)}
        onSelectExample={handleSelectExample}
      />
      <SettingsModal />
    </div>
  );
};
