/**
 * OmniJS Live Full-Stack Interactive Application Runner
 * Sandboxes compiled client UI with Multi-Page Routing (MPA) and multi-device viewports
 */

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Smartphone,
  Tablet,
  Monitor,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Layers,
  Check,
  CreditCard,
  Shield,
  PackageCheck,
  Home,
  Tag,
  Activity
} from 'lucide-react';
import { virtualRuntime } from '../framework/runtime';
import { OmniFileAST } from '../framework/parser';

interface RuntimePreviewProps {
  ast: OmniFileAST;
  onRefresh: () => void;
}

export const RuntimePreview: React.FC<RuntimePreviewProps> = ({ ast, onRefresh }) => {
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Multi-Page Routing State
  const initialPath = ast.pageRoute?.path || '/';
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [pathHistory, setPathHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // App Data States
  const [products, setProducts] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalProducts: 4, totalOrders: 0, cartCount: 0, revenue: 0 });
  const [tasks, setTasks] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'guest'>('admin');

  // Task form state
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  // Admin product creation state
  const [adminTitle, setAdminTitle] = useState('');
  const [adminPrice, setAdminPrice] = useState('89.00');
  const [adminCategory, setAdminCategory] = useState('hardware');

  // Checkout state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const isKanban = ast.fileName.includes('task') || (ast.schema?.tables.some((t) => t.name === 'Task'));

  // Sync route with selected file when user switches files in editor
  useEffect(() => {
    if (ast.pageRoute?.path && ast.pageRoute.path !== currentPath) {
      handleNavigate(ast.pageRoute.path);
    }
  }, [ast.fileName, ast.pageRoute?.path]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isKanban) {
        const res = await virtualRuntime.callQuery('getTasks');
        setTasks(res || []);
      } else {
        const [catalogRes, cartRes, ordersRes, statsRes] = await Promise.all([
          virtualRuntime.callQuery('getCatalog', { category, search }),
          virtualRuntime.callQuery('getCart'),
          virtualRuntime.callQuery('getOrders'),
          virtualRuntime.callQuery('getStats'),
        ]);
        setProducts(catalogRes || []);
        setCartItems(cartRes || []);
        setOrders(ordersRes || []);
        setStats(statsRes || { totalProducts: 4, totalOrders: 0, cartCount: 0, revenue: 0 });
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const unsub = virtualRuntime.onDbChange(() => {
      fetchData();
    });

    return () => {
      unsub();
    };
  }, [category, search, isKanban, currentPath]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Browser Navigation Handlers
  const handleNavigate = (path: string) => {
    if (path === currentPath) return;
    const nextHistory = pathHistory.slice(0, historyIndex + 1);
    nextHistory.push(path);
    setPathHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setCurrentPath(path);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setCurrentPath(pathHistory[newIdx]);
    }
  };

  const handleForward = () => {
    if (historyIndex < pathHistory.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setCurrentPath(pathHistory[newIdx]);
    }
  };

  const handleRefresh = () => {
    fetchData();
    onRefresh();
    showToast('Page refreshed.');
  };

  // Multi-page Store Actions
  const handleAddToCart = async (product: any) => {
    try {
      // Optimistic update
      setStats((prev: any) => ({ ...prev, cartCount: (prev.cartCount || 0) + 1 }));
      await virtualRuntime.callMutation(
        'addToCart',
        { productId: product.id, quantity: 1 },
        { invalidate: ['cart', 'stats'] }
      );
      showToast(`Added "${product.title}" to cart!`);
    } catch (err: any) {
      showToast(err.message, 'error');
      fetchData();
    }
  };

  const handleUpdateCartQty = async (itemId: string, newQty: number) => {
    try {
      await virtualRuntime.callMutation(
        'updateCartQuantity',
        { id: itemId, quantity: newQty },
        { invalidate: ['cart', 'stats'] }
      );
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      await virtualRuntime.callMutation('clearCart', {}, { invalidate: ['cart', 'stats'] });
      showToast('Cart cleared.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);
    try {
      const order = await virtualRuntime.callMutation(
        'checkoutCart',
        { customerEmail: virtualRuntime.currentSession.email },
        { invalidate: ['cart', 'stats', 'products'] }
      );
      setLastOrderId(order.id);
      showToast(`Order #${order.id} placed successfully! Receipt email job enqueued.`);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleAdminCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTitle.trim()) return;
    try {
      await virtualRuntime.callMutation(
        'addProduct',
        {
          title: adminTitle,
          price: parseFloat(adminPrice) || 49.99,
          category: adminCategory,
          inventory: 12,
          badge: 'New',
        },
        { invalidate: ['products', 'stats'] }
      );
      setAdminTitle('');
      showToast(`Product "${adminTitle}" added to catalog.`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleAdminDeleteProduct = async (id: string) => {
    try {
      await virtualRuntime.callMutation('deleteProduct', { id }, { invalidate: ['products', 'stats'] });
      showToast('Product removed from catalog.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Kanban Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await virtualRuntime.callMutation(
        'createTask',
        { title: newTitle, priority, assignedTo: virtualRuntime.currentSession.name },
        { invalidate: ['tasks'], optimistic: true }
      );
      setNewTitle('');
      showToast(`Task created!`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: string) => {
    try {
      await virtualRuntime.callMutation('updateTask', { id, updates: { status } }, { invalidate: ['tasks'] });
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await virtualRuntime.callMutation('deleteTask', { id }, { invalidate: ['tasks'] });
      showToast('Task removed.');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRoleChange = (role: 'admin' | 'user' | 'guest') => {
    setUserRole(role);
    virtualRuntime.currentSession.role = role;
    showToast(`Session updated to role: ${role}`);
  };

  // Cart total calculations
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  const cartTax = Math.round(cartSubtotal * 0.08 * 100) / 100;
  const cartGrandTotal = cartSubtotal > 0 ? cartSubtotal + cartTax : 0;
  const totalCartUnits = cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#07090e] text-slate-100">
      {/* Browser Bar with Navigation Arrows & URL Input */}
      <div className="h-10 px-3 sm:px-4 border-b border-slate-800/80 bg-slate-950 flex items-center justify-between text-xs shrink-0 gap-3">
        {/* Navigation Arrows & Refresh */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-900"
            title="Go Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= pathHistory.length - 1}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-900"
            title="Go Forward"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-900"
            title="Reload Page"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-md bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-slate-500 text-[11px]">http://localhost:3000</span>
            <select
              value={currentPath}
              onChange={(e) => handleNavigate(e.target.value)}
              className="bg-transparent text-sky-400 font-bold outline-none cursor-pointer text-xs"
            >
              <option value="/" className="bg-slate-900 text-slate-200">/ (Overview)</option>
              <option value="/products" className="bg-slate-900 text-slate-200">/products (Catalog)</option>
              <option value="/cart" className="bg-slate-900 text-slate-200">/cart (Checkout)</option>
              <option value="/admin" className="bg-slate-900 text-slate-200">/admin (Management)</option>
            </select>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold hidden sm:inline">MPA</span>
        </div>

        {/* Device Switcher & Session Controls */}
        <div className="flex items-center gap-2">
          {/* Viewport switch */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 rounded transition-colors ${
                viewportMode === 'desktop' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop 100%"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`p-1.5 rounded transition-colors ${
                viewportMode === 'tablet' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 rounded transition-colors ${
                viewportMode === 'mobile' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              virtualRuntime.initDatabase(ast);
              fetchData();
              showToast('Database reset to seeds.');
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800 hover:bg-slate-800"
            title="Reset Database Seeds"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`px-4 py-2 text-xs font-medium flex items-center gap-2 shrink-0 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-b border-emerald-800'
              : 'bg-red-950/90 text-red-300 border-b border-red-800'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Sandboxed Device Screen */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
        <div
          className={`w-full transition-all duration-300 ${
            viewportMode === 'mobile'
              ? 'max-w-[375px] bg-[#0c1017] border-2 border-slate-700 rounded-3xl p-4 shadow-2xl min-h-[640px]'
              : viewportMode === 'tablet'
              ? 'max-w-[768px] bg-[#0c1017] border border-slate-800 rounded-2xl p-5 shadow-xl min-h-[580px]'
              : 'max-w-5xl'
          }`}
        >
          {/* Phone Frame Notch (Mobile Mode) */}
          {viewportMode === 'mobile' && (
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-4" />
          )}

          {isKanban ? (
            /* Kanban Board Mode */
            <div className="space-y-6">
              <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
                <div className="flex gap-2">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="urgent">Urgent Priority</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              <div className={`grid gap-4 ${viewportMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
                {[
                  { id: 'todo', label: 'To Do', border: 'border-slate-800' },
                  { id: 'in-progress', label: 'In Progress', border: 'border-amber-900/40' },
                  { id: 'done', label: 'Completed', border: 'border-emerald-900/40' },
                ].map((col) => {
                  const colTasks = tasks.filter((t) => t.status === col.id);
                  return (
                    <div key={col.id} className={`bg-slate-900/50 border ${col.border} rounded-xl p-3 sm:p-4 flex flex-col gap-3`}>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                        <span>{col.label}</span>
                        <span className="font-mono text-slate-500 text-[11px]">{colTasks.length}</span>
                      </div>

                      <div className="space-y-2">
                        {colTasks.map((t) => (
                          <div key={t.id} className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg space-y-2 shadow-sm">
                            <div className="flex justify-between items-start">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  t.priority === 'urgent'
                                    ? 'bg-red-500/10 text-red-400'
                                    : t.priority === 'medium'
                                    ? 'bg-amber-500/10 text-amber-400'
                                    : 'bg-emerald-500/10 text-emerald-400'
                                }`}
                              >
                                {t.priority}
                              </span>
                              <button
                                onClick={() => handleDeleteTask(t.id)}
                                className="text-slate-500 hover:text-red-400 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <p className="text-xs text-slate-200 font-medium leading-relaxed">{t.title}</p>

                            <div className="flex gap-1.5 pt-1 text-[11px] flex-wrap">
                              {col.id !== 'todo' && (
                                <button
                                  onClick={() => handleUpdateTaskStatus(t.id, 'todo')}
                                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded"
                                >
                                  ← Todo
                                </button>
                              )}
                              {col.id !== 'in-progress' && (
                                <button
                                  onClick={() => handleUpdateTaskStatus(t.id, 'in-progress')}
                                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded"
                                >
                                  Doing
                                </button>
                              )}
                              {col.id !== 'done' && (
                                <button
                                  onClick={() => handleUpdateTaskStatus(t.id, 'done')}
                                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded"
                                >
                                  Done →
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Multi-Page Full-Stack Application Layout (routes/_layout.omni) */
            <div className="space-y-6">
              {/* Shared App Shell Header */}
              <div className="p-3 sm:p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                <div
                  onClick={() => handleNavigate('/')}
                  className="flex items-center gap-2 cursor-pointer font-extrabold text-sm tracking-tight text-white hover:text-sky-400 transition-colors"
                >
                  <span className="w-6 h-6 rounded bg-sky-500 text-slate-950 flex items-center justify-center text-xs font-black">
                    ◆
                  </span>
                  <span>OmniStore</span>
                </div>

                {/* Page Navigation Tabs */}
                <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium">
                  {[
                    { path: '/', label: 'Overview' },
                    { path: '/products', label: 'Products' },
                    { path: '/cart', label: `Cart`, count: totalCartUnits },
                    { path: '/admin', label: 'Admin' },
                  ].map((tab) => (
                    <button
                      key={tab.path}
                      onClick={() => handleNavigate(tab.path)}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                        currentPath === tab.path
                          ? 'bg-sky-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                            currentPath === tab.path ? 'bg-slate-950 text-white' : 'bg-sky-500/20 text-sky-400'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>

                {/* User Role Switcher */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <span>Role:</span>
                  {(['admin', 'user', 'guest'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize transition-colors ${
                        userRole === r ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* ROUTE 1: Home Overview (routes/index.page.omni) */}
              {currentPath === '/' && (
                <div className="space-y-6">
                  {/* Hero Banner */}
                  <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-mono">
                      OmniJS File-Based Multi-Page Engine
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white">Full-Stack Commerce Workbench</h2>
                    <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                      This application demonstrates file-based routing with co-located database schemas, server RPC loaders, client signals, and background jobs.
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => handleNavigate('/products')}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <span>Browse Catalog</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleNavigate('/cart')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>View Cart ({totalCartUnits})</span>
                      </button>
                    </div>
                  </div>

                  {/* Live KPI Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Catalog Products', val: products.length, tag: 'In Stock' },
                      { label: 'Active Orders', val: orders.length, tag: 'Confirmed' },
                      { label: 'Cart Items', val: totalCartUnits, tag: 'Pending' },
                      { label: 'Total Revenue', val: `$${stats.revenue?.toFixed(2) || '0.00'}`, tag: 'Processed' },
                    ].map((kpi, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{kpi.label}</span>
                        <div className="text-lg font-black text-white font-mono tabular-nums">{kpi.val}</div>
                        <span className="text-[10px] font-medium text-emerald-400">{kpi.tag}</span>
                      </div>
                    ))}
                  </div>

                  {/* Featured Products Spotlight */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-white">Featured Hardware</h3>
                      <button
                        onClick={() => handleNavigate('/products')}
                        className="text-xs text-sky-400 hover:underline"
                      >
                        View All ({products.length}) →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {products.slice(0, 2).map((p) => (
                        <div
                          key={p.id}
                          className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-amber-400 uppercase font-mono">{p.badge}</span>
                            <h4 className="text-sm font-bold text-white mt-0.5">{p.title}</h4>
                            <span className="text-xs font-mono text-slate-300 font-bold">${p.price.toFixed(2)}</span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-lg transition-colors shrink-0"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ROUTE 2: Products Catalog (routes/products.page.omni) */}
              {currentPath === '/products' && (
                <div className="space-y-6">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search catalog..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />

                    <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                      {['all', 'hardware', 'display', 'audio'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`px-2.5 py-1 rounded text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${
                            category === cat
                              ? 'bg-sky-500 text-slate-950 font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loading ? (
                    <div className="py-12 text-center text-xs text-slate-500">Executing server query...</div>
                  ) : (
                    <div
                      className={`grid gap-4 ${
                        viewportMode === 'mobile'
                          ? 'grid-cols-1'
                          : viewportMode === 'tablet'
                          ? 'grid-cols-2'
                          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      }`}
                    >
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors space-y-4"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                              {p.badge || p.category}
                            </span>
                            <h4 className="text-sm font-semibold text-white mt-1 leading-snug">{p.title}</h4>
                          </div>

                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                            <div>
                              <div className="text-base font-bold text-white font-mono tabular-nums">
                                ${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}
                              </div>
                              <span className="text-[11px] text-slate-400 tabular-nums">{p.inventory} available</span>
                            </div>

                            <button
                              onClick={() => handleAddToCart(p)}
                              disabled={p.inventory === 0}
                              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{p.inventory === 0 ? 'Sold Out' : 'Add to Cart'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ROUTE 3: Shopping Cart & Checkout (routes/cart.page.omni) */}
              {currentPath === '/cart' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">Your Shopping Cart</h3>
                      <span className="text-xs text-slate-400">{cartItems.length} unique items in cart</span>
                    </div>

                    {cartItems.length > 0 && (
                      <button
                        onClick={handleClearCart}
                        className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                      >
                        Clear Cart
                      </button>
                    )}
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="py-16 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                      <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm text-slate-300">Your cart is currently empty.</p>
                      <button
                        onClick={() => handleNavigate('/products')}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg inline-flex items-center gap-1.5"
                      >
                        <span>Browse Products</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Cart Items List */}
                      <div className="lg:col-span-2 space-y-3">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white truncate">{item.product.title}</h4>
                              <span className="text-xs text-slate-400 font-mono">
                                ${item.product.price?.toFixed(2)} each
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
                                className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center justify-center font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-mono font-bold">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
                                className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center justify-center font-bold text-xs"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-sm font-bold text-white font-mono tabular-nums text-right w-20">
                              ${item.subtotal?.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary & Checkout Card */}
                      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4 h-fit">
                        <h4 className="text-sm font-bold text-white">Order Summary</h4>

                        <div className="space-y-2 text-xs text-slate-300 font-mono">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${cartSubtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estimated Tax (8%)</span>
                            <span>${cartTax.toFixed(2)}</span>
                          </div>
                          <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                            <span>Total</span>
                            <span>${cartGrandTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        <button
                          onClick={handleCheckout}
                          disabled={isCheckingOut || cartItems.length === 0}
                          className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{isCheckingOut ? 'Processing Order...' : 'Checkout & Pay'}</span>
                        </button>

                        <div className="text-[10px] text-slate-500 text-center space-y-1">
                          <p>Simulated atomic transaction with receipt email dispatch.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Last Order Receipt Banner */}
                  {lastOrderId && (
                    <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PackageCheck className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h4 className="text-xs font-bold text-emerald-300">Order #{lastOrderId} Confirmed!</h4>
                          <span className="text-[11px] text-emerald-400/80">
                            Receipt email enqueued to {virtualRuntime.currentSession.email}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNavigate('/admin')}
                        className="text-xs text-emerald-300 hover:underline font-medium"
                      >
                        View in Admin Log →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ROUTE 4: Admin Management (routes/admin.page.omni) */}
              {currentPath === '/admin' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white">Store Administration Console</h3>
                      <span className="text-xs text-slate-400">Inventory control, order ledger &amp; worker queues</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      ROLE: {userRole.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Product Form */}
                    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        + Add New Product
                      </h4>
                      <form onSubmit={handleAdminCreateProduct} className="space-y-2.5 text-xs">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Product Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Ergonomic Keyboard"
                            value={adminTitle}
                            onChange={(e) => setAdminTitle(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-sky-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Price ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={adminPrice}
                              onChange={(e) => setAdminPrice(e.target.value)}
                              required
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-sky-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                            <select
                              value={adminCategory}
                              onChange={(e) => setAdminCategory(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-sky-500"
                            >
                              <option value="hardware">Hardware</option>
                              <option value="display">Display</option>
                              <option value="audio">Audio</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded transition-colors mt-2"
                        >
                          Publish to Catalog
                        </button>
                      </form>
                    </div>

                    {/* Inventory Table */}
                    <div className="lg:col-span-2 p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Active Inventory ({products.length} Products)
                      </h4>
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {products.map((p) => (
                          <div
                            key={p.id}
                            className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs"
                          >
                            <div className="truncate flex-1 mr-2">
                              <span className="font-semibold text-white">{p.title}</span>
                              <span className="text-[10px] text-slate-500 ml-2 font-mono">({p.category})</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 font-mono">
                              <span className="text-slate-300 font-bold">${p.price.toFixed(2)}</span>
                              <span className="text-slate-500">{p.inventory} left</span>
                              <button
                                onClick={() => handleAdminDeleteProduct(p.id)}
                                className="text-slate-500 hover:text-red-400 p-1"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Customer Orders History Table */}
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Recent Customer Orders ({orders.length})
                    </h4>
                    {orders.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3">No orders placed yet.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {orders.map((o) => (
                          <div
                            key={o.id}
                            className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs font-mono"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sky-400 font-bold">#{o.id}</span>
                              <span className="text-slate-400">{o.customerEmail}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-white font-bold">${o.total?.toFixed(2)}</span>
                              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
