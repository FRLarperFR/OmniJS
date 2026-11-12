/**
 * OmniJS AST Tree & Compiled Multi-Target Bundle Inspector
 */

import React, { useState } from 'react';
import { Layers, FileCode, Check, Copy, Cpu, Database, Server, Monitor, Palette, Sparkles } from 'lucide-react';
import { OmniFileAST } from '../framework/parser';
import { CompilationResult } from '../framework/compiler';

interface AstInspectorProps {
  ast: OmniFileAST;
  compilation: CompilationResult;
}

export const AstInspector: React.FC<AstInspectorProps> = ({ ast, compilation }) => {
  const [viewMode, setViewMode] = useState<'ast' | 'bundles'>('bundles');
  const [selectedBundle, setSelectedBundle] = useState<'client' | 'server' | 'schema' | 'style' | 'test' | 'routes'>('client');
  const [copied, setCopied] = useState(false);

  const getBundleContent = () => {
    switch (selectedBundle) {
      case 'client':
        return compilation.clientCode;
      case 'server':
        return compilation.serverRouterCode;
      case 'schema':
        return compilation.schemaSql;
      case 'style':
        return compilation.scopedCss;
      case 'test':
        return compilation.testRunnerCode;
      case 'routes':
        return JSON.stringify(
          {
            version: '1.0.0',
            framework: 'omnijsfw',
            routes: compilation.routes && compilation.routes.length > 0
              ? compilation.routes
              : [
                  { path: '/', file: 'routes/index.page.omni', type: 'page', mode: 'hybrid' },
                  { path: '/products', file: 'routes/products.page.omni', type: 'page', mode: 'ssr' },
                  { path: '/cart', file: 'routes/cart.page.omni', type: 'page', mode: 'client' },
                  { path: '/admin', file: 'routes/admin.page.omni', type: 'page', mode: 'protected', role: 'admin' },
                ],
            rootLayout: 'routes/_layout.omni',
          },
          null,
          2
        );
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getBundleContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#090d16] text-slate-200">
      {/* Top Bar Switcher & Metrics */}
      <div className="h-10 px-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setViewMode('bundles')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'bundles' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Compiled Bundles
            </button>
            <button
              onClick={() => setViewMode('ast')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'ast' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              AST Tree
            </button>
          </div>
        </div>

        {/* Compilation Metrics */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>Client: <strong className="text-white">{(compilation.metrics.clientBytes / 1024).toFixed(1)} kB</strong></span>
          <span>·</span>
          <span>Gzip: <strong className="text-emerald-400">{(compilation.metrics.clientGzipEstimate / 1024).toFixed(1)} kB</strong></span>
          <span>·</span>
          <span>Compile Time: <strong className="text-sky-400">{compilation.metrics.compilationTimeMs}ms</strong></span>
        </div>
      </div>

      {viewMode === 'bundles' ? (
        /* Compiled Target Bundles */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Bundle Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-1 text-xs shrink-0 font-mono">
            {[
              { id: 'client', label: 'dist/client/app.js', icon: <Monitor className="w-3.5 h-3.5 text-amber-400" /> },
              { id: 'server', label: 'dist/server/router.js', icon: <Server className="w-3.5 h-3.5 text-sky-400" /> },
              { id: 'routes', label: 'dist/routes.manifest.json', icon: <Layers className="w-3.5 h-3.5 text-cyan-400" /> },
              { id: 'schema', label: 'dist/schema/schema.sql', icon: <Database className="w-3.5 h-3.5 text-emerald-400" /> },
              { id: 'style', label: 'dist/styles.css', icon: <Palette className="w-3.5 h-3.5 text-pink-400" /> },
              { id: 'test', label: 'dist/tests.js', icon: <Cpu className="w-3.5 h-3.5 text-purple-400" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedBundle(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition-colors ${
                  selectedBundle === tab.id
                    ? 'bg-slate-900 text-white font-semibold border-t border-x border-slate-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}

            <button
              onClick={handleCopy}
              className="ml-auto mb-1 px-2.5 py-1 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded flex items-center gap-1.5 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Bundle Code Viewer */}
          <pre className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed selection:bg-sky-500/30 selection:text-white">
            {getBundleContent()}
          </pre>
        </div>
      ) : (
        /* Visual AST Node Explorer */
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs space-y-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <Layers className="w-4 h-4" />
              <span>OmniProgram (File: {ast.fileName})</span>
            </div>
            <pre className="text-slate-300 text-[11px] overflow-x-auto bg-slate-950 p-4 rounded-lg">
              {JSON.stringify(
                {
                  type: 'OmniProgram',
                  fileName: ast.fileName,
                  isMultiFile: ast.isMultiFile,
                  multiFileType: ast.multiFileType,
                  schema: ast.schema
                    ? {
                        tables: ast.schema.tables.map((t) => ({ name: t.name, fields: t.fields })),
                        seeds: ast.schema.seeds.map((s) => ({ table: s.tableName, count: s.records.length })),
                      }
                    : null,
                  server: ast.server
                    ? {
                        authMode: ast.server.authMode,
                        procedures: ast.server.procedures.map((p) => ({ name: p.name, kind: p.kind, protection: p.protection })),
                        jobs: ast.server.jobs.map((j) => ({ name: j.name, event: j.eventOrSchedule })),
                      }
                    : null,
                  client: ast.client
                    ? {
                        signals: ast.client.signals,
                        queries: ast.client.queries,
                        mutations: ast.client.mutations,
                        hasForm: ast.client.hasForm,
                      }
                    : null,
                  diagnostics: ast.diagnostics,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
