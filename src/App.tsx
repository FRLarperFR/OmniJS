/**
 * OmniJS - Custom Full-Stack JS Framework, Astro-Grade Docs Portal & Developer Studio
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Terminal,
  Activity,
  Cpu,
  Package,
  BookOpen,
  Code2,
  Play,
  RotateCcw,
  Sparkles,
  Database,
  Monitor,
  CheckCircle2,
  Share2,
  ChevronDown
} from 'lucide-react';
import { TEMPLATES, OmniProjectTemplate } from './framework/templates';
import { parseOmniFile, OmniFileAST } from './framework/parser';
import { compileOmni, CompilationResult } from './framework/compiler';
import { virtualRuntime } from './framework/runtime';

import { DocumentationView } from './components/DocumentationView';
import { EditorView } from './components/EditorView';
import { CliTerminal } from './components/CliTerminal';
import { RuntimePreview } from './components/RuntimePreview';
import { WaterfallTrace } from './components/WaterfallTrace';
import { AstInspector } from './components/AstInspector';
import { DatabaseJobsView } from './components/DatabaseJobsView';
import { VsCodeMcpModal } from './components/VsCodeMcpModal';
import { NpmPublishModal } from './components/NpmPublishModal';

export default function App() {
  // Navigation Mode: docs vs studio
  const [appMode, setAppMode] = useState<'docs' | 'studio'>('docs');

  // Studio Active Tab
  const [studioTab, setStudioTab] = useState<'preview' | 'terminal' | 'waterfall' | 'bundles' | 'database'>('preview');

  // Active Project Template
  const [activeTemplateId, setActiveTemplateId] = useState<string>('shoppulse-multi');
  const currentTemplate = TEMPLATES.find((t) => t.id === activeTemplateId) || TEMPLATES[0];

  // Project Files state
  const [files, setFiles] = useState(currentTemplate.files);
  const [activeFileName, setActiveFileName] = useState(currentTemplate.defaultFile);

  // Modals
  const [isVscodeMcpOpen, setIsVscodeMcpOpen] = useState(false);
  const [isNpmPublishOpen, setIsNpmPublishOpen] = useState(false);

  // AST & Compilation
  const [ast, setAst] = useState<OmniFileAST>(() => {
    const file = currentTemplate.files.find((f) => f.name === currentTemplate.defaultFile) || currentTemplate.files[0];
    return parseOmniFile(file.content, file.name);
  });

  const [compilation, setCompilation] = useState<CompilationResult>(() => compileOmni(ast));

  // Initialize DB and compiler whenever template or files change
  const recompileActiveFile = (fileContent: string, fileName: string) => {
    const newAst = parseOmniFile(fileContent, fileName);
    const newComp = compileOmni(newAst);
    setAst(newAst);
    setCompilation(newComp);

    // If active file has schema, update virtual DB
    if (newAst.schema) {
      virtualRuntime.initDatabase(newAst);
    }
  };

  useEffect(() => {
    // When template changes, load its files
    setFiles(currentTemplate.files);
    setActiveFileName(currentTemplate.defaultFile);
    const primaryFile = currentTemplate.files.find((f) => f.name === currentTemplate.defaultFile) || currentTemplate.files[0];
    recompileActiveFile(primaryFile.content, primaryFile.name);

    // If multi-file, also feed schema file to runtime
    const schemaFile = currentTemplate.files.find((f) => f.name.includes('.db.') || f.type === 'db');
    if (schemaFile) {
      const schemaAst = parseOmniFile(schemaFile.content, schemaFile.name);
      virtualRuntime.initDatabase(schemaAst);
    }
  }, [activeTemplateId]);

  const handleSelectFile = (name: string) => {
    setActiveFileName(name);
    const f = files.find((file) => file.name === name);
    if (f) {
      recompileActiveFile(f.content, f.name);
    }
  };

  const handleUpdateFileContent = (name: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.name === name ? { ...f, content: newContent } : f))
    );
    if (name === activeFileName) {
      recompileActiveFile(newContent, name);
    }
  };

  const handleAddFile = (newFileName: string) => {
    let type: any = 'single';
    if (newFileName.endsWith('.db.omni')) type = 'db';
    else if (newFileName.endsWith('.server.omni')) type = 'server';
    else if (newFileName.endsWith('.client.omni')) type = 'client';
    else if (newFileName.endsWith('.style.omni')) type = 'style';
    else if (newFileName.endsWith('.test.omni')) type = 'test';

    const newFile = {
      name: newFileName,
      type,
      content: `// OmniJS Module: ${newFileName}\n`,
    };

    setFiles((prev) => [...prev, newFile]);
    handleSelectFile(newFileName);
  };

  const handleResetTemplate = () => {
    setFiles(currentTemplate.files);
    const primary = currentTemplate.files.find((f) => f.name === activeFileName) || currentTemplate.files[0];
    recompileActiveFile(primary.content, primary.name);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-sky-500/30">
      {/* Top Bar Navigation Contract: Brand - Nav - Action */}
      <header className="h-14 px-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-8 shrink-0 z-20">
        {/* Brand Zone: 1-line text wordmark in display face */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setAppMode('docs');
            }}
            className="text-lg font-extrabold tracking-tight text-white hover:text-sky-400 transition-colors flex items-center gap-2"
          >
            <span className="w-7 h-7 rounded-lg bg-sky-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-md shadow-sky-500/20">
              Ω
            </span>
            <span>OmniJS</span>
          </a>
          <span className="text-slate-600 font-mono text-xs hidden sm:inline">v1.0.0</span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-4 text-xs font-medium text-slate-400">
          <button
            onClick={() => setAppMode('docs')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              appMode === 'docs' ? 'bg-slate-900 text-sky-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Documentation</span>
          </button>

          <button
            onClick={() => setAppMode('studio')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              appMode === 'studio' ? 'bg-slate-900 text-sky-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer Studio</span>
          </button>

          <button
            onClick={() => setIsVscodeMcpOpen(true)}
            className="px-3 py-1.5 rounded-lg hover:text-slate-200 transition-colors whitespace-nowrap flex items-center gap-1.5 text-slate-400"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">VS Code &amp; MCP</span>
            <span className="md:hidden">MCP</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          {appMode === 'studio' && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono">
              <span className="text-slate-500 text-[10px] uppercase font-bold px-1.5">Template:</span>
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplateId(t.id)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors truncate max-w-[130px] ${
                    activeTemplateId === t.id
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.id === 'shoppulse-multi' ? 'ShopPulse (Multi)' : 'TaskSprint (Single)'}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setIsNpmPublishOpen(true)}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-sky-500 hover:bg-sky-400 rounded-lg transition-all shadow-md shadow-sky-500/20 whitespace-nowrap flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Publish to NPM</span>
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      {appMode === 'docs' ? (
        /* Astro.build-Style Documentation View */
        <DocumentationView
          onOpenInStudio={(snippet) => {
            if (snippet && activeFileName) {
              handleUpdateFileContent(activeFileName, snippet);
            }
            setAppMode('studio');
          }}
          onOpenMcp={() => setIsVscodeMcpOpen(true)}
          onOpenTerminal={() => {
            setAppMode('studio');
            setStudioTab('terminal');
          }}
        />
      ) : (
        /* Developer Studio Workspace */
        <div className="flex-1 flex overflow-hidden">
          {/* Left Split: Multi-File Code Editor */}
          <div className="w-1/2 flex flex-col border-r border-slate-800/80 overflow-hidden">
            <EditorView
              files={files}
              activeFileName={activeFileName}
              onSelectFile={handleSelectFile}
              onUpdateFileContent={handleUpdateFileContent}
              onAddFile={handleAddFile}
              ast={ast}
              onCompile={() => {
                const current = files.find((f) => f.name === activeFileName);
                if (current) recompileActiveFile(current.content, current.name);
              }}
              onResetTemplate={handleResetTemplate}
            />
          </div>

          {/* Right Split: Execution Workspace Tabs */}
          <div className="w-1/2 flex flex-col overflow-hidden bg-slate-950">
            {/* Right Pane Navigation Bar */}
            <div className="h-10 px-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-1">
                {[
                  { id: 'preview', label: 'App Preview', icon: <Monitor className="w-3.5 h-3.5" /> },
                  { id: 'terminal', label: 'CLI Terminal', icon: <Terminal className="w-3.5 h-3.5" /> },
                  { id: 'waterfall', label: 'Waterfall Trace', icon: <Activity className="w-3.5 h-3.5" /> },
                  { id: 'bundles', label: 'AST & Bundles', icon: <Layers className="w-3.5 h-3.5" /> },
                  { id: 'database', label: 'DB & Jobs', icon: <Database className="w-3.5 h-3.5" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStudioTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      studioTab === tab.id
                        ? 'bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Pane Active View */}
            <div className="flex-1 flex overflow-hidden">
              {studioTab === 'preview' && (
                <RuntimePreview
                  ast={ast}
                  onRefresh={() => {
                    const current = files.find((f) => f.name === activeFileName);
                    if (current) recompileActiveFile(current.content, current.name);
                  }}
                />
              )}

              {studioTab === 'terminal' && <CliTerminal ast={ast} />}

              {studioTab === 'waterfall' && <WaterfallTrace />}

              {studioTab === 'bundles' && (
                <AstInspector ast={ast} compilation={compilation} />
              )}

              {studioTab === 'database' && <DatabaseJobsView />}
            </div>
          </div>
        </div>
      )}

      {/* VS Code & MCP Modal */}
      <VsCodeMcpModal
        isOpen={isVscodeMcpOpen}
        onClose={() => setIsVscodeMcpOpen(false)}
      />

      {/* NPM & GitHub Publish Modal */}
      <NpmPublishModal
        isOpen={isNpmPublishOpen}
        onClose={() => setIsNpmPublishOpen(false)}
      />
    </div>
  );
}
