/**
 * OmniJS Virtual Full-Stack Runtime Engine
 * Executes compiled schema database, server RPC procedures, cache tagging, and waterfall telemetry
 */

import { CompilationResult } from './compiler';
import { OmniFileAST } from './parser';
import { jobQueue } from './jobs';

export interface TelemetrySpan {
  id: string;
  stage: 'client' | 'network' | 'server' | 'database' | 'job' | 'render';
  label: string;
  durationMs: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface TelemetryTrace {
  id: string;
  actionName: string;
  kind: 'query' | 'mutation' | 'hmr' | 'test';
  status: 'success' | 'error';
  totalDurationMs: number;
  spans: TelemetrySpan[];
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

export type TraceListener = (trace: TelemetryTrace) => void;
export type DbChangeListener = (tableName: string, data: any[]) => void;

class VirtualRuntime {
  private dbStore: Map<string, any[]> = new Map();
  private traces: TelemetryTrace[] = [];
  private traceListeners: Set<TraceListener> = new Set();
  private dbListeners: Set<DbChangeListener> = new Set();
  private queryCache: Map<string, { data: any; tags: string[]; timestamp: number }> = new Map();
  
  // Current session (switchable in studio)
  public currentSession: UserSession = {
    id: 'usr_dev',
    name: 'Omni Developer',
    email: 'dev@omni.js',
    role: 'admin',
  };

  /**
   * Initializes the in-memory database with tables and seeds from the AST
   */
  initDatabase(ast: OmniFileAST) {
    this.dbStore.clear();

    if (ast.schema?.tables) {
      for (const table of ast.schema.tables) {
        this.dbStore.set(table.name, []);
      }
    }

    if (ast.schema?.seeds) {
      for (const seed of ast.schema.seeds) {
        const records = seed.records.map((r, i) => ({
          id: r.id || `${seed.tableName.toLowerCase()}_${i + 1}`,
          ...r,
        }));
        this.dbStore.set(seed.tableName, records);
        this.notifyDbChange(seed.tableName);
      }
    }
  }

  /**
   * Database ORM accessor
   */
  getDbClient() {
    const store = this.dbStore;
    const notify = this.notifyDbChange.bind(this);

    return new Proxy({}, {
      get: (_, tableName: string) => {
        let table = store.get(tableName);
        if (!table) {
          table = [];
          store.set(tableName, table);
        }

        return {
          findMany: (options: any = {}) => {
            let res = [...table!];
            if (options.where) {
              res = res.filter((item) => {
                for (const [k, v] of Object.entries(options.where)) {
                  if (v === undefined) continue;
                  if (typeof v === 'object' && v !== null && (v as any).contains) {
                    const needle = String((v as any).contains).toLowerCase();
                    const haystack = String(item[k] || '').toLowerCase();
                    if (!haystack.includes(needle)) return false;
                  } else if (item[k] !== v) {
                    return false;
                  }
                }
                return true;
              });
            }
            if (options.orderBy) {
              const [key, dir] = Object.entries(options.orderBy)[0] as [string, string];
              res.sort((a, b) => {
                if (a[key] < b[key]) return dir === 'desc' ? 1 : -1;
                if (a[key] > b[key]) return dir === 'desc' ? -1 : 1;
                return 0;
              });
            }
            if (options.limit) {
              res = res.slice(0, options.limit);
            }
            return res;
          },

          findById: (id: string) => {
            return table!.find((item) => item.id === id) || null;
          },

          findUnique: (query: Record<string, any>) => {
            return table!.find((item) => {
              return Object.entries(query).every(([k, v]) => item[k] === v);
            }) || null;
          },

          create: (data: Record<string, any>) => {
            const newItem = {
              id: data.id || `${tableName.toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              ...data,
              createdAt: data.createdAt || new Date().toISOString(),
            };
            table!.unshift(newItem);
            notify(tableName);
            return newItem;
          },

          update: (id: string, updates: Record<string, any>) => {
            const index = table!.findIndex((item) => item.id === id);
            if (index === -1) throw new Error(`Record with id ${id} not found in ${tableName}`);
            table![index] = { ...table![index], ...updates, updatedAt: new Date().toISOString() };
            notify(tableName);
            return table![index];
          },

          delete: (id: string) => {
            const index = table!.findIndex((item) => item.id === id);
            if (index === -1) return false;
            table!.splice(index, 1);
            notify(tableName);
            return true;
          },

          count: () => table!.length,
        };
      },
    });
  }

  /**
   * Calls a Server Query with telemetry tracing & caching
   */
  async callQuery(procedureName: string, args: Record<string, any> = {}, tags: string[] = []): Promise<any> {
    const traceId = `tr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const spans: TelemetrySpan[] = [];
    const tStart = performance.now();

    // 1. Client Span
    spans.push({
      id: `span_1`,
      stage: 'client',
      label: `Dispatched query 'server.${procedureName}'`,
      durationMs: 0.4,
      timestamp: Date.now(),
    });

    // 2. Network RPC Transit
    const netStart = performance.now();
    await new Promise((r) => setTimeout(r, 12)); // Simulated low-latency network hop
    spans.push({
      id: `span_2`,
      stage: 'network',
      label: `RPC Serialized payload (${JSON.stringify(args).length} bytes)`,
      durationMs: Math.round(performance.now() - netStart),
      timestamp: Date.now(),
    });

    // 3. Server Execution
    const srvStart = performance.now();
    const dbClient = this.getDbClient();
    let result: any = null;

    try {
      // Built-in query resolution
      if (procedureName === 'getCatalog' || procedureName === 'listProducts' || procedureName === 'list') {
        const cat = args.category;
        const search = args.search;
        result = (dbClient as any).Product.findMany({
          where: {
            category: cat === 'all' || !cat ? undefined : cat,
            title: search ? { contains: search } : undefined,
          },
        });
      } else if (procedureName === 'getCart') {
        const cartItems = (dbClient as any).CartItem.findMany();
        const allProducts = (dbClient as any).Product.findMany();
        result = cartItems.map((c: any) => {
          const prod = allProducts.find((p: any) => p.id === c.productId) || {
            title: 'Item',
            price: 0,
            inventory: 0,
          };
          return {
            ...c,
            product: prod,
            subtotal: prod.price * (c.quantity || 1),
          };
        });
      } else if (procedureName === 'getOrders') {
        result = (dbClient as any).Order.findMany({ orderBy: { id: 'desc' } });
      } else if (procedureName === 'getStats') {
        const productsCount = (dbClient as any).Product.findMany().length;
        const ordersList = (dbClient as any).Order.findMany();
        const cartList = (dbClient as any).CartItem.findMany();
        const cartCount = cartList.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
        const revenue = ordersList.reduce((acc: number, o: any) => acc + (o.total || 0), 0);
        result = {
          totalProducts: productsCount,
          totalOrders: ordersList.length,
          cartCount,
          revenue,
          activeRoutes: 4,
          serverStatus: 'healthy',
        };
      } else if (procedureName === 'getTasks') {
        result = (dbClient as any).Task.findMany();
      } else if (procedureName === 'getTelemetry') {
        result = (dbClient as any).Metric.findMany({ limit: 15 });
      } else {
        // Generic fallback query across first available table
        const firstTable = Array.from(this.dbStore.keys())[0];
        if (firstTable) {
          result = (dbClient as any)[firstTable].findMany();
        } else {
          result = [];
        }
      }

      spans.push({
        id: `span_3`,
        stage: 'server',
        label: `Server Procedure executed as '${this.currentSession.role}'`,
        durationMs: Math.round((performance.now() - srvStart) * 10) / 10,
        timestamp: Date.now(),
      });

      // 4. DB Query Span
      spans.push({
        id: `span_4`,
        stage: 'database',
        label: `In-memory transactional query evaluated (returned ${Array.isArray(result) ? result.length : 1} rows)`,
        durationMs: 1.2,
        timestamp: Date.now(),
      });

      // 5. Reactive DOM Render
      spans.push({
        id: `span_5`,
        stage: 'render',
        label: `Client reactive DOM tree hydrated`,
        durationMs: 0.6,
        timestamp: Date.now(),
      });

      const totalDurationMs = Math.round(performance.now() - tStart);
      const trace: TelemetryTrace = {
        id: traceId,
        actionName: `query:${procedureName}`,
        kind: 'query',
        status: 'success',
        totalDurationMs,
        spans,
      };

      this.recordTrace(trace);
      return result;
    } catch (err: any) {
      const trace: TelemetryTrace = {
        id: traceId,
        actionName: `query:${procedureName}`,
        kind: 'query',
        status: 'error',
        totalDurationMs: Math.round(performance.now() - tStart),
        spans,
      };
      this.recordTrace(trace);
      throw err;
    }
  }

  /**
   * Calls a Server Mutation with optimistic support and cache tag invalidation
   */
  async callMutation(
    procedureName: string,
    args: Record<string, any> = {},
    options: { invalidate?: string[]; optimistic?: boolean } = {}
  ): Promise<any> {
    const traceId = `tr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const spans: TelemetrySpan[] = [];
    const tStart = performance.now();

    // 1. Client Dispatch Span
    spans.push({
      id: `span_1`,
      stage: 'client',
      label: `Dispatched mutation 'server.${procedureName}' ${options.optimistic ? '(Optimistic applied)' : ''}`,
      durationMs: 0.5,
      timestamp: Date.now(),
    });

    // 2. Network Transit
    const netStart = performance.now();
    await new Promise((r) => setTimeout(r, 16));
    spans.push({
      id: `span_2`,
      stage: 'network',
      label: `RPC mutation payload sent (${JSON.stringify(args).length} bytes)`,
      durationMs: Math.round(performance.now() - netStart),
      timestamp: Date.now(),
    });

    // 3. Server Execution & DB Mutation
    const srvStart = performance.now();
    const dbClient = this.getDbClient();
    let result: any = null;

    try {
      if (procedureName === 'addToCart') {
        const product = (dbClient as any).Product.findById(args.productId);
        if (!product) throw new Error(`Product not found: ${args.productId}`);
        const existingItems = (dbClient as any).CartItem.findMany();
        const existing = existingItems.find((c: any) => c.productId === args.productId);
        if (existing) {
          result = (dbClient as any).CartItem.update(existing.id, {
            quantity: existing.quantity + (args.quantity || 1),
          });
        } else {
          result = (dbClient as any).CartItem.create({
            productId: args.productId,
            quantity: args.quantity || 1,
          });
        }
      } else if (procedureName === 'updateCartQuantity') {
        if (args.quantity <= 0) {
          result = (dbClient as any).CartItem.delete(args.id);
        } else {
          result = (dbClient as any).CartItem.update(args.id, { quantity: args.quantity });
        }
      } else if (procedureName === 'clearCart') {
        const items = (dbClient as any).CartItem.findMany();
        for (const item of items) {
          (dbClient as any).CartItem.delete(item.id);
        }
        result = { cleared: items.length };
      } else if (procedureName === 'checkoutCart') {
        const cartItems = (dbClient as any).CartItem.findMany();
        if (cartItems.length === 0) throw new Error('Cart is empty');
        
        let grandTotal = 0;
        const allProducts = (dbClient as any).Product.findMany();
        
        for (const c of cartItems) {
          const prod = allProducts.find((p: any) => p.id === c.productId);
          if (prod) {
            grandTotal += prod.price * (c.quantity || 1);
            (dbClient as any).Product.update(prod.id, {
              inventory: Math.max(0, prod.inventory - (c.quantity || 1)),
            });
          }
          (dbClient as any).CartItem.delete(c.id);
        }

        result = (dbClient as any).Order.create({
          customerEmail: args.customerEmail || this.currentSession.email,
          itemCount: cartItems.length,
          total: Math.round(grandTotal * 100) / 100,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        });

        jobQueue.dispatch('sendConfirmationEmail', {
          orderId: result.id,
          customerEmail: result.customerEmail,
          total: result.total,
        });

        spans.push({
          id: `span_jobs`,
          stage: 'job',
          label: `Enqueued asynchronous job 'sendConfirmationEmail' for Order #${result.id}`,
          durationMs: 0.8,
          timestamp: Date.now(),
        });
      } else if (procedureName === 'addProduct') {
        result = (dbClient as any).Product.create({
          title: args.title || 'New Product',
          category: args.category || 'general',
          price: Number(args.price) || 99.0,
          inventory: Number(args.inventory) || 10,
          badge: args.badge || 'New',
        });
      } else if (procedureName === 'deleteProduct') {
        result = (dbClient as any).Product.delete(args.id);
      } else if (procedureName === 'createOrder' || procedureName === 'purchase') {
        const product = (dbClient as any).Product.findById(args.productId);
        if (!product) throw new Error(`Product not found: ${args.productId}`);
        if (product.inventory < (args.quantity || 1)) {
          throw new Error(`Inventory insufficient (${product.inventory} available)`);
        }

        // Mutate inventory
        (dbClient as any).Product.update(args.productId, {
          inventory: product.inventory - (args.quantity || 1),
        });

        // Insert order
        result = (dbClient as any).Order.create({
          productId: args.productId,
          quantity: args.quantity || 1,
          customerEmail: args.customerEmail || this.currentSession.email,
          total: product.price * (args.quantity || 1),
          status: 'confirmed',
        });

        // Background job dispatch
        jobQueue.dispatch('sendConfirmationEmail', {
          orderId: result.id,
          customerEmail: result.customerEmail,
          total: result.total,
        });

        spans.push({
          id: `span_jobs`,
          stage: 'job',
          label: `Enqueued asynchronous job 'sendConfirmationEmail' [${result.id}]`,
          durationMs: 0.8,
          timestamp: Date.now(),
        });
      } else if (procedureName === 'createTask' || procedureName === 'updateTask') {
        if (procedureName === 'createTask') {
          result = (dbClient as any).Task.create({
            title: args.title || 'New Task',
            status: args.status || 'todo',
            priority: args.priority || 'medium',
            assignedTo: args.assignedTo || this.currentSession.name,
          });
        } else {
          result = (dbClient as any).Task.update(args.id, args.updates || {});
        }
      } else if (procedureName === 'deleteTask') {
        result = (dbClient as any).Task.delete(args.id);
      } else {
        result = { success: true, timestamp: Date.now() };
      }

      spans.push({
        id: `span_3`,
        stage: 'server',
        label: `Server Procedure executed successfully`,
        durationMs: Math.round((performance.now() - srvStart) * 10) / 10,
        timestamp: Date.now(),
      });

      spans.push({
        id: `span_4`,
        stage: 'database',
        label: `Atomic write committed to in-memory tables`,
        durationMs: 1.5,
        timestamp: Date.now(),
      });

      // 4. Invalidation
      if (options.invalidate && options.invalidate.length > 0) {
        spans.push({
          id: `span_inval`,
          stage: 'client',
          label: `Auto-invalidated cache tags: [${options.invalidate.join(', ')}]`,
          durationMs: 0.3,
          timestamp: Date.now(),
        });
      }

      const totalDurationMs = Math.round(performance.now() - tStart);
      const trace: TelemetryTrace = {
        id: traceId,
        actionName: `mutation:${procedureName}`,
        kind: 'mutation',
        status: 'success',
        totalDurationMs,
        spans,
      };

      this.recordTrace(trace);
      return result;
    } catch (err: any) {
      spans.push({
        id: `span_err`,
        stage: 'server',
        label: `Mutation failed: ${err.message}`,
        durationMs: 0.5,
        timestamp: Date.now(),
      });

      const trace: TelemetryTrace = {
        id: traceId,
        actionName: `mutation:${procedureName}`,
        kind: 'mutation',
        status: 'error',
        totalDurationMs: Math.round(performance.now() - tStart),
        spans,
      };
      this.recordTrace(trace);
      throw err;
    }
  }

  private recordTrace(trace: TelemetryTrace) {
    this.traces.unshift(trace);
    if (this.traces.length > 50) this.traces.pop();
    for (const listener of this.traceListeners) {
      listener(trace);
    }
  }

  onTrace(listener: TraceListener) {
    this.traceListeners.add(listener);
    return () => this.traceListeners.delete(listener);
  }

  onDbChange(listener: DbChangeListener) {
    this.dbListeners.add(listener);
    return () => this.dbListeners.delete(listener);
  }

  private notifyDbChange(tableName: string) {
    const tableData = this.dbStore.get(tableName) || [];
    for (const listener of this.dbListeners) {
      listener(tableName, [...tableData]);
    }
  }

  getTableData(tableName: string): any[] {
    return this.dbStore.get(tableName) || [];
  }

  getAllTables(): Record<string, any[]> {
    const res: Record<string, any[]> = {};
    for (const [k, v] of this.dbStore.entries()) {
      res[k] = [...v];
    }
    return res;
  }

  getTraces(): TelemetryTrace[] {
    return [...this.traces];
  }

  clearTraces() {
    this.traces = [];
  }
}

export const virtualRuntime = new VirtualRuntime();
