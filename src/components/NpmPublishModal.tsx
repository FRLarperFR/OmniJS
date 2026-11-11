/**
 * OmniJS NPM & GitHub Publishing Suite
 * Provides repository export, GitHub Actions CI workflow, and publish checklist
 */

import React, { useState } from 'react';
import { Download, Copy, Check, X, Package, Github, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { generateNpmPackageFiles } from '../framework/npmPackage';

interface NpmPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NpmPublishModal: React.FC<NpmPublishModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('package.json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pkgFiles = generateNpmPackageFiles();
  const currentFile = pkgFiles.find((f) => f.path === selectedFile) || pkgFiles[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    let combined = `// ========================================================\n// OmniJS Full-Stack Framework - NPM Package Repository\n// Package: omnijsfw | License: MIT\n// ========================================================\n\n`;
    for (const f of pkgFiles) {
      combined += `// File: ${f.path}\n// --------------------------------------------------------\n${f.content}\n\n`;
    }

    const blob = new Blob([combined], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omnijsfw-npm-package.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Publish to NPM using GitHub</h3>
              <span className="text-[11px] text-slate-400">Package: omnijsfw · Dual ESM/CJS &amp; CLI</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Repository Bundle
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* File List */}
          <div className="w-56 border-r border-slate-800 bg-slate-950/80 p-3 space-y-1 shrink-0 font-mono text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
              Package Files
            </span>
            {pkgFiles.map((f) => (
              <button
                key={f.path}
                onClick={() => setSelectedFile(f.path)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors truncate ${
                  selectedFile === f.path
                    ? 'bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {f.path}
              </button>
            ))}

            {/* Publishing Steps Card */}
            <div className="mt-6 p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-[11px] font-sans">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                NPM Provenance
              </span>
              <p className="text-slate-400 text-[10px] leading-tight">
                Includes automated GitHub Actions workflow with OIDC provenance authentication.
              </p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#090d16]">
            <div className="h-10 px-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">{currentFile.path}</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 selection:bg-sky-500/30">
              {currentFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
