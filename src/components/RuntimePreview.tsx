/**
 * OmniJS Live Full-Stack Interactive Application Runner
 * Sandboxes the compiled client UI, executing real RPC queries/mutations against the virtual runtime
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  UserCheck,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { virtualRuntime } from '../framework/runtime';
import { OmniFileAST } from '../framework/parser';

interface RuntimePreviewProps {
  ast: OmniFileAST;
  onRefresh: () => void;
}

export const RuntimePreview: React.FC<RuntimePreviewProps> = ({ ast, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'app' | 'state'>('app');
  const [products, setProducts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'guest'>('admin');

  // Task form state
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  const isKanban = ast.fileName.includes('task') || (ast.schema?.tables.some((t) => t.name === 'Task'));

  // Load initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (isKanban) {
        const res = await virtualRuntime.callQuery('getTasks');
        setTasks(res || []);
      } else {
        const res = await virtualRuntime.callQuery('getCatalog', { category, search });
        setProducts(res || []);
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
  }, [category, search, isKanban]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuyProduct = async (product: any) => {
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inventory: Math.max(0, p.inventory - 1) } : p))
      );

      await virtualRuntime.callMutation(
        'createOrder',
        { productId: product.id, quantity: 1, customerEmail: 'buyer@omni.js' },
        { invalidate: ['products'], optimistic: true }
      );

      showToast(`Order placed for ${product.title}! Receipt job enqueued.`);
    } catch (err: any) {
      showToast(err.message, 'error');
      fetchData(); // Rollback
    }
  };

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Sandbox Header */}
      <div className="h-10 px-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-slate-200">Live Preview</span>
          <span className="text-slate-500 font-mono text-[11px]">(HMR Active)</span>
        </div>

        {/* User Role Switcher for RBAC */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px] font-mono">Role:</span>
          {(['admin', 'user', 'guest'] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition-colors ${
                userRole === r ? 'bg-sky-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}

          <button
            onClick={() => {
              virtualRuntime.initDatabase(ast);
              fetchData();
              showToast('Database reset to initial seeds.');
            }}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 ml-2"
            title="Reset DB Seeds"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`px-4 py-2 text-xs font-medium flex items-center gap-2 shrink-0 ${
            notification.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800' : 'bg-red-950/80 text-red-300 border-b border-red-800'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Rendered Sandbox Viewport */}
      <div className="flex-1 overflow-y-auto p-6">
        {isKanban ? (
          /* Kanban Board View */
          <div className="space-y-6">
            <form onSubmit={handleCreateTask} className="flex gap-2">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
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
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'todo', label: 'To Do', color: 'border-slate-800' },
                { id: 'in-progress', label: 'In Progress', color: 'border-amber-900/40' },
                { id: 'done', label: 'Completed', color: 'border-emerald-900/40' },
              ].map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.id);
                return (
                  <div key={col.id} className={`bg-slate-900/60 border ${col.color} rounded-xl p-4 flex flex-col gap-3`}>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                      <span>{col.label}</span>
                      <span className="font-mono text-slate-500">{colTasks.length}</span>
                    </div>

                    <div className="space-y-2">
                      {colTasks.map((t) => (
                        <div key={t.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
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

                          <p className="text-xs text-slate-200 font-medium">{t.title}</p>

                          <div className="flex gap-1.5 pt-1 text-[11px]">
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
          /* E-Commerce ShopPulse View */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <input
                type="text"
                placeholder="Search catalog..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />

              <div className="flex gap-1.5">
                {['all', 'hardware', 'display', 'audio'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wider transition-colors ${
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors space-y-4"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        {p.badge || p.category}
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-1 leading-snug">{p.title}</h4>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <div>
                        <div className="text-base font-bold text-white font-mono">
                          ${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}
                        </div>
                        <span className="text-[11px] text-slate-400">{p.inventory} available</span>
                      </div>

                      <button
                        onClick={() => handleBuyProduct(p)}
                        disabled={p.inventory === 0}
                        className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {p.inventory === 0 ? 'Sold Out' : 'Buy Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
