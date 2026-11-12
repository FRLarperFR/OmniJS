/**
 * OmniJS Starter Templates
 * Real-world full-stack showcase applications in single-file and multi-file architectures
 */

export interface OmniProjectFile {
  name: string;
  type: 'single' | 'db' | 'server' | 'client' | 'style' | 'test' | 'page' | 'layout';
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
    id: 'omni-multipage',
    name: 'OmniStore Multi-Page App (File-Based Routing)',
    description: 'Full-stack multi-page app with file-based routes (/, /products, /cart, /admin), shared layout, and atomic cart checkout',
    isMultiFile: true,
    defaultFile: 'routes/index.page.omni',
    files: [
      {
        name: 'routes/_layout.omni',
        type: 'layout',
        content: `<client layout="root">
  export default function RootLayout({ children, currentPath = "/" }) {
    const { data: stats } = $query(server.getStats);
    const cartCount = stats?.cartCount || 0;

    return (
      <div className="omni-app-shell">
        <header className="shell-header">
          <div className="shell-brand">
            <span className="brand-logo">◆</span>
            <span className="brand-title">OmniStore</span>
          </div>

          <nav className="shell-nav">
            <a href="/" className={currentPath === "/" ? "active" : ""}>Overview</a>
            <a href="/products" className={currentPath === "/products" ? "active" : ""}>Products</a>
            <a href="/cart" className={currentPath === "/cart" ? "active" : ""}>
              Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </a>
            <a href="/admin" className={currentPath === "/admin" ? "active" : ""}>Admin</a>
          </nav>
        </header>

        <main className="shell-content">
          <slot />
        </main>
      </div>
    );
  }
</client>`,
      },
      {
        name: 'routes/index.page.omni',
        type: 'page',
        content: `<client page="/">
  export default function HomePage() {
    const { data: stats, loading } = $query(server.getStats);
    const { data: catalog } = $query(server.getCatalog, { category: "all" });
    const [addToCart] = $mutation(server.addToCart, { invalidate: ["stats", "cart"] });

    return (
      <div className="page-home">
        <section className="hero-banner">
          <div className="hero-tag">OmniJS Multi-Page Engine</div>
          <h1>Unified Full-Stack Commerce</h1>
          <p>Zero-configuration file-based routing with server RPC loaders and instant state synchronization.</p>
          <div className="hero-ctas">
            <a href="/products" className="btn-primary">Browse Catalog →</a>
            <a href="/cart" className="btn-secondary">View Cart</a>
          </div>
        </section>

        {/* Live Metrics Strip */}
        <div className="kpi-strip">
          <div className="kpi-card">
            <span className="kpi-label">Catalog Items</span>
            <span className="kpi-val">{stats?.totalProducts || 4}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Active Orders</span>
            <span className="kpi-val">{stats?.totalOrders || 0}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Cart Items</span>
            <span className="kpi-val">{stats?.cartCount || 0}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Page Routes</span>
            <span className="kpi-val">4 Active</span>
          </div>
        </div>

        {/* Featured Showcase */}
        <section className="featured-section">
          <h2>Featured Hardware</h2>
          <div className="featured-grid">
            {catalog?.slice(0, 2).map(p => (
              <div key={p.id} className="featured-card">
                <span className="badge">{p.badge}</span>
                <h3>{p.title}</h3>
                <div className="card-footer">
                  <span className="price">\${p.price.toFixed(2)}</span>
                  <button on:click={() => addToCart({ productId: p.id, quantity: 1 })}>
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
</client>`,
      },
      {
        name: 'routes/products.page.omni',
        type: 'page',
        content: `<client page="/products">
  export default function ProductsPage() {
    const $category = $state("all");
    const $search = $state("");

    const { data: products, loading } = $query(
      server.getCatalog, 
      { category: $category, search: $search },
      { tags: ["products"] }
    );

    const [addToCart, { pending }] = $mutation(server.addToCart, {
      invalidate: ["stats", "cart", "products"],
      optimistic: (payload) => ({ success: true })
    });

    return (
      <div className="page-products">
        <div className="catalog-toolbar">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Filter by title..." 
              bind:value={$search} 
            />
          </div>
          <div className="filter-tabs">
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
        </div>

        {loading ? (
          <div className="loading-state">Loading catalog from RPC endpoint...</div>
        ) : (
          <div className="catalog-grid">
            {products?.map(p => (
              <div key={p.id} className="product-card">
                <span className="badge">{p.badge}</span>
                <h3>{p.title}</h3>
                <div className="specs">
                  <span>Category: {p.category}</span>
                  <span>{p.inventory} in stock</span>
                </div>
                <div className="price-row">
                  <span className="price">\${p.price.toFixed(2)}</span>
                  <button 
                    disabled={p.inventory === 0 || pending}
                    on:click={() => addToCart({ productId: p.id, quantity: 1 })}
                    className="add-btn"
                  >
                    {p.inventory === 0 ? "Sold Out" : "+ Add to Cart"}
                  </button>
                </div>
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
        name: 'routes/cart.page.omni',
        type: 'page',
        content: `<client page="/cart">
  export default function CartPage() {
    const { data: cartItems, loading, refetch } = $query(server.getCart, {}, { tags: ["cart"] });
    const [updateQty] = $mutation(server.updateCartQuantity, { invalidate: ["cart", "stats"] });
    const [clearCart] = $mutation(server.clearCart, { invalidate: ["cart", "stats"] });
    const [checkout, { pending: isCheckingOut }] = $mutation(server.checkoutCart, {
      invalidate: ["cart", "stats", "products"]
    });

    const subtotal = cartItems?.reduce((acc, item) => acc + item.subtotal, 0) || 0;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal > 0 ? subtotal + tax : 0;

    const handleCheckout = async () => {
      await checkout({ customerEmail: "buyer@omni.js" });
    };

    return (
      <div className="page-cart">
        <h2>Your Shopping Cart</h2>

        {cartItems?.length === 0 ? (
          <div className="empty-cart-state">
            <p>Your cart is empty.</p>
            <a href="/products" className="btn-primary">Browse Products</a>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              {cartItems?.map(item => (
                <div key={item.id} className="cart-item-row">
                  <div className="item-info">
                    <h4>{item.product.title}</h4>
                    <span className="unit-price">\${item.product.price.toFixed(2)} each</span>
                  </div>
                  <div className="qty-controls">
                    <button on:click={() => updateQty({ id: item.id, quantity: item.quantity - 1 })}>-</button>
                    <span className="qty-count">{item.quantity}</span>
                    <button on:click={() => updateQty({ id: item.id, quantity: item.quantity + 1 })}>+</button>
                  </div>
                  <span className="line-total">\${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <button on:click={() => clearCart()} className="clear-cart-link">Clear Entire Cart</button>
            </div>

            <div className="cart-summary-card">
              <h3>Order Summary</h3>
              <div className="summary-line">
                <span>Subtotal</span>
                <span>\${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Estimated Tax (8%)</span>
                <span>\${tax.toFixed(2)}</span>
              </div>
              <div className="summary-line total-line">
                <span>Total</span>
                <span>\${total.toFixed(2)}</span>
              </div>
              <button 
                disabled={isCheckingOut || total === 0} 
                on:click={handleCheckout} 
                className="checkout-btn"
              >
                {isCheckingOut ? "Processing Order..." : "Checkout & Pay"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
</client>`,
      },
      {
        name: 'routes/admin.page.omni',
        type: 'page',
        content: `<client page="/admin">
  export default function AdminConsole() {
    const $newTitle = $state("");
    const $newPrice = $state("99");
    const $newCategory = $state("hardware");

    const { data: stats } = $query(server.getStats);
    const { data: orders } = $query(server.getOrders);
    const { data: catalog } = $query(server.getCatalog, { category: "all" });

    const [addProduct] = $mutation(server.addProduct, { invalidate: ["products", "stats"] });
    const [deleteProduct] = $mutation(server.deleteProduct, { invalidate: ["products", "stats"] });

    const handleCreate = async (e) => {
      e.preventDefault();
      if (!$newTitle) return;
      await addProduct({
        title: $newTitle,
        price: parseFloat($newPrice),
        category: $newCategory,
        inventory: 15,
        badge: "New"
      });
      $newTitle = "";
    };

    return (
      <div className="page-admin">
        <div className="admin-header">
          <h2>Store Administration &amp; Operations</h2>
          <span className="role-tag">ROLE: ADMIN</span>
        </div>

        <div className="admin-grid">
          {/* Create Product Form */}
          <div className="admin-panel">
            <h3>Add New Product</h3>
            <form onSubmit={handleCreate} className="admin-form">
              <input type="text" placeholder="Product Title" bind:value={$newTitle} required />
              <input type="number" placeholder="Price ($)" bind:value={$newPrice} required />
              <select bind:value={$newCategory}>
                <option value="hardware">Hardware</option>
                <option value="display">Display</option>
                <option value="audio">Audio</option>
              </select>
              <button type="submit" className="btn-primary">+ Add Product</button>
            </form>
          </div>

          {/* Catalog Inventory Table */}
          <div className="admin-panel">
            <h3>Inventory Management</h3>
            <div className="admin-table">
              {catalog?.map(p => (
                <div key={p.id} className="table-row">
                  <span className="col-title">{p.title}</span>
                  <span className="col-stock">{p.inventory} in stock</span>
                  <span className="col-price">\${p.price.toFixed(2)}</span>
                  <button on:click={() => deleteProduct({ id: p.id })} className="btn-del">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders Log */}
        <div className="orders-panel">
          <h3>Recent Customer Orders ({orders?.length || 0})</h3>
          {orders?.length === 0 ? (
            <p className="empty-orders">No orders placed yet. Place an order from the /cart page!</p>
          ) : (
            <div className="orders-list">
              {orders?.map(o => (
                <div key={o.id} className="order-row">
                  <span className="order-id">#{o.id}</span>
                  <span className="order-customer">{o.customerEmail}</span>
                  <span className="order-total">\${o.total?.toFixed(2)}</span>
                  <span className="order-status">{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
</client>`,
      },
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

  table CartItem {
    id: uuid @primary @auto
    productId: uuid -> Product.id @onDelete(cascade)
    quantity: int @min(1) @default(1)
  }

  table Order {
    id: uuid @primary @auto
    customerEmail: string @email
    total: float
    itemCount: int @default(1)
    status: string @default("confirmed")
    createdAt: string
  }

  seed Product [
    { title: "Quantum Keychron K2 Mechanical Keyboard", category: "hardware", price: 119.00, inventory: 12, badge: "Best Seller" },
    { title: "Retina 4K Studio Curved Display 27-inch", category: "display", price: 849.00, inventory: 4, badge: "Pro Grade" },
    { title: "Spatial Audio Pro Noise-Canceling Headphones", category: "audio", price: 279.00, inventory: 18, badge: "Featured" },
    { title: "Precision Ergonomic Vertical Mouse", category: "hardware", price: 69.00, inventory: 25, badge: "Ergo" }
  ]
</schema>`,
      },
      {
        name: 'server.api.omni',
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

  query getCart() {
    return db.CartItem.findMany();
  }

  query getStats() {
    const products = await db.Product.findMany();
    const orders = await db.Order.findMany();
    const cart = await db.CartItem.findMany();
    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      cartCount: cart.reduce((acc, i) => acc + (i.quantity || 1), 0),
      revenue: orders.reduce((acc, o) => acc + (o.total || 0), 0)
    };
  }

  query getOrders() {
    return db.Order.findMany({ orderBy: { id: "desc" } });
  }

  mutation addToCart({ productId, quantity = 1 }) {
    const product = await db.Product.findById(productId);
    if (!product) throw new Error("Product not found");
    const existing = await db.CartItem.findFirst({ where: { productId } });
    if (existing) {
      return db.CartItem.update(existing.id, { quantity: existing.quantity + quantity });
    }
    return db.CartItem.create({ productId, quantity });
  }

  mutation updateCartQuantity({ id, quantity }) {
    if (quantity <= 0) return db.CartItem.delete(id);
    return db.CartItem.update(id, { quantity });
  }

  mutation clearCart() {
    return db.CartItem.deleteMany({});
  }

  mutation checkoutCart({ customerEmail }) {
    const items = await db.CartItem.findMany();
    if (!items.length) throw new Error("Cart is empty");
    
    let total = 0;
    for (const item of items) {
      const prod = await db.Product.findById(item.productId);
      if (prod) {
        total += prod.price * item.quantity;
        await db.Product.update(prod.id, { inventory: prod.inventory - item.quantity });
      }
      await db.CartItem.delete(item.id);
    }

    const order = await db.Order.create({
      customerEmail: customerEmail || "buyer@omni.js",
      total,
      itemCount: items.length,
      status: "confirmed"
    });

    job.dispatch("sendReceiptEmail", { orderId: order.id, total });
    return order;
  }

  mutation addProduct({ title, category, price, inventory = 10, badge = "New" }) @protect(role: "admin") {
    return db.Product.create({ title, category, price, inventory, badge });
  }

  mutation deleteProduct({ id }) @protect(role: "admin") {
    return db.Product.delete(id);
  }
</server>`,
      },
      {
        name: 'styles.omni',
        type: 'style',
        content: `<style scoped>
  .omni-app-shell { font-family: inherit; color: $text; }
  .shell-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.5rem; border-bottom: 1px solid $border; background: $surface; }
  .shell-brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 800; }
  .shell-nav { display: flex; gap: 1.25rem; font-size: 0.85rem; font-weight: 600; }
  .shell-nav a { color: $muted; text-decoration: none; position: relative; }
  .shell-nav a.active, .shell-nav a:hover { color: $primary; }
  .cart-badge { background: $primary; color: white; font-size: 0.65rem; border-radius: 9999px; padding: 0.1rem 0.4rem; margin-left: 0.25rem; }
  .shell-content { padding: 1.5rem; max-width: 1100px; margin: 0 auto; }

  /* KPI Strip */
  .kpi-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 1.5rem 0; }
  .kpi-card { background: $surface; border: 1px solid $border; border-radius: $radius-lg; padding: 1rem; }
  .kpi-label { font-size: 0.75rem; color: $muted; display: block; }
  .kpi-val { font-size: 1.5rem; font-weight: 800; color: $text; margin-top: 0.25rem; }

  /* Catalog grid */
  .catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
  .product-card { background: $surface; border: 1px solid $border; border-radius: $radius-lg; padding: 1.25rem; }
  .badge { font-size: 0.65rem; color: $accent; font-weight: 700; text-transform: uppercase; }
  .add-btn { background: $primary; color: white; border: none; padding: 0.5rem 1rem; border-radius: $radius-md; cursor: pointer; font-weight: 600; }

  @mobile {
    .kpi-strip { grid-template-columns: repeat(2, 1fr); }
    .catalog-grid { grid-template-columns: 1fr; }
  }
</style>`,
      },
      {
        name: 'routes.test.omni',
        type: 'test',
        content: `<test>
  suite "Multi-Page Contract & Routes" {
    test "GET / - stats returns catalog count" {
      const stats = await server.getStats();
      expect(stats.totalProducts).toBeGreaterThan(0);
    }

    test "POST /cart - adds item to cart" {
      await server.addToCart({ productId: "product_1", quantity: 1 });
      const cart = await server.getCart();
      expect(cart.length).toBeGreaterThan(0);
    }
  }
</test>`,
      },
    ],
  },
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
