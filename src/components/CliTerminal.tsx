/**
 * OmniJS Interactive CLI Terminal Emulator
 * Supports command history, TAB completion, ANSI-color formatting, and real execution
 */

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft, Trash2, HelpCircle, Check, Copy } from 'lucide-react';
import { executeOmniCli, CliExecutionResult } from '../framework/cli';
import { OmniFileAST } from '../framework/parser';

interface CliTerminalProps {
  ast: OmniFileAST;
}

const COMMON_COMMANDS = [
  'omni dev --hmr',
  'omni build',
  'omni test',
  'omni routes',
  'omni db:seed',
  'omni db:migrate',
  'omni jobs:list',
  'omni lint',
  'omni mcp',
  'omni lsp',
  'omni help',
  'clear',
];

export const CliTerminal: React.FC<CliTerminalProps> = ({ ast }) => {
  const [history, setHistory] = useState<string[]>([
    '\x1b[1m\x1b[36mOmniJS Developer Terminal v1.0.0\x1b[0m',
    'Type \x1b[32momni help\x1b[0m or use the quick buttons below to run commands.',
    'TAB for auto-completion. UP/DOWN for history.',
    '',
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleRunCommand = async (cmdToRun: string) => {
    const trimmed = cmdToRun.trim();
    if (!trimmed) return;

    if (trimmed === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    }

    setHistory((prev) => [...prev, `\x1b[36m$\x1b[0m ${trimmed}`]);
    setCommandHistory((prev) => [trimmed, ...prev]);
    setHistoryIdx(-1);
    setInputVal('');
    setIsRunning(true);

    try {
      const res = await executeOmniCli(trimmed, ast);
      setHistory((prev) => [...prev, ...res.stdout, ...res.stderr, '']);
    } catch (err: any) {
      setHistory((prev) => [...prev, `\x1b[31mError: ${err.message}\x1b[0m`, '']);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRunCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIdx < commandHistory.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete match
      const match = COMMON_COMMANDS.find((cmd) => cmd.startsWith(inputVal));
      if (match) {
        setInputVal(match);
      }
    }
  };

  // Convert simple ANSI color codes to styled HTML spans
  const renderAnsiLine = (line: string, index: number) => {
    // Regex for basic ANSI colors
    // 31m = red, 32m = green, 33m = yellow, 34m = blue, 36m = cyan, 1m = bold, 2m = dim, 0m = reset
    const parts = line.split(/(\x1b\[[0-9;]*m)/);
    let currentColor = 'text-slate-300';
    let isBold = false;
    let isDim = false;

    return (
      <div key={index} className="leading-5 whitespace-pre-wrap font-mono">
        {parts.map((part, pIdx) => {
          if (part === '\x1b[0m') {
            currentColor = 'text-slate-300';
            isBold = false;
            isDim = false;
            return null;
          } else if (part === '\x1b[31m') {
            currentColor = 'text-red-400';
            return null;
          } else if (part === '\x1b[32m') {
            currentColor = 'text-emerald-400';
            return null;
          } else if (part === '\x1b[33m') {
            currentColor = 'text-amber-400';
            return null;
          } else if (part === '\x1b[34m') {
            currentColor = 'text-blue-400';
            return null;
          } else if (part === '\x1b[36m') {
            currentColor = 'text-sky-400';
            return null;
          } else if (part === '\x1b[1m') {
            isBold = true;
            return null;
          } else if (part === '\x1b[2m') {
            isDim = true;
            return null;
          }

          if (!part) return null;

          return (
            <span
              key={pIdx}
              className={`${currentColor} ${isBold ? 'font-bold' : ''} ${isDim ? 'opacity-60' : ''}`}
            >
              {part}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#090d16] text-slate-200">
      {/* Terminal Toolbar */}
      <div className="h-10 px-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-sky-400" />
          <span className="font-mono font-semibold text-slate-300">OmniJS Terminal</span>
          <span className="text-slate-500 text-[11px]">(Node.js &amp; In-Browser CLI)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistory([])}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Action Badges */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-900 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
        <span className="text-slate-500 mr-1 font-semibold uppercase text-[10px]">Run:</span>
        {COMMON_COMMANDS.slice(0, 8).map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleRunCommand(cmd)}
            disabled={isRunning}
            className="px-2 py-0.5 rounded font-mono bg-slate-900 border border-slate-800 hover:border-sky-500 hover:text-sky-300 text-slate-400 whitespace-nowrap transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Output Log */}
      <div
        className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-0.5 selection:bg-sky-500/30 selection:text-white cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, idx) => renderAnsiLine(line, idx))}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Command Input Prompt */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 flex items-center gap-2 shrink-0">
        <span className="text-sky-400 font-mono font-bold text-xs select-none">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="omni dev, omni build, omni test, omni routes..."
          disabled={isRunning}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-slate-100 placeholder:text-slate-600"
        />
        <button
          onClick={() => handleRunCommand(inputVal)}
          disabled={isRunning || !inputVal.trim()}
          className="p-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 rounded disabled:opacity-30 transition-colors"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
