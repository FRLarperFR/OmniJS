/**
 * OmniJS Global Command Palette (Ctrl+K / Cmd+K)
 * Fast keyboard-driven navigator across documentation, CLI commands, templates, and developer tools
 */

import React, { useState, useEffect } from 'react';
import { Search, Terminal, BookOpen, Code2, Cpu, Package, ListTodo, Play, ArrowRight, X, Sparkles } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (action: string) => void;
}

interface PaletteAction {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate('open-palette');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  if (!isOpen) return null;

  const actions: PaletteAction[] = [
    { id: 'mode-landing', category: 'Navigation', title: 'Open Framework Overview & Landing Page', subtitle: 'Architecture contrast, Bento innovations, and benchmarks', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'mode-docs', category: 'Navigation', title: 'Open Documentation & Guides', subtitle: 'Astro-grade portal with tutorials & API manual', icon: <BookOpen className="w-4 h-4 text-sky-400" /> },
    { id: 'mode-studio', category: 'Navigation', title: 'Open Developer Studio & IDE', subtitle: 'Multi-file code editor, live preview & telemetry', icon: <Code2 className="w-4 h-4 text-sky-400" /> },
    { id: 'open-terminal', category: 'Tooling', title: 'Open CLI Terminal', subtitle: 'Run omni dev, build, test, db:seed, routes', icon: <Terminal className="w-4 h-4 text-amber-400" /> },
    { id: 'open-tests', category: 'Tooling', title: 'Run Contract Test Suite', subtitle: 'Execute all <test> blocks with assertion traces', icon: <Play className="w-4 h-4 text-emerald-400" /> },
    { id: 'open-rpc', category: 'Tooling', title: 'Open RPC API Tester', subtitle: 'Directly test queries and mutations with JSON payloads', icon: <Play className="w-4 h-4 text-purple-400" /> },
    { id: 'template-multipage', category: 'Templates', title: 'Switch to OmniStore (Multi-Page App)', subtitle: 'File-based routing with routes/index, /products, /cart, /admin', icon: <Code2 className="w-4 h-4 text-sky-400" /> },
    { id: 'template-shoppulse', category: 'Templates', title: 'Switch to ShopPulse (Multi-File)', subtitle: 'schema.db.omni, products.server.omni, store.client.omni', icon: <Code2 className="w-4 h-4 text-emerald-400" /> },
    { id: 'template-tasksprint', category: 'Templates', title: 'Switch to TaskSprint (Single-File)', subtitle: 'Kanban board with optimistic UI in tasks.omni', icon: <Code2 className="w-4 h-4 text-amber-400" /> },
    { id: 'open-vscode', category: 'Integrations', title: 'VS Code Extension & MCP Server', subtitle: 'Download TextMate grammar and Claude/Cursor configs', icon: <Cpu className="w-4 h-4 text-sky-400" /> },
    { id: 'open-publish', category: 'Distribution', title: 'Publish to NPM via GitHub', subtitle: 'Automated CI/CD workflow and package archive', icon: <Package className="w-4 h-4 text-pink-400" /> },
    { id: 'open-status', category: 'Project', title: 'View Feature Tracker & Roadmap', subtitle: 'Check status of all 12 framework subsystems', icon: <ListTodo className="w-4 h-4 text-emerald-400" /> },
  ];

  const filtered = query
    ? actions.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      )
    : actions;

  const handleSelect = (actionId: string) => {
    onNavigate(actionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-2.5 bg-slate-900/50">
          <Search className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Type a command or search (e.g. docs, terminal, tests, template)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-500 font-sans"
          />
          <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 font-sans">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching actions found for &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((action) => (
              <button
                key={action.id}
                onClick={() => handleSelect(action.id)}
                className="w-full p-2.5 rounded-xl hover:bg-slate-900/80 transition-colors flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800 group-hover:border-slate-700">
                    {action.icon}
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      {action.title}
                    </h5>
                    <p className="text-[11px] text-slate-500">{action.subtitle}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                  {action.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
