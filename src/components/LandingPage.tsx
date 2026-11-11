/**
 * OmniJS Official Landing Page & Architecture Showcase
 * Crafted with high visual craft, interactive code comparisons, Bento innovation grid, and rich color palette.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Terminal,
  Layers,
  Database,
  Server,
  Monitor,
  Zap,
  ShieldCheck,
  Cpu,
  Check,
  Copy,
  Play,
  Package,
  BookOpen,
  ChevronRight,
  Flame,
  Globe,
  Activity,
  Workflow
} from 'lucide-react';

interface LandingPageProps {
  onLaunchStudio: (templateId?: string) => void;
  onOpenDocs: (docId?: string) => void;
  onOpenTerminal: () => void;
  onOpenMcp: () => void;
  onOpenPublish: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchStudio,
  onOpenDocs,
  onOpenTerminal,
  onOpenMcp,
  onOpenPublish,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTabCode, setActiveTabCode] = useState<'single' | 'multidb' | 'server' | 'client'>('single');

  const copyInstallCmd = () => {
    navigator.clipboard.writeText('npx omnijsfw create my-app');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#06080d] text-slate-100 font-sans selection:bg-sky-500/30">
      {/* Hero Section with Ambient Glows */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient radial color spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-sky-500/15 via-indigo-500/10 to-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative text-center space-y-6 max-w-4xl mx-auto">
          {/* Subtle kicker text (Anti-slop: clean unboxed text) */}
          <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>OmniJS v1.0.0 Public Release</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">NPM Package Ready</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] text-balance">
            The full-stack framework with its <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">own unified file format.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
            Stop stitching together schemas, REST routers, client hooks, and CSS modules across dozens of folders. OmniJS unifies your database, server RPC, reactive client UI, and contract tests into cohesive <code className="text-sky-300 font-mono text-sm">.omni</code> components.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onLaunchStudio()}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Live Studio</span>
            </button>

            <button
              onClick={() => onOpenDocs()}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Read Documentation</span>
            </button>
          </div>

          {/* Quick Copy Command */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs text-slate-300">
              <span className="text-sky-400">$</span>
              <span>npx omnijsfw create my-app</span>
              <button
                onClick={copyInstallCmd}
                className="text-slate-500 hover:text-white p-1 rounded transition-colors"
                title="Copy command"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Side-by-Side Architectural Contrast */}
        <div className="mt-16 lg:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: The Old Fragmented Way */}
          <div className="p-6 bg-[#0a0d14] border border-red-900/30 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono">
                  Before: The Fragmented Stack
                </span>
                <span className="text-xs text-slate-500 font-mono">6 files, 4 frameworks</span>
              </div>
              <h3 className="text-lg font-bold text-slate-200 mt-2">
                Context-switching across 6 disparate files for one feature
              </h3>
            </div>

            <div className="space-y-2 font-mono text-xs text-slate-400 bg-slate-950/70 p-4 rounded-xl border border-slate-900">
              <div className="flex items-center gap-2 text-red-400/80">
                <span>✕</span> <code>prisma/schema.prisma</code> <span className="text-slate-600">· Database model</span>
              </div>
              <div className="flex items-center gap-2 text-red-400/80">
                <span>✕</span> <code>pages/api/orders.ts</code> <span className="text-slate-600">· Express controller</span>
              </div>
              <div className="flex items-center gap-2 text-red-400/80">
                <span>✕</span> <code>hooks/useOrderMutation.ts</code> <span className="text-slate-600">· React fetch hook</span>
              </div>
              <div className="flex items-center gap-2 text-red-400/80">
                <span>✕</span> <code>components/OrderForm.tsx</code> <span className="text-slate-600">· React DOM markup</span>
              </div>
              <div className="flex items-center gap-2 text-red-400/80">
                <span>✕</span> <code>styles/OrderForm.module.css</code> <span className="text-slate-600">· Scoped styling</span>
              </div>
              <div className="flex items-center gap-2 text-red-400/80">
                <span>✕</span> <code>tests/orders.test.ts</code> <span className="text-slate-600">· Mock integration test</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Every simple schema change breaks type contracts across boundaries, requiring manual migrations, synchronized DTOs, and duplicate validations.
            </p>
          </div>

          {/* Right: The OmniJS Unified Component */}
          <div className="p-6 bg-gradient-to-b from-[#0f1524] to-[#0a0e1a] border border-sky-500/30 rounded-2xl flex flex-col justify-between space-y-4 shadow-xl shadow-sky-500/5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  OmniJS: Single Cohesive Component
                </span>
                <span className="text-xs text-emerald-400 font-mono font-semibold">1 file, 0 glue code</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-2">
                All layers co-located with compile-time secret isolation
              </h3>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5 overflow-x-auto">
              <div className="text-emerald-400 font-bold">&lt;schema&gt;</div>
              <div className="pl-3 text-slate-400">table Order &#123; id: uuid @primary, count: int @positive &#125;</div>
              <div className="text-emerald-400 font-bold">&lt;/schema&gt;</div>

              <div className="text-sky-400 font-bold pt-1">&lt;server auth=&quot;optional&quot;&gt;</div>
              <div className="pl-3 text-slate-400">mutation buy(&#123; id &#125;) &#123; return db.Order.create(&#123; id &#125;); &#125;</div>
              <div className="text-sky-400 font-bold">&lt;/server&gt;</div>

              <div className="text-amber-400 font-bold pt-1">&lt;client&gt;</div>
              <div className="pl-3 text-slate-400">const [buy, &#123; pending &#125;] = $mutation(server.buy, &#123; invalidate: [&apos;orders&apos;] &#125;);</div>
              <div className="text-amber-400 font-bold">&lt;/client&gt;</div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-400">Compiles in &lt;10ms to standalone Node.js and client bundles.</span>
              <button
                onClick={() => onLaunchStudio()}
                className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
              >
                <span>Open in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: 6 Pillars of Innovation */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase font-bold text-sky-400 tracking-wider">
            Framework Innovations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered to solve the daily pain points of modern full-stack development.
          </h2>
          <p className="text-slate-400 text-sm">
            From zero-boilerplate RPC to compile-time secret leak prevention, OmniJS takes care of the plumbing so you can focus on building products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Zero-Boilerplate RPC */}
          <div className="p-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl space-y-4 hover:border-sky-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Zero-Boilerplate Server RPC</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No route controllers, fetch wrappers, or URL strings. Call server queries and mutations directly with <code>$query(server.getCatalog)</code> and automatic cache invalidation tags.
            </p>
          </div>

          {/* Card 2: Compile-Time Secret Isolation */}
          <div className="p-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Compile-Time Secret Shield</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The OmniJS compiler isolates <code>&lt;server&gt;</code> secrets and database keys. If client markup references a server secret, the compiler halts with an instant diagnostic.
            </p>
          </div>

          {/* Card 3: Granular Block-Level HMR */}
          <div className="p-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl space-y-4 hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Block-Level Hot Reload (HMR)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Edit <code>&lt;style&gt;</code> to patch CSS instantly without re-render. Edit <code>&lt;client&gt;</code> without losing form inputs. Edit <code>&lt;server&gt;</code> without wiping in-memory database records.
            </p>
          </div>

          {/* Card 4: Model Context Protocol (MCP) Server */}
          <div className="p-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl space-y-4 hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Native MCP Knowledge Base</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built-in <code>omni mcp</code> server exposes AST grammar, database schemas, and verification tools directly to Claude Desktop, Cursor, and Zed with one-click configs.
            </p>
          </div>

          {/* Card 5: Full-Stack Waterfall Tracing */}
          <div className="p-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl space-y-4 hover:border-pink-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Full-Stack Waterfall Profiler</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live request tracing mapping: <code>Client Click</code> → <code>RPC Transit (12ms)</code> → <code>Server Handler (2ms)</code> → <code>DB Write</code> → <code>DOM Render</code>.
            </p>
          </div>

          {/* Card 6: Zero-Dependency Background Workers */}
          <div className="p-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl space-y-4 hover:border-blue-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Workflow className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">In-Process Background Jobs</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Declare asynchronous background workers and recurring cron routines with <code>job.dispatch()</code> directly in <code>&lt;server&gt;</code> without spinning up Redis or BullMQ.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Code & Architecture Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-8">
          <div>
            <span className="text-xs font-mono uppercase font-bold text-sky-400 tracking-wider">
              Explore Real Code
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Production-ready applications in clean, expressive syntax.
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onLaunchStudio('shoppulse-multi')}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run ShopPulse in Studio</span>
            </button>
          </div>
        </div>

        {/* Code Tabs Container */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#090d16] shadow-2xl">
          <div className="flex border-b border-slate-800 bg-slate-950/80 px-4 pt-3 gap-2 overflow-x-auto text-xs font-mono">
            {[
              { id: 'single', label: 'tasks.omni (Single-File)', badge: 'Kanban' },
              { id: 'multidb', label: 'schema.db.omni (Multi-File)', badge: 'Relational' },
              { id: 'server', label: 'products.server.omni', badge: 'RPC Server' },
              { id: 'client', label: 'store.client.omni', badge: 'Reactive UI' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabCode(tab.id as any)}
                className={`px-3 py-2 rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTabCode === tab.id
                    ? 'bg-slate-900 text-sky-300 font-bold border-t border-x border-slate-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] text-slate-500 font-normal">[{tab.badge}]</span>
              </button>
            ))}
          </div>

          <div className="p-6 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto max-h-[420px]">
            {activeTabCode === 'single' && (
              <pre className="text-emerald-400/90">{`<schema>
  table Task {
    id: uuid @primary @auto
    title: string @min(2) @max(100)
    status: string @default("todo")
    priority: string @default("medium")
  }
</schema>

<server auth="optional">
  query getTasks() { return db.Task.findMany(); }
  
  mutation updateTask({ id, updates }) {
    return db.Task.update(id, updates);
  }
</server>

<client>
  export default function TaskSprint() {
    const { data: tasks } = $query(server.getTasks, {}, { tags: ["tasks"] });
    const [updateTask] = $mutation(server.updateTask, { invalidate: ["tasks"] });

    return (
      <div className="board">
        {tasks?.map(t => (
          <div key={t.id} className="card" on:click={() => updateTask({ id: t.id, updates: { status: "done" } })}>
            {t.title}
          </div>
        ))}
      </div>
    );
  }
</client>`}</pre>
            )}

            {activeTabCode === 'multidb' && (
              <pre className="text-sky-300">{`<schema>
  table Product {
    id: uuid @primary @auto
    title: string @min(3) @max(120)
    category: string @indexed
    price: float @positive
    inventory: int @default(10)
  }

  table Order {
    id: uuid @primary @auto
    productId: uuid -> Product.id @onDelete(cascade)
    quantity: int @min(1)
    customerEmail: string @email
    total: float
  }

  seed Product [
    { title: "Ergonomic Keyboard", category: "hardware", price: 119.00, inventory: 12 },
    { title: "Retina 4K Monitor", category: "display", price: 849.00, inventory: 4 }
  ]
</schema>`}</pre>
            )}

            {activeTabCode === 'server' && (
              <pre className="text-amber-300">{`<server auth="optional">
  query getCatalog({ category = "all", search = "" }) {
    return db.Product.findMany({
      where: { category: category === "all" ? undefined : category }
    });
  }

  mutation createOrder({ productId, quantity = 1, customerEmail }) @protect(role: "user") {
    const product = await db.Product.findById(productId);
    if (!product || product.inventory < quantity) throw new Error("Out of stock!");

    await db.Product.update(productId, { inventory: product.inventory - quantity });
    
    // Background worker task
    job.dispatch("sendConfirmationEmail", { productId, customerEmail });
    return { success: true };
  }
</server>`}</pre>
            )}

            {activeTabCode === 'client' && (
              <pre className="text-purple-300">{`<client>
  export default function Shop() {
    const $category = $state("all");
    const { data: products, loading } = $query(server.getCatalog, { category: $category });

    const [buyItem, { pending }] = $mutation(server.createOrder, {
      invalidate: ["products"],
      optimistic: (payload) => ({ success: true, pending: true })
    });

    return (
      <div className="grid">
        {products?.map(p => (
          <div key={p.id} className="item">
            <h3>{p.title}</h3>
            <span>\${p.price.toFixed(2)}</span>
            <button disabled={p.inventory === 0 || pending} on:click={() => buyItem({ productId: p.id })}>
              {p.inventory === 0 ? "Sold Out" : "Buy Now"}
            </button>
          </div>
        ))}
      </div>
    );
  }
</client>`}</pre>
            )}
          </div>
        </div>
      </section>

      {/* Benchmark Strip */}
      <section className="py-16 bg-slate-950/90 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center font-mono">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-sky-400 tabular-nums">1 File</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-sans">Instead of 6 Directories</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tabular-nums">&lt;10ms</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-sans">Compilation Duration</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 tabular-nums">0 Glue</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-sans">Type-Safe RPC Layer</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 tabular-nums">100%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-sans">Secret Leak Isolation</div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Ready to build without the full-stack friction?
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Start experimenting in your browser with our live interactive IDE, or scaffold your first project using the CLI.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onLaunchStudio()}
            className="w-full sm:w-auto px-8 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Launch Live Studio</span>
          </button>

          <button
            onClick={onOpenPublish}
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Package className="w-4 h-4 text-sky-400" />
            <span>Publish to NPM via GitHub</span>
          </button>
        </div>
      </section>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-mono">
          <span className="font-bold text-slate-300">OmniJS</span>
          <span>·</span>
          <span>Open Source Full-Stack Framework</span>
          <span>·</span>
          <span>MIT License</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => onOpenDocs()} className="hover:text-slate-300 transition-colors">Documentation</button>
          <button onClick={() => onLaunchStudio()} className="hover:text-slate-300 transition-colors">Studio</button>
          <button onClick={onOpenTerminal} className="hover:text-slate-300 transition-colors">Terminal</button>
          <button onClick={onOpenMcp} className="hover:text-slate-300 transition-colors">MCP &amp; VS Code</button>
          <button onClick={onOpenPublish} className="hover:text-slate-300 transition-colors">NPM Package</button>
        </div>
      </footer>
    </div>
  );
};
