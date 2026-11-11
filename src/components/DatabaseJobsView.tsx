/**
 * OmniJS Database Table Explorer & Background Job Queue Inspector
 */

import React, { useState, useEffect } from 'react';
import { Database, Clock, RefreshCw, Trash2, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { virtualRuntime } from '../framework/runtime';
import { jobQueue, BackgroundJob } from '../framework/jobs';

export const DatabaseJobsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'db' | 'jobs'>('db');
  const [tables, setTables] = useState<Record<string, any[]>>({});
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);

  const refreshData = () => {
    const allTables = virtualRuntime.getAllTables();
    setTables(allTables);
    if (!selectedTable && Object.keys(allTables).length > 0) {
      setSelectedTable(Object.keys(allTables)[0]);
    }
    setJobs(jobQueue.getJobs());
  };

  useEffect(() => {
    refreshData();

    const unsubDb = virtualRuntime.onDbChange(() => {
      refreshData();
    });

    const unsubJobs = jobQueue.subscribe(() => {
      setJobs(jobQueue.getJobs());
    });

    return () => {
      unsubDb();
      unsubJobs();
    };
  }, []);

  const tableNames = Object.keys(tables);
  const currentRows = selectedTable ? tables[selectedTable] || [] : [];
  const columns = currentRows.length > 0 ? Object.keys(currentRows[0]) : [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header Switcher */}
      <div className="h-10 px-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('db')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'db' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Tables</span>
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'jobs' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Job Queue ({jobs.length})</span>
          </button>
        </div>

        <button
          onClick={refreshData}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          title="Refresh Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {activeTab === 'db' ? (
        /* Database Table Viewer */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Table Selector Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-1 text-xs shrink-0 font-mono">
            {tableNames.length === 0 ? (
              <span className="py-1 text-slate-500 text-xs">No tables created yet.</span>
            ) : (
              tableNames.map((tName) => (
                <button
                  key={tName}
                  onClick={() => setSelectedTable(tName)}
                  className={`px-3 py-1.5 rounded-t-lg transition-colors ${
                    selectedTable === tName
                      ? 'bg-slate-900 text-emerald-400 font-semibold border-t border-x border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tName} ({tables[tName]?.length || 0})
                </button>
              ))
            )}
          </div>

          {/* Table Data Grid */}
          <div className="flex-1 overflow-auto">
            {currentRows.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Table &apos;{selectedTable}&apos; is currently empty.
              </div>
            ) : (
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="bg-slate-900/80 sticky top-0 border-b border-slate-800 text-slate-400">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="p-3 font-semibold text-[11px] uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {currentRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      {columns.map((col) => (
                        <td key={col} className="p-3 truncate max-w-xs tabular-nums">
                          {typeof row[col] === 'boolean' ? (
                            <span className={row[col] ? 'text-emerald-400' : 'text-slate-500'}>
                              {row[col] ? 'true' : 'false'}
                            </span>
                          ) : typeof row[col] === 'object' ? (
                            JSON.stringify(row[col])
                          ) : (
                            String(row[col] ?? '')
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* Background Jobs Queue Viewer */
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Active and Completed Background Workers</span>
            <button
              onClick={() => {
                jobQueue.clear();
                setJobs([]);
              }}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Queue
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
              No background jobs in queue. Make a purchase or dispatch a job to inspect worker logs.
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((j) => (
                <div key={j.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{j.name}</span>
                      <span className="text-slate-500 text-[10px]">[{j.id}]</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          j.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : j.status === 'running'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {j.status}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Payload: <code className="text-slate-300">{JSON.stringify(j.payload)}</code>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 tabular-nums">
                    <span>{j.durationMs !== undefined ? `${j.durationMs}ms` : 'pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
