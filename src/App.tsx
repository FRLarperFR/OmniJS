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
  ChevronDown,
  Menu,
  X,
  ListTodo,
  ExternalLink
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
import { TestRunnerView } from './components/TestRunnerView';
import { VsCodeMcpModal } from './components/VsCodeMcpModal';
import { NpmPublishModal } from './components/NpmPublishModal';

export default function App() {
  // Navigation Mode: docs vs studio
  const [appMode, setAppMode] = useState<'docs' | 'studio'>('docs');

  // Studio Active Tab
  const [studioTab, setStudioTab] = useState<'preview' | 'terminal' | 'tests' | 'waterfall' | 'bundles' | 'database'>('preview');

  // Mobile Studio View: 'editor' vs 'tools'
  const [mobileStudioView, setMobileStudioView] = useState<'editor' | 'tools'>('editor');

  // Mobile Header Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active Project Template
  const [activeTemplateId, setActiveTemplateId] = useState<string>('shoppulse-multi');
  const currentTemplate = TEMPLATES.find((t) => t.id === activeTemplateId) || TEMPLATES[0];

  // Project Files state
  const [files, setFiles] = useState(currentTemplate.files);
  const [activeFileName, setActiveFileName] = useState(currentTemplate.defaultFile);

  // Modals
  const [isVscodeMcpOpen, setIsVscodeMcpOpen] = useState(false);
  const [isNpmPublishOpen, setIsNpmPublishOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

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

    if (newAst.schema) {
      virtualRuntime.initDatabase(newAst);
    }
  };

  useEffect(() => {
    setFiles(currentTemplate.files);
    setActiveFileName(currentTemplate.defaultFile);
    const primaryFile = currentTemplate.files.find((f) => f.name === currentTemplate.defaultFile) || currentTemplate.files[0];
    recompileActiveFile(primaryFile.content, primaryFile.name);

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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#07090e] text-slate-100 font-sans selection:bg-sky-500/30">
      {/* Top Bar Navigation: Clean 3-zone contract */}
      <header className="h-14 px-4 sm:px-6 border-b border-slate-800/80 bg-slate-950/95 flex items-center justify-between gap-4 sm:gap-8 shrink-0 z-30 backdrop-blur">
        {/* Zone 1: 1-line text wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setAppMode('docs');
            }}
            className="text-lg font-black tracking-tight text-white hover:text-sky-400 transition-colors flex items-center gap-2"
          >
            <span className="w-7 h-7 rounded-lg bg-sky-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-md shadow-sky-500/20">
              Ω
            </span>
            <span>OmniJS</span>
          </a>
          <span className="text-slate-500 font-mono text-[11px] hidden md:inline">v1.0.0</span>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-4 text-xs font-medium text-slate-400">
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
            <span>VS Code &amp; MCP</span>
          </button>

          <button
            onClick={() => setIsStatusOpen(true)}
            className="px-3 py-1.5 rounded-lg hover:text-slate-200 transition-colors whitespace-nowrap flex items-center gap-1.5 text-slate-400"
          >
            <ListTodo className="w-3.5 h-3.5 text-emerald-400" />
            <span>Feature Tracker</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {appMode === 'studio' && (
            <div className="hidden xl:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono">
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
            className="px-3 sm:px-4 py-2 text-xs font-bold text-slate-950 bg-sky-500 hover:bg-sky-400 rounded-lg transition-all shadow-md shadow-sky-500/20 whitespace-nowrap flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Publish NPM</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 p-4 space-y-3 z-30 shrink-0">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              onClick={() => {
                setAppMode('docs');
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg flex items-center gap-2 ${
                appMode === 'docs' ? 'bg-sky-500/10 text-sky-400 font-bold' : 'bg-slate-900 text-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Documentation</span>
            </button>

            <button
              onClick={() => {
                setAppMode('studio');
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-lg flex items-center gap-2 ${
                appMode === 'studio' ? 'bg-sky-500/10 text-sky-400 font-bold' : 'bg-slate-900 text-slate-300'
              }`}
            >
              <Code2 className="w-4 h-4 text-sky-400" />
              <span>Studio &amp; IDE</span>
            </button>

            <button
              onClick={() => {
                setIsVscodeMcpOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-slate-900 text-slate-300 flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>VS Code &amp; MCP</span>
            </button>

            <button
              onClick={() => {
                setIsStatusOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-slate-900 text-slate-300 flex items-center gap-2"
            >
              <ListTodo className="w-4 h-4 text-emerald-400" />
              <span>Tracked Features</span>
            </button>
          </div>

          {appMode === 'studio' && (
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Template:</span>
              <div className="flex gap-2 text-xs font-mono">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTemplateId(t.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex-1 py-1.5 rounded text-center truncate ${
                      activeTemplateId === t.id
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {t.id === 'shoppulse-multi' ? 'ShopPulse' : 'TaskSprint'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Responsive Mobile Tab Switcher (< lg screens) */}
          <div className="lg:hidden h-10 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs shrink-0 font-medium">
            <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setMobileStudioView('editor')}
                className={`px-3 py-1 rounded transition-colors ${
                  mobileStudioView === 'editor' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Code Editor
              </button>
              <button
                onClick={() => setMobileStudioView('tools')}
                className={`px-3 py-1 rounded transition-colors ${
                  mobileStudioView === 'tools' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Runtime &amp; Tools
              </button>
            </div>

            {mobileStudioView === 'tools' && (
              <select
                value={studioTab}
                onChange={(e) => setStudioTab(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded px-2 py-1 outline-none font-mono"
              >
                <option value="preview">Live Preview</option>
                <option value="terminal">CLI Terminal</option>
                <option value="tests">Contract Tests</option>
                <option value="waterfall">Waterfall Trace</option>
                <option value="bundles">AST &amp; Bundles</option>
                <option value="database">DB &amp; Jobs</option>
              </select>
            )}
          </div>

          {/* Left Split: Multi-File Code Editor */}
          <div
            className={`w-full lg:w-1/2 flex flex-col border-r border-slate-800/80 overflow-hidden ${
              mobileStudioView === 'tools' ? 'hidden lg:flex' : 'flex'
            }`}
          >
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
          <div
            className={`w-full lg:w-1/2 flex flex-col overflow-hidden bg-slate-950 ${
              mobileStudioView === 'editor' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Right Pane Navigation Bar (Desktop) */}
            <div className="hidden lg:flex h-10 px-4 border-b border-slate-800 bg-slate-950/80 items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-1">
                {[
                  { id: 'preview', label: 'App Preview', icon: <Monitor className="w-3.5 h-3.5" /> },
                  { id: 'terminal', label: 'CLI Terminal', icon: <Terminal className="w-3.5 h-3.5" /> },
                  { id: 'tests', label: 'Contract Tests', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
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

              {studioTab === 'tests' && <TestRunnerView ast={ast} />}

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

      {/* Feature Tracking & Status Modal */}
      {isStatusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">OmniJS Implementation Status &amp; Tracker</h3>
              </div>
              <button onClick={() => setIsStatusOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { title: 'Unified .omni Grammar & Lexer Parser', desc: 'Custom multi-block parser extracting <schema>, <server>, <client>, <style>, <test>', status: 'Complete' },
                { title: 'Modular Multi-File Support', desc: 'Support for *.db.omni, *.server.omni, *.client.omni, *.style.omni, *.test.omni with cross-file imports', status: 'Complete' },
                { title: 'Multi-Target Compiler Engine', desc: 'Compiles to Client JS, Node.js RPC router, ANSI SQL schema DDL, and scoped CSS tokens', status: 'Complete' },
                { title: 'Compile-Time Secret Leak Protection', desc: 'Static analysis preventing database keys and server secrets from leaking into client bundles', status: 'Complete' },
                { title: 'Virtual Full-Stack Runtime', desc: 'In-memory database, RPC network simulation, and optimistic mutations with rollback', status: 'Complete' },
                { title: 'Background Job & Cron Queue', desc: 'Zero-dependency in-process worker queue with execution timing and logs', status: 'Complete' },
                { title: 'Interactive CLI Terminal Emulator', desc: 'Built-in terminal running omni dev, build, test, routes, db:seed, mcp, lsp with history & TAB completion', status: 'Complete' },
                { title: 'Full-Stack Waterfall Telemetry', desc: 'Request profiler mapping Client Signal → RPC Transit → Server Route → DB Query → DOM Update', status: 'Complete' },
                { title: 'Astro-Grade Documentation & Tutorial', desc: 'Full docs portal with taxonomy, tabbed package managers, rich aside callouts, and runnable code', status: 'Complete' },
                { title: 'VS Code Extension Suite', desc: 'TextMate grammar (syntaxes/omni.tmLanguage.json), language-configuration.json, and snippets', status: 'Complete' },
                { title: 'Model Context Protocol (MCP) Server', desc: 'Native omni mcp server with tools and resources for Claude Desktop, Cursor, and Zed', status: 'Complete' },
                { title: 'Automated GitHub & NPM Publishing', desc: 'Automated .github/workflows/npm-publish.yml and one-click repository package export', status: 'Complete' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-200">{item.title}</h4>
                    <p className="text-slate-400 mt-0.5 text-[11px]">{item.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsStatusOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Close Tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
