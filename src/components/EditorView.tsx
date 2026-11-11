/**
 * OmniJS Multi-File Project Explorer & Multi-Block Code Editor
 * Fully responsive with collapsible file tree, quick snippets, and syntax diagnostics
 */

import React, { useState } from 'react';
import {
  FileCode,
  FilePlus,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  Server,
  Monitor,
  Palette,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { OmniFileAST } from '../framework/parser';
import { OmniProjectFile } from '../framework/templates';

interface EditorViewProps {
  files: OmniProjectFile[];
  activeFileName: string;
  onSelectFile: (name: string) => void;
  onUpdateFileContent: (name: string, newContent: string) => void;
  onAddFile: (name: string) => void;
  ast: OmniFileAST;
  onCompile: () => void;
  onResetTemplate: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  files,
  activeFileName,
  onSelectFile,
  onUpdateFileContent,
  onAddFile,
  ast,
  onCompile,
  onResetTemplate,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeFile = files.find((f) => f.name === activeFileName) || files[0];

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    let name = newFileName.trim();
    if (!name.endsWith('.omni')) name += '.omni';
    onAddFile(name);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile?.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertSnippet = (snippet: string) => {
    if (!activeFile) return;
    const updated = activeFile.content + '\n\n' + snippet;
    onUpdateFileContent(activeFile.name, updated);
  };

  const lineCount = (activeFile?.content || '').split('\n').length;

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950 text-slate-100 border-r border-slate-800/80">
      {/* File Explorer Sidebar */}
      {isSidebarOpen && (
        <div className="w-48 sm:w-56 border-r border-slate-800/80 bg-slate-950/80 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Files
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCreatingFile(!isCreatingFile)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                title="Create new .omni file"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 sm:hidden"
                title="Close file tree"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isCreatingFile && (
            <form onSubmit={handleCreateFileSubmit} className="p-2 border-b border-slate-800 bg-slate-900/50">
              <input
                type="text"
                placeholder="e.g. auth.server.omni"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </form>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {files.map((file) => {
              const isActive = file.name === activeFileName;
              let icon = <FileCode className="w-3.5 h-3.5 text-slate-400" />;
              if (file.name.includes('.db.')) icon = <Database className="w-3.5 h-3.5 text-emerald-400" />;
              else if (file.name.includes('.server.')) icon = <Server className="w-3.5 h-3.5 text-sky-400" />;
              else if (file.name.includes('.client.')) icon = <Monitor className="w-3.5 h-3.5 text-amber-400" />;
              else if (file.name.includes('.style.')) icon = <Palette className="w-3.5 h-3.5 text-pink-400" />;
              else if (file.name.includes('.test.')) icon = <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />;

              return (
                <button
                  key={file.name}
                  onClick={() => onSelectFile(file.name)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-mono transition-colors text-left truncate ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-300 font-semibold border border-sky-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {icon}
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Snippets */}
          <div className="p-2.5 border-t border-slate-800 bg-slate-900/40 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              + Snippet
            </span>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <button
                onClick={() =>
                  handleInsertSnippet(`query getFeed({ limit = 10 }) {\n  return db.Product.findMany({ limit });\n}`)
                }
                className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate"
              >
                + Query
              </button>
              <button
                onClick={() =>
                  handleInsertSnippet(`mutation updateStatus({ id, status }) @protect(role: "user") {\n  return db.Task.update(id, { status });\n}`)
                }
                className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate"
              >
                + Mutation
              </button>
              <button
                onClick={() =>
                  handleInsertSnippet(`table NewModel {\n  id: uuid @primary @auto\n  title: string @min(2)\n}`)
                }
                className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate"
              >
                + Table
              </button>
              <button
                onClick={() =>
                  handleInsertSnippet(`job onEvent("order:sync", async (data) => {\n  console.log("Job executed", data);\n});`)
                }
                className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-left truncate"
              >
                + Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Toolbar */}
        <div className="h-10 px-3 sm:px-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs shrink-0 gap-2">
          <div className="flex items-center gap-2 font-mono truncate">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800"
                title="Open file tree"
              >
                <PanelLeftOpen className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="font-semibold text-slate-200 truncate">{activeFile?.name}</span>
            <span className="text-slate-500 hidden sm:inline">·</span>
            <span className="text-slate-400 hidden sm:inline">{lineCount} lines</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleCopyCode}
              className="px-2 py-1 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={onResetTemplate}
              className="p-1 sm:px-2 py-1 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded flex items-center gap-1 text-[11px]"
              title="Reset code"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={onCompile}
              className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded flex items-center gap-1 text-xs shadow-sm"
            >
              <Play className="w-3 h-3" />
              <span>Compile</span>
            </button>
          </div>
        </div>

        {/* Code Input Area with line numbers */}
        <div className="flex-1 flex overflow-hidden font-mono text-xs bg-[#07090e]">
          {/* Line Numbers */}
          <div className="w-10 sm:w-12 py-3 bg-slate-950/40 select-none text-right pr-2.5 sm:pr-3 text-slate-600 border-r border-slate-900 overflow-hidden shrink-0">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="leading-5 tabular-nums">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={activeFile?.content || ''}
            onChange={(e) => onUpdateFileContent(activeFile.name, e.target.value)}
            spellCheck={false}
            className="flex-1 p-3 bg-transparent text-slate-200 outline-none resize-none leading-5 font-mono overflow-y-auto whitespace-pre selection:bg-sky-500/30 selection:text-white"
          />
        </div>

        {/* Diagnostics & Errors Bar */}
        {ast.diagnostics.length > 0 && (
          <div className="p-2 sm:p-2.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 truncate">
              {ast.diagnostics[0].severity === 'error' ? (
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="text-slate-300 font-mono truncate text-[11px]">
                {ast.diagnostics[0].message}
              </span>
            </div>
            <span className="text-slate-500 text-[10px] shrink-0 font-mono">
              {ast.diagnostics.length} diagnostic{ast.diagnostics.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
