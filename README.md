# OmniJS (`omnijsfw`)

> **The All-in-One Full-Stack JavaScript Framework & Toolchain**  
> Unified `.omni` Multi-Block File Format · Zero-Boilerplate Server RPC · Signal Reactivity · Built-in CLI & HMR · VS Code & MCP Server

---

## 🌟 What is OmniJS?

OmniJS eliminates the fragmentation of modern full-stack JavaScript. Instead of spreading a single feature across ORM schemas, migration scripts, server route handlers, client fetch hooks, CSS modules, and unit test suites across half a dozen folders, OmniJS unites them in a single, typed `.omni` component or modular domain files (`*.db.omni`, `*.server.omni`, `*.client.omni`, `*.style.omni`, `*.test.omni`).

```omni
<schema>
  table Product {
    id: uuid @primary @auto
    title: string @min(2) @max(120)
    category: string @indexed
    price: float @positive
    inventory: int @default(10)
  }

  seed Product [
    { title: "Ergonomic Mechanical Keyboard", category: "hardware", price: 149.00, inventory: 8 },
    { title: "Ultrawide 4K Curved Monitor", category: "display", price: 799.00, inventory: 3 }
  ]
</schema>

<server auth="optional">
  query getCatalog({ category = "all" }) {
    return db.Product.findMany({
      where: { category: category === "all" ? undefined : category }
    });
  }

  mutation purchase({ productId, count = 1 }) @protect(role: "user") {
    const item = await db.Product.findById(productId);
    if (!item || item.inventory < count) throw new Error("Out of stock");
    await db.Product.update(productId, { inventory: item.inventory - count });
    job.dispatch("sendReceipt", { productId, count });
    return { success: true };
  }
</server>

<client>
  export default function Storefront() {
    const $category = $state("all");
    const { data: products, loading } = $query(server.getCatalog, { category: $category });
    const [buyItem, { pending }] = $mutation(server.purchase, { invalidate: ["products"] });

    return (
      <div className="storefront">
        {products?.map(p => (
          <div key={p.id} className="card">
            <h3>{p.title}</h3>
            <span>\${p.price}</span>
            <button disabled={p.inventory === 0 || pending} on:click={() => buyItem({ productId: p.id })}>
              {p.inventory === 0 ? "Sold Out" : "Buy Now"}
            </button>
          </div>
        ))}
      </div>
    );
  }
</client>

<style scoped>
  .storefront { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
  .card { background: $surface; border: 1px solid $border; border-radius: $radius-lg; padding: 1.25rem; }
</style>
```

---

## 🚀 Installation & Quickstart

### Prerequisites
- **Node.js**: `v22.0.0` or higher (Node 22 Active LTS recommended)
- **Package Manager**: npm `v10+`, pnpm, yarn, or bun

```bash
# Create a new project
npx omnijsfw create my-fullstack-app

# Or install in an existing project
npm install omnijsfw
```

Start the development server with block-level Hot Module Replacement:
```bash
npx omni dev --hmr
```

---

## 🛠️ OmniJS Core CLI Commands

| Command | Options | Description |
| :--- | :--- | :--- |
| `omni dev` | `--port 3000`, `--hmr`, `--host` | High-speed local dev server with fine-grained block HMR |
| `omni build` | `--outDir dist`, `--minify`, `--target` | Multi-target compiler producing client, server, schema SQL, and scoped CSS |
| `omni test` | `--watch`, `--filter <regex>` | Automated contract and unit test runner executing `<test>` blocks |
| `omni routes` | `--json` | Introspection utility displaying all registered queries, mutations, and routes |
| `omni db:seed` | | Injects initial seed records from `<schema>` into database |
| `omni db:migrate` | | Compares schema against database and applies ANSI SQL migrations |
| `omni jobs:list` | | Real-time background job queue inspector |
| `omni lint` | `--fix` | Static analysis checking for unclosed tags, schema mismatches, and secret leaks |
| `omni mcp` | `--stdio` | Model Context Protocol server exposing docs, schema, and compiler to AI IDEs |
| `omni lsp` | | Language Server Protocol daemon for syntax diagnostics, hover, and autocomplete |

---

## 📦 What We Have Implemented (Feature Tracking)

- [x] **Custom Multi-Block Lexer & AST Parser**: Full grammar support for `<schema>`, `<server>`, `<client>`, `<style>`, and `<test>` blocks with attribute handling.
- [x] **Modular Multi-File Support**: Seamless handling of `.db.omni`, `.server.omni`, `.client.omni`, `.style.omni`, and `.test.omni` files with cross-file linking.
- [x] **Multi-Target Compiler**: Compiles `.omni` code to browser bundles, Node.js RPC router, ANSI SQL table migrations, and scoped CSS with design token replacements.
- [x] **Compile-Time Secret Isolation**: Static analyzer that alerts developers if database passwords or private API keys accidentally leak into client bundles.
- [x] **Virtual Full-Stack Runtime**: In-memory transactional database, simulated low-latency RPC network bridge, and optimistic UI updates with automatic rollback.
- [x] **Zero-Dependency Background Job Queue**: In-process asynchronous job queue with status tracking, timing, and log capture.
- [x] **Interactive CLI Terminal Emulator**: Authentic terminal built into the workbench with command history (Up/Down), Tab auto-completion, and live execution.
- [x] **Full-Stack Waterfall Telemetry**: Request profiler breaking down Client Signal → RPC Transit → Server Handler → DB Query → Job Enqueue → DOM Re-render.
- [x] **Astro.build-Grade Official Docs Portal**: Multi-level navigation taxonomy, tabbed package managers, rich aside callouts, and runnable "Try in Studio" buttons.
- [x] **VS Code Extension Suite**: TextMate grammar (`omni.tmLanguage.json`), language configuration, and productivity snippet library.
- [x] **Model Context Protocol (MCP) Server**: Native MCP integration with tools and resources for Claude Desktop, Cursor, and Zed.
- [x] **Automated NPM & GitHub Actions Publishing**: Release workflow (`.github/workflows/npm-publish.yml`) with automated tests and npm provenance.

---

## 📄 License
MIT © 2026 OmniJS Contributors
