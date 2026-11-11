/**
 * OmniJS Official VS Code Extension & MCP Knowledge Base Hub Modal
 */

import React, { useState } from 'react';
import {
  Code2,
  Cpu,
  Copy,
  Check,
  Download,
  X,
  FileCode,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import {
  generateTextMateGrammar,
  generateLanguageConfiguration,
  generateSnippets,
  generateVsCodePackageJson
} from '../framework/vscode';
import {
  MCP_RESOURCES,
  MCP_TOOLS,
  generateClaudeDesktopConfig,
  generateCursorMcpConfig
} from '../framework/mcp';

interface VsCodeMcpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VsCodeMcpModal: React.FC<VsCodeMcpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'vscode' | 'mcp'>('vscode');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadVsCodeZip = () => {
    // Generate text content for download
    const pkg = generateVsCodePackageJson();
    const grammar = generateTextMateGrammar();
    const config = generateLanguageConfiguration();
    const snippets = generateSnippets();

    const fullBlob = new Blob([
      `// OmniJS VS Code Extension Assets\n// Save files in extension directory\n\n=== package.json ===\n${pkg}\n\n=== syntaxes/omni.tmLanguage.json ===\n${grammar}\n\n=== language-configuration.json ===\n${config}\n\n=== snippets/omni.json ===\n${snippets}`
    ], { type: 'text/plain' });

    const url = URL.createObjectURL(fullBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omni-vscode-extension.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('vscode')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'vscode' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>VS Code Extension</span>
              </button>
              <button
                onClick={() => setActiveTab('mcp')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'mcp' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>MCP Knowledge Base</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'vscode' ? (
            /* VS Code Extension Tab */
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-sky-400" />
                    Official OmniJS VS Code &amp; Cursor Extension
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Adds complete syntax highlighting for <code>.omni</code> multi-block components, bracket matching, folding rules, and snippets.
                  </p>
                </div>

                <button
                  onClick={handleDownloadVsCodeZip}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 shadow"
                >
                  <Download className="w-4 h-4" />
                  Download Extension Bundle
                </button>
              </div>

              {/* TextMate Grammar Preview */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-semibold text-slate-300">
                    syntaxes/omni.tmLanguage.json
                  </span>
                  <button
                    onClick={() => handleCopy(generateTextMateGrammar(), 'tm-grammar')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedId === 'tm-grammar' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'tm-grammar' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-52">
                  {generateTextMateGrammar()}
                </pre>
              </div>

              {/* Snippets Preview */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-semibold text-slate-300">
                    snippets/omni.json
                  </span>
                  <button
                    onClick={() => handleCopy(generateSnippets(), 'snippets')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedId === 'snippets' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'snippets' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-40">
                  {generateSnippets()}
                </pre>
              </div>
            </div>
          ) : (
            /* Model Context Protocol (MCP) Tab */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-400" />
                  Model Context Protocol (MCP) Knowledge Base Server
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connect your AI coding tools (Claude Desktop, Cursor, Zed) directly to the OmniJS compiler, schema inspector, and test suite.
                </p>
              </div>

              {/* Claude Desktop Config */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">
                    Claude Desktop Configuration (<code>claude_desktop_config.json</code>)
                  </span>
                  <button
                    onClick={() => handleCopy(generateClaudeDesktopConfig(), 'claude-cfg')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedId === 'claude-cfg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'claude-cfg' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {generateClaudeDesktopConfig()}
                </pre>
              </div>

              {/* Cursor Config */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">
                    Cursor IDE Configuration (<code>.cursor/mcp.json</code>)
                  </span>
                  <button
                    onClick={() => handleCopy(generateCursorMcpConfig(), 'cursor-cfg')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedId === 'cursor-cfg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'cursor-cfg' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {generateCursorMcpConfig()}
                </pre>
              </div>

              {/* MCP Resources & Tools Listing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Exposed MCP Resources</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                    {MCP_RESOURCES.map((r) => (
                      <li key={r.uri} className="truncate">
                        • <span className="text-slate-200">{r.uri}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Exposed MCP Tools</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                    {MCP_TOOLS.map((t) => (
                      <li key={t.name} className="truncate">
                        • <span className="text-slate-200">{t.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
