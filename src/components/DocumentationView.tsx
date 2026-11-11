/**
 * Astro.build-Style Official Documentation & Interactive Tutorial Portal for OmniJS
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Terminal,
  Layers,
  Shield,
  Zap,
  Cpu,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Flame,
  ArrowRight,
  Sparkles,
  Search,
  Sliders,
  Play
} from 'lucide-react';

interface DocSection {
  id: string;
  category: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

interface DocumentationViewProps {
  onOpenInStudio: (codeSnippet?: string) => void;
  onOpenMcp: () => void;
  onOpenTerminal: () => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  onOpenInStudio,
  onOpenMcp,
  onOpenTerminal,
}) => {
  const [activeDocId, setActiveDocId] = useState<string>('why-omni');
  const [packageManager, setPackageManager] = useState<'npm' | 'pnpm' | 'yarn' | 'bun'>('npm');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const docs: DocSection[] = [
    {
      id: 'why-omni',
      category: 'Getting Started',
      title: 'Why OmniJS?',
      description: 'The philosophy of full-stack JavaScript unification.',
      content: (
        <div className="space-y-6">
          <p className="text-base text-slate-300 leading-relaxed">
            In modern web engineering, building even a simple feature requires touching a database migration, an ORM schema, an API route handler, client data-fetching hooks, global state stores, CSS modules, and unit tests across six separate folders.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="p-4 bg-slate-900 border border-red-900/30 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Traditional Fragmented Stack</span>
              <p className="text-xs text-slate-400">
                Schema in <code>prisma/schema.prisma</code>, API in <code>pages/api/route.ts</code>, Client in <code>components/Store.tsx</code>, Styles in <code>styles/store.module.css</code>, Tests in <code>tests/store.test.ts</code>. High context-switching cost and typing friction.
              </p>
            </div>
            <div className="p-4 bg-slate-900 border border-emerald-900/40 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">OmniJS Unified Architecture</span>
              <p className="text-xs text-slate-400">
                Single cohesive <code>.omni</code> component: <code>&lt;schema&gt;</code>, <code>&lt;server&gt;</code>, <code>&lt;client&gt;</code>, <code>&lt;style&gt;</code>, and <code>&lt;test&gt;</code> co-located with zero boilerplate and compile-time isolation.
              </p>
            </div>
          </div>

          <div className="p-4 bg-sky-950/30 border border-sky-800/40 rounded-xl">
            <h4 className="text-sm font-semibold text-sky-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Core Invariants of OmniJS
            </h4>
            <ul className="mt-2 text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li><strong>Zero Glue Code:</strong> Client blocks call server procedures directly with <code>useQuery</code> and <code>useMutation</code>.</li>
              <li><strong>Secret Isolation:</strong> Database credentials and private keys in <code>&lt;server&gt;</code> can never accidentally leak into client bundles.</li>
              <li><strong>Block-Level HMR:</strong> Modify styles or templates without wiping server in-memory database records.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'quickstart',
      category: 'Getting Started',
      title: 'Installation & Quickstart',
      description: 'Get an OmniJS project up and running in under 60 seconds.',
      content: (
        <div className="space-y-6">
          <div className="p-3.5 bg-sky-950/30 border border-sky-500/20 rounded-xl text-xs space-y-1">
            <span className="font-semibold text-sky-400">Prerequisites</span>
            <p className="text-slate-300">
              OmniJS requires <strong>Node.js 22 LTS</strong> (v22.x or later) and npm 10+. Verify your environment with <code className="text-sky-300 font-mono">node -v</code>.
            </p>
          </div>

          <p className="text-sm text-slate-300">
            Scaffold a fresh full-stack application using the official OmniJS CLI:
          </p>

          {/* Tabbed Package Manager */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            <div className="flex border-b border-slate-800 bg-slate-900/60 px-2 pt-2 gap-1 text-xs">
              {(['npm', 'pnpm', 'yarn', 'bun'] as const).map((pm) => (
                <button
                  key={pm}
                  onClick={() => setPackageManager(pm)}
                  className={`px-3 py-1.5 rounded-t-lg font-mono font-medium transition-colors ${
                    packageManager === pm
                      ? 'bg-slate-950 text-sky-400 border-t border-x border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
            <div className="p-4 flex justify-between items-center font-mono text-xs text-slate-200">
              <code>
                {packageManager === 'npm' && 'npx omnijsfw create my-fullstack-app'}
                {packageManager === 'pnpm' && 'pnpm dlx omnijsfw create my-fullstack-app'}
                {packageManager === 'yarn' && 'yarn dlx omnijsfw create my-fullstack-app'}
                {packageManager === 'bun' && 'bunx omnijsfw create my-fullstack-app'}
              </code>
              <button
                onClick={() =>
                  copyToClipboard(
                    packageManager === 'npm'
                      ? 'npx omnijsfw create my-fullstack-app'
                      : `${packageManager} dlx omnijsfw create my-fullstack-app`,
                    'install-cmd'
                  )
                }
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                {copiedCode === 'install-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-300">Start the development server with Hot Module Replacement:</p>

          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950 flex justify-between items-center font-mono text-xs text-slate-200">
            <code>npx omni dev --hmr</code>
            <button
              onClick={() => copyToClipboard('npx omni dev --hmr', 'dev-cmd')}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              {copiedCode === 'dev-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => onOpenInStudio()}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              Try Live in OmniJS Studio
            </button>
            <button
              onClick={onOpenTerminal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg flex items-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5" />
              Open Interactive Terminal
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'syntax-guide',
      category: 'Core Concepts',
      title: 'The .omni File Format & Grammar',
      description: 'Understanding <schema>, <server>, <client>, <style>, and <test> blocks.',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">
            An <code>.omni</code> file is divided into five typed, first-class blocks:
          </p>

          <div className="space-y-4">
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50">
              <h4 className="text-sm font-semibold text-emerald-400 font-mono">&lt;schema&gt;</h4>
              <p className="text-xs text-slate-400 mt-1">
                Declares database tables with directives (<code>@primary</code>, <code>@auto</code>, <code>@unique</code>, <code>@min</code>, <code>@indexed</code>), relational arrows (<code>-&gt; User.id</code>), and initial seed data.
              </p>
            </div>

            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50">
              <h4 className="text-sm font-semibold text-sky-400 font-mono">&lt;server auth="optional"&gt;</h4>
              <p className="text-xs text-slate-400 mt-1">
                Defines first-class <code>query</code> and <code>mutation</code> procedures with role protection (<code>@protect</code>), background workers (<code>job</code>), and scheduled tasks (<code>cron</code>).
              </p>
            </div>

            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50">
              <h4 className="text-sm font-semibold text-amber-400 font-mono">&lt;client&gt;</h4>
              <p className="text-xs text-slate-400 mt-1">
                Reactive UI components using signals (<code>$state</code>, <code>$derived</code>), RPC hooks (<code>$query</code>, <code>$mutation</code>), two-way input binding (<code>bind:value</code>), and auto-validated forms.
              </p>
            </div>

            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50">
              <h4 className="text-sm font-semibold text-pink-400 font-mono">&lt;style scoped&gt;</h4>
              <p className="text-xs text-slate-400 mt-1">
                CSS scoped to the component with built-in design token variables (<code>$surface</code>, <code>$primary</code>, <code>$border</code>, <code>$radius</code>) and responsive mixins (<code>@mobile</code>).
              </p>
            </div>

            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50">
              <h4 className="text-sm font-semibold text-purple-400 font-mono">&lt;test&gt;</h4>
              <p className="text-xs text-slate-400 mt-1">
                BDD automated contract tests running against both the client UI and server RPC procedures.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'multi-file',
      category: 'Guides & Deep Dives',
      title: 'Modular Multi-File Architecture',
      description: 'Scaling large applications with *.db.omni, *.server.omni, and *.client.omni.',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">
            For larger teams or enterprise repositories, OmniJS supports dedicated domain files instead of a single file:
          </p>

          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950 font-mono text-xs space-y-1 text-slate-300">
            <div className="text-slate-500">// Directory layout:</div>
            <div>├── schema.db.omni        <span className="text-slate-500"># Tables, relations & seeds</span></div>
            <div>├── products.server.omni  <span className="text-slate-500"># RPC queries & mutations</span></div>
            <div>├── storefront.client.omni<span className="text-slate-500"># Reactive views</span></div>
            <div>├── theme.style.omni      <span className="text-slate-500"># Design tokens</span></div>
            <div>└── store.test.omni       <span className="text-slate-500"># Contract suites</span></div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-sky-400">Automatic Cross-File Symbol Resolution</h4>
            <p className="text-xs text-slate-400">
              The OmniJS compiler automatically links <code>products.server.omni</code> to <code>schema.db.omni</code>. When you run <code>omni dev</code> or <code>omni build</code>, the multi-target compiler resolves all cross-dependencies into unified production artifacts.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'vscode-mcp',
      category: 'Tooling & IDE',
      title: 'VS Code Extension & MCP Knowledge Base',
      description: 'Supercharge your IDE with syntax highlighting, LSP, and AI Model Context Protocol.',
      content: (
        <div className="space-y-6">
          <p className="text-sm text-slate-300">
            OmniJS comes with native tooling for modern editors and AI assistants:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                VS Code Extension
              </h4>
              <p className="text-xs text-slate-400">
                Official TextMate grammar syntax highlighting for <code>.omni</code>, custom block folding, snippets, and <code>omni lsp</code> Language Server integration.
              </p>
              <button
                onClick={onOpenMcp}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded text-xs font-medium"
              >
                Download Extension & Snippets →
              </button>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                MCP Knowledge Base Server
              </h4>
              <p className="text-xs text-slate-400">
                Exposes framework schemas, routes, and compiler tools directly to Claude Desktop, Cursor, and Zed via <code>omni mcp</code>.
              </p>
              <button
                onClick={onOpenMcp}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs font-medium"
              >
                View Claude & Cursor Config →
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'cli-manual',
      category: 'Reference',
      title: 'CLI Command Reference',
      description: 'Complete documentation for the omni command-line tool.',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60 space-y-2">
              <code className="text-xs font-bold text-sky-400">omni dev [--port 3000] [--hmr]</code>
              <p className="text-xs text-slate-400">
                Starts local development server with block-level Hot Module Replacement. Updates styles and client templates without resetting server database rows.
              </p>
            </div>

            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60 space-y-2">
              <code className="text-xs font-bold text-sky-400">omni build [--outDir dist] [--minify]</code>
              <p className="text-xs text-slate-400">
                Compiles multi-target production bundles: <code>dist/client/app.js</code>, <code>dist/server/router.js</code>, <code>dist/schema/schema.sql</code>, and <code>dist/styles.css</code>.
              </p>
            </div>

            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60 space-y-2">
              <code className="text-xs font-bold text-sky-400">omni test [--watch] [--filter &lt;regex&gt;]</code>
              <p className="text-xs text-slate-400">
                Runs automated contract test suites declared in <code>&lt;test&gt;</code> blocks, reporting pass/fail status and execution times.
              </p>
            </div>

            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60 space-y-2">
              <code className="text-xs font-bold text-sky-400">omni routes [--json]</code>
              <p className="text-xs text-slate-400">
                Introspects all server queries, mutations, background workers, and auth protections in tabular format.
              </p>
            </div>

            <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60 space-y-2">
              <code className="text-xs font-bold text-sky-400">omni db:seed / db:migrate</code>
              <p className="text-xs text-slate-400">
                Injects initial seed records from <code>&lt;schema&gt;</code> into the database, or applies incremental SQL table migrations.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const categories = Array.from(new Set(docs.map((d) => d.category)));
  const activeDoc = docs.find((d) => d.id === activeDocId) || docs[0];

  const filteredDocs = searchQuery
    ? docs.filter(
        (d) =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : docs;

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-950/70 p-4 overflow-y-auto flex flex-col gap-6 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search guides (Ctrl+K)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <nav className="space-y-5">
          {categories.map((cat) => (
            <div key={cat} className="space-y-1.5">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                {cat}
              </h5>
              <div className="space-y-0.5">
                {filteredDocs
                  .filter((d) => d.category === cat)
                  .map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setActiveDocId(d.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        activeDocId === d.id
                          ? 'bg-sky-500/10 text-sky-400 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`}
                    >
                      {d.title}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Interactive Studio</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Edit code, run CLI commands, and test live apps in the browser workbench.
          </p>
          <button
            onClick={() => onOpenInStudio()}
            className="w-full py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
          >
            Launch Studio →
          </button>
        </div>
      </aside>

      {/* Main Documentation Body */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 max-w-4xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
            {activeDoc.category}
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            {activeDoc.title}
          </h1>
          <p className="text-base text-slate-400 mt-2 leading-relaxed">
            {activeDoc.description}
          </p>
        </div>

        <div className="h-px bg-slate-800" />

        <div className="space-y-6">
          {activeDoc.content}
        </div>

        {/* Previous / Next Navigation */}
        <div className="pt-8 border-t border-slate-800 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              const idx = docs.findIndex((d) => d.id === activeDoc.id);
              if (idx > 0) setActiveDocId(docs[idx - 1].id);
            }}
            className="text-slate-400 hover:text-white flex items-center gap-1 font-medium"
          >
            ← Previous Chapter
          </button>
          <button
            onClick={() => {
              const idx = docs.findIndex((d) => d.id === activeDoc.id);
              if (idx < docs.length - 1) setActiveDocId(docs[idx + 1].id);
            }}
            className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
          >
            Next Chapter →
          </button>
        </div>
      </main>

      {/* Right Rail: Quick Actions & Outline */}
      <aside className="w-56 border-l border-slate-800/80 p-6 hidden xl:block space-y-6 text-xs shrink-0">
        <div className="space-y-2">
          <h6 className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
            Quick Actions
          </h6>
          <div className="space-y-1.5">
            <button
              onClick={() => onOpenInStudio()}
              className="w-full text-left px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-sky-400 font-medium flex items-center justify-between"
            >
              <span>Try in Studio</span>
              <Play className="w-3 h-3" />
            </button>
            <button
              onClick={onOpenTerminal}
              className="w-full text-left px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium flex items-center justify-between"
            >
              <span>CLI Terminal</span>
              <Terminal className="w-3 h-3" />
            </button>
            <button
              onClick={onOpenMcp}
              className="w-full text-left px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 font-medium flex items-center justify-between"
            >
              <span>VS Code & MCP</span>
              <Cpu className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">NPM Package</span>
          <p className="font-mono text-[11px] text-slate-300 font-semibold">omnijsfw v1.0.0</p>
          <span className="text-[10px] text-emerald-400 font-medium">Ready for GitHub release</span>
        </div>
      </aside>
    </div>
  );
};
