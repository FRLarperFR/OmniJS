/**
 * OmniJS Starter Templates
 * Real-world full-stack showcase applications in single-file and multi-file architectures
 */

export interface OmniProjectFile {
  name: string;
  type: 'single' | 'db' | 'server' | 'client' | 'style' | 'test';
  content: string;
}

export interface OmniProjectTemplate {
  id: string;
  name: string;
  description: string;
  isMultiFile: boolean;
  defaultFile: string;
  files: OmniProjectFile[];
}

export const TEMPLATES: OmniProjectTemplate[] = [
  {
    id: 'shoppulse-multi',
    name: 'ShopPulse E-Commerce (Multi-File)',
    description: 'Modular full-stack store with schema.db.omni, products.server.omni, and store.client.omni',
    isMultiFile: true,
    defaultFile: 'store.client.omni',
    files: [
      {
        name: 'schema.db.omni',
        type: 'db',
        content: `<schema>
  table Product {
    id: uuid @primary @auto
    title: string @min(3) @max(120)
    category: string @indexed
    price: float @positive
    inventory: int @default(10)
    badge: string @default("New")
  }

  table Order {
    id: uuid @primary @auto
    productId: uuid -> Product.id @onDelete(cascade)
    quantity: int @min(1)
    customerEmail: string @email
    total: float
    status: string @default("confirmed")
  }

  seed Product [
    { title: "Quantum Keychron K2 Keyboard", category: "hardware", price: 119.00, inventory: 12, badge: "Best Seller" },
    { title: "Retina 4K Studio Display 27-inch", category: "display", price: 849.00, inventory: 4, badge: "Pro Grade" },
    { title: "Spatial Audio Pro Noise-Canceling Headphones", category: "audio", price: 279.00, inventory: 18, badge: "Featured" },
    { title: "Precision Ergonomic Vertical Mouse", category: "hardware", price: 69.00, inventory: 25, badge: "Ergo" }
  ]
</schema>`,
      },
      {
        name: 'products.server.omni',
        type: 'server',
        content: `<server auth="optional">
  query getCatalog({ category = "all", search = "" }) {
    return db.Product.findMany({
      where: {
        category: category === "all" ? undefined : category,
        title: search ? { contains: search } : undefined
      },
      orderBy: { price: "desc" }
    });
  }

  mutation createOrder({ productId, quantity = 1, customerEmail }) @protect(role: "user") {
    const product = await db.Product.findById(productId);
    if (!product) throw new Error("Product not found");
    if (product.inventory < quantity) {
      throw new Error("Out of stock!");
    }

    // Atomic update
    await db.Product.update(productId, { inventory: product.inventory - quantity });
    
    const order = await db.Order.create({
      productId,
      quantity,
      customerEmail: customerEmail || "buyer@omni.js",
      total: product.price * quantity,
      status: "confirmed"
    });

    // Dispatch background confirmation email job
    job.dispatch("sendConfirmationEmail", { orderId: order.id, customerEmail: order.customerEmail, total: order.total });

    return order;
  }

  job onOrderConfirmed("sendConfirmationEmail", async ({ orderId, customerEmail, total }) => {
    console.log(\`[JobRunner] Sending confirmation email for #\${orderId} to \${customerEmail} ($ \${total})\`);
  });
</server>`,
      },
      {
        name: 'store.client.omni',
        type: 'client',
        content: `<client>
  export default function ShopPulse() {
    const $category = $state("all");
    const $search = $state("");

    // Zero-boilerplate type-safe server RPC
    const { data: products, loading, error, refetch } = $query(
      server.getCatalog, 
      { category: $category, search: $search },
      { tags: ["products"] }
    );

    // Optimistic mutation dispatcher
    const [placeOrder, { pending }] = $mutation(server.createOrder, {
      invalidate: ["products"],
      optimistic: (payload) => {
        return { success: true, pending: true };
      }
    });

    return (
      <div className="store-container">
        <header className="store-nav">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search products..." 
              bind:value={$search} 
            />
          </div>
          <div className="cat-pills">
            {["all", "hardware", "display", "audio"].map(cat => (
              <button 
                key={cat}
                className={$category === cat ? "active" : ""}
                on:click={() => $category = cat}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="catalog-loading">Retrieving catalog from server...</div>
        ) : (
          <div className="products-grid">
            {products?.map(p => (
              <div key={p.id} className="item-card">
                <span className="item-badge">{p.badge}</span>
                <h3 className="item-title">{p.title}</h3>
                <div className="item-meta">
                  <span className="item-price">\${p.price.toFixed(2)}</span>
                  <span className="item-stock">{p.inventory} left</span>
                </div>
                <button 
                  disabled={p.inventory === 0 || pending}
                  on:click={() => placeOrder({ productId: p.id, quantity: 1 })}
                  className="buy-button"
                >
                  {p.inventory === 0 ? "Out of Stock" : "Buy Now"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
</client>`,
      },
      {
        name: 'store.style.omni',
        type: 'style',
        content: `<style scoped>
  .store-container {
    padding: 1rem;
    font-family: inherit;
  }

  .store-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .search-bar input {
    background: $surface;
    border: 1px solid $border;
    color: $text;
    padding: 0.5rem 0.85rem;
    border-radius: $radius-md;
    outline: none;
    min-width: 240px;
  }

  .cat-pills {
    display: flex;
    gap: 0.5rem;
  }

  .cat-pills button {
    background: $surface;
    border: 1px solid $border;
    color: $muted;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.4rem 0.75rem;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: all 120ms ease;

    &.active, &:hover {
      background: $primary;
      color: white;
      border-color: $primary;
    }
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.25rem;
  }

  .item-card {
    background: $surface;
    border: 1px solid $border;
    border-radius: $radius-lg;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 140ms ease, border-color 140ms ease;

    &:hover {
      border-color: $primary;
      transform: translateY(-2px);
    }
  }

  .item-badge {
    font-size: 0.7rem;
    color: $accent;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .item-title {
    font-size: 1rem;
    font-weight: 600;
    color: $text;
    margin: 0.5rem 0 1rem;
    line-height: 1.4;
  }

  .item-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1rem;
  }

  .item-price {
    font-size: 1.25rem;
    font-weight: 700;
    color: $text;
  }

  .item-stock {
    font-size: 0.75rem;
    color: $muted;
  }

  .buy-button {
    background: $primary;
    color: white;
    border: none;
    font-weight: 600;
    padding: 0.6rem;
    border-radius: $radius-md;
    cursor: pointer;
    transition: opacity 120ms ease;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  @mobile {
    .products-grid {
      grid-template-columns: 1fr;
    }
  }
</style>`,
      },
      {
        name: 'e2e.test.omni',
        type: 'test',
        content: `<test>
  suite "Store E2E Lifecycle" {
    test "catalog returns all seeded products" {
      const items = await server.getCatalog({ category: "all" });
      expect(items.length).toBeGreaterThan(0);
    }

    test "purchase decrements inventory" {
      const initial = await db.Product.findById("product_1");
      await server.createOrder({ productId: "product_1", quantity: 1 });
      const updated = await db.Product.findById("product_1");
      expect(updated.inventory).toBe(initial.inventory - 1);
    }
  }
</test>`,
      },
    ],
  },
  {
    id: 'tasksprint-single',
    name: 'TaskSprint Kanban (Single-File .omni)',
    description: 'All-in-one Kanban task board with optimistic state updates and schema validation',
    isMultiFile: false,
    defaultFile: 'tasks.omni',
    files: [
      {
        name: 'tasks.omni',
        type: 'single',
        content: `<schema>
  table Task {
    id: uuid @primary @auto
    title: string @min(2) @max(100)
    status: string @default("todo")
    priority: string @default("medium")
    assignedTo: string @default("Alex")
  }

  seed Task [
    { title: "Implement AST token cache", status: "todo", priority: "high", assignedTo: "Sarah" },
    { title: "Design scoped CSS resolver", status: "in-progress", priority: "urgent", assignedTo: "Alex" },
    { title: "Set up GitHub Actions publish pipeline", status: "done", priority: "medium", assignedTo: "Dev" },
    { title: "Audit MCP knowledge base schemas", status: "todo", priority: "low", assignedTo: "Alex" }
  ]
</schema>

<server auth="optional">
  query getTasks() {
    return db.Task.findMany();
  }

  mutation createTask({ title, priority = "medium", assignedTo = "Alex" }) {
    if (!title || title.trim().length < 2) {
      throw new Error("Task title must be at least 2 characters");
    }
    return db.Task.create({ title, priority, assignedTo, status: "todo" });
  }

  mutation updateTask({ id, updates }) {
    return db.Task.update(id, updates);
  }

  mutation deleteTask({ id }) {
    return db.Task.delete(id);
  }
</server>

<client>
  export default function TaskSprint() {
    const $newTitle = $state("");
    const $priority = $state("medium");

    const { data: tasks, loading, refetch } = $query(server.getTasks, {}, { tags: ["tasks"] });
    
    const [createTask, { pending }] = $mutation(server.createTask, {
      invalidate: ["tasks"],
      optimistic: (payload) => ({ id: "temp", ...payload, status: "todo" })
    });

    const [updateTask] = $mutation(server.updateTask, { invalidate: ["tasks"] });
    const [deleteTask] = $mutation(server.deleteTask, { invalidate: ["tasks"] });

    const columns = [
      { id: "todo", title: "To Do" },
      { id: "in-progress", title: "In Progress" },
      { id: "done", title: "Done" }
    ];

    const handleCreate = (e) => {
      e.preventDefault();
      if (!$newTitle) return;
      createTask({ title: $newTitle, priority: $priority });
      $newTitle = "";
    };

    return (
      <div className="kanban-wrapper">
        <form onSubmit={handleCreate} className="task-creator">
          <input 
            type="text" 
            placeholder="What needs to be done?" 
            bind:value={$newTitle} 
          />
          <select bind:value={$priority}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="urgent">Urgent</option>
          </select>
          <button type="submit" disabled={pending}>+ Add Task</button>
        </form>

        <div className="board-grid">
          {columns.map(col => (
            <div key={col.id} className="board-col">
              <div className="col-header">
                <h4>{col.title}</h4>
                <span className="count">{tasks?.filter(t => t.status === col.id).length || 0}</span>
              </div>
              <div className="cards-stack">
                {tasks?.filter(t => t.status === col.id).map(t => (
                  <div key={t.id} className="task-card">
                    <div className="task-top">
                      <span className={"badge " + t.priority}>{t.priority}</span>
                      <button on:click={() => deleteTask({ id: t.id })} className="del-btn">×</button>
                    </div>
                    <p className="task-title">{t.title}</p>
                    <div className="task-actions">
                      {col.id !== "todo" && (
                        <button on:click={() => updateTask({ id: t.id, updates: { status: "todo" } })}>← Todo</button>
                      )}
                      {col.id !== "in-progress" && (
                        <button on:click={() => updateTask({ id: t.id, updates: { status: "in-progress" } })}>Doing</button>
                      )}
                      {col.id !== "done" && (
                        <button on:click={() => updateTask({ id: t.id, updates: { status: "done" } })}>Done →</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
</client>

<style scoped>
  .kanban-wrapper { padding: 1rem; }
  .task-creator { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
  .task-creator input { flex: 1; background: $surface; border: 1px solid $border; color: $text; padding: 0.5rem 0.85rem; border-radius: $radius-md; }
  .task-creator select { background: $surface; border: 1px solid $border; color: $text; padding: 0.5rem; border-radius: $radius-md; }
  .task-creator button { background: $primary; color: white; border: none; padding: 0.5rem 1rem; font-weight: 600; border-radius: $radius-md; cursor: pointer; }
  .board-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .board-col { background: $surface-light; border: 1px solid $border; border-radius: $radius-lg; padding: 1rem; }
  .col-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-weight: 600; }
  .cards-stack { display: flex; flex-direction: column; gap: 0.75rem; }
  .task-card { background: $surface; border: 1px solid $border; border-radius: $radius-md; padding: 0.75rem; }
  .task-top { display: flex; justify-content: space-between; }
  .del-btn { background: none; border: none; color: $muted; font-size: 1.25rem; cursor: pointer; }
  .badge { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; padding: 0.2rem 0.4rem; border-radius: $radius-sm; }
  .badge.urgent { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
  .badge.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
  .badge.low { background: rgba(16, 185, 129, 0.2); color: #10b981; }
  .task-title { font-size: 0.9rem; margin: 0.5rem 0; color: $text; }
  .task-actions { display: flex; gap: 0.4rem; margin-top: 0.5rem; }
  .task-actions button { font-size: 0.7rem; background: $surface-light; border: 1px solid $border; color: $muted; padding: 0.2rem 0.4rem; border-radius: $radius-sm; cursor: pointer; }
</style>

<test>
  suite "Kanban Operations" {
    test "creates task with todo status" {
      const task = await server.createTask({ title: "Write documentation" });
      expect(task.status).toBe("todo");
    }
  }
</test>`,
      },
    ],
  },
];
