// COE224: Assembly Language Studio - CodeMirror 6 Editor Panel

import React, { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, hoverTooltip } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { masmLanguage } from './masmLanguage';
import { INSTRUCTION_TOOLTIPS } from './tooltips';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { useCPUStore } from '../store/cpuStore';
import { useUIStore } from '../store/uiStore';
import { PersistenceManager } from '../store/persistence';

const masmHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, class: 'cm-keyword' },
  { tag: tags.atom, class: 'cm-atom' },
  { tag: tags.number, class: 'cm-number' },
  { tag: tags.string, class: 'cm-string' },
  { tag: tags.comment, class: 'cm-comment' },
  { tag: tags.typeName, class: 'cm-typeName' },
  { tag: tags.labelName, class: 'cm-variable-2' },
  { tag: tags.variableName, class: 'cm-variable' },
]);

interface EditorPanelProps {
  initialCode: string;
  onCodeChange: (code: string) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ initialCode, onCodeChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [activeCode, setActiveCode] = useState(initialCode);

  const currentExecutionLine = useCPUStore((s) => s.currentExecutionLine);
  const assemblyErrors = useCPUStore((s) => s.assemblyErrors);
  const breakpoints = useCPUStore((s) => s.breakpoints);
  const toggleBreakpoint = useCPUStore((s) => s.toggleBreakpoint);
  const fontSize = useUIStore((s) => s.fontSize);

  // Setup CodeMirror Tooltip Extension
  const tooltipExtension = hoverTooltip((view, pos) => {
    const { from, to, text } = view.state.doc.lineAt(pos);
    const lineText = text;
    const col = pos - from;

    // Extract word at hover position
    const words = lineText.slice(0, col).split(/[\s,]+/);
    const currentWordMatch = lineText.slice(col).match(/^[a-zA-Z0-9_]+/);
    const beforeWordMatch = lineText.slice(0, col).match(/[a-zA-Z0-9_]+$/);

    const fullWord = (beforeWordMatch ? beforeWordMatch[0] : '') + (currentWordMatch ? currentWordMatch[0] : '');
    const lower = fullWord.toLowerCase();

    if (lower in INSTRUCTION_TOOLTIPS) {
      const info = INSTRUCTION_TOOLTIPS[lower];
      return {
        pos: pos - (beforeWordMatch ? beforeWordMatch[0].length : 0),
        end: pos + (currentWordMatch ? currentWordMatch[0].length : 0),
        above: true,
        create() {
          const dom = document.createElement('div');
          dom.className = 'bg-slate-900 border border-sky-500/40 text-slate-100 p-2.5 rounded-lg shadow-2xl text-xs max-w-xs z-50 font-sans';
          dom.innerHTML = `
            <div class="font-bold text-sky-400 mb-1 flex items-center justify-between">
              <span>${info.name}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">Ch ${info.chapter}</span>
            </div>
            <p class="text-slate-300 mb-1.5 leading-relaxed">${info.description}</p>
            <div class="bg-slate-950 p-1 rounded text-slate-400 mb-1 font-mono text-[11px]">
              ${info.syntax.join('<br/>')}
            </div>
            <div class="text-[11px] text-amber-400 font-medium mb-1">
              <strong>Flags:</strong> ${info.flagsAffected}
            </div>
            <div class="text-[11px] text-emerald-400 italic">
              <strong>Tip:</strong> ${info.tip}
            </div>
          `;
          return { dom };
        },
      };
    }
    return null;
  });

  // Dark Theme CodeMirror styling
  const customTheme = EditorView.theme({
    '&': {
      backgroundColor: '#090d16',
      color: '#f8fafc',
      height: '100%',
      fontSize: 'var(--editor-font-size, 14px)',
      fontFamily: "'JetBrains Mono', Consolas, monospace",
    },
    '.cm-content': {
      caretColor: '#38bdf8',
      padding: '12px 0',
    },
    '.cm-line': {
      padding: '0 12px',
      lineHeight: '1.6',
    },
    '.cm-gutters': {
      backgroundColor: '#070a12',
      color: '#475569',
      borderRight: '1px solid #1e293b',
      paddingRight: '6px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#1e293b',
      color: '#38bdf8',
    },
    '.cm-activeLine': {
      backgroundColor: '#131d31',
    },
    // Syntax Token Colors
    '.cm-keyword': { color: '#38bdf8', fontWeight: 'bold' },
    '.cm-atom': { color: '#2dd4bf', fontWeight: '600' }, // Registers
    '.cm-number': { color: '#4ade80' },
    '.cm-string': { color: '#fb923c' },
    '.cm-comment': { color: '#64748b', fontStyle: 'italic' },
    '.cm-typeName': { color: '#c084fc', fontWeight: 'bold' },
    '.cm-variable-2': { color: '#facc15', fontWeight: 'bold' }, // Labels
  });

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: activeCode,
      extensions: [
        lineNumbers(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        masmLanguage,
        syntaxHighlighting(masmHighlightStyle),
        tooltipExtension,
        customTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newCode = update.state.doc.toString();
            setActiveCode(newCode);
            onCodeChange(newCode);
            PersistenceManager.saveCode(newCode);
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  // Update external code if changed (e.g. from examples menu or share URL)
  useEffect(() => {
    if (viewRef.current && initialCode !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: initialCode,
        },
      });
    }
  }, [initialCode]);

  // Update measurement and re-render line heights when font size changes
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.requestMeasure();
    }
  }, [fontSize]);

  return (
    <div className="relative h-full flex flex-col bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
      {/* Code Editor Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
          <span className="font-semibold text-slate-200">main.asm</span>
          <span className="text-[11px] text-slate-500">(MASM x86 IA-32)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          {currentExecutionLine && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Line {currentExecutionLine}
            </span>
          )}
          {assemblyErrors.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
              {assemblyErrors.length} error{assemblyErrors.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div
        className="relative flex-1 overflow-auto"
        ref={editorRef}
        style={{ '--editor-font-size': `${fontSize}px` } as React.CSSProperties}
      />

      {/* Assembly Errors Footer if present */}
      {assemblyErrors.length > 0 && (
        <div className="bg-rose-950/90 border-t border-rose-800 p-2.5 text-xs text-rose-200">
          <div className="font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
            <span>⚠ Assembly Error (Line {assemblyErrors[0].line}):</span>
          </div>
          <div className="font-mono text-rose-300">{assemblyErrors[0].message}</div>
          {assemblyErrors[0].suggestion && (
            <div className="text-amber-300 mt-1 italic font-sans">
              💡 {assemblyErrors[0].suggestion}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
