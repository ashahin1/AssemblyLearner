// COE224: Assembly Language Studio - Playground IDE Page

import React, { useState, useEffect } from 'react';
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

export const PlaygroundPage: React.FC = () => {
  const [code, setCode] = useState<string>(() => {
    const urlCode = PersistenceManager.decodeCodeFromUrl();
    if (urlCode) return urlCode;
    const savedCode = PersistenceManager.loadCode();
    return savedCode ?? DEFAULT_CODE;
  });

  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const assembleCode = useCPUStore((s) => s.assembleCode);

  useEffect(() => {
    // Initial assembly on load
    assembleCode(code);
  }, []);

  const handleSelectExample = (example: CodeExample) => {
    setCode(example.code);
    assembleCode(example.code);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-53px)] bg-slate-950 overflow-hidden select-none">
      {/* Top Controls Toolbar */}
      <Toolbar currentCode={code} onOpenExamples={() => setIsExamplesOpen(true)} />

      {/* Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-2 min-h-0 overflow-hidden">
        {/* Left Column: Code Editor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full min-h-0">
          <EditorPanel
            initialCode={code}
            onCodeChange={(newCode) => {
              setCode(newCode);
            }}
          />
        </div>

        {/* Middle Column: Registers & Flags (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2 h-full min-h-0 overflow-y-auto">
          <div className="flex-1 min-h-[280px]">
            <RegisterPanel />
          </div>
          <div className="shrink-0">
            <FlagsPanel />
          </div>
        </div>

        {/* Right Column: Memory & Stack (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-2 h-full min-h-0 overflow-y-auto">
          <div className="flex-1 min-h-[200px]">
            <StackPanel />
          </div>
          <div className="flex-1 min-h-[200px]">
            <MemoryPanel />
          </div>
        </div>
      </div>

      {/* Bottom Row: Console & Timeline */}
      <div className="h-44 p-2 pt-0 flex flex-col gap-1.5 shrink-0">
        <div className="flex-1 min-h-0">
          <ConsolePanel />
        </div>
        <TimelinePanel />
      </div>

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
