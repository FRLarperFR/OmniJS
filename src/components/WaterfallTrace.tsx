/**
 * OmniJS Full-Stack Waterfall Telemetry & Profiler
 * Visualizes the complete request lifecycle: Client -> Network -> Server -> DB -> Reactive DOM
 */

import React, { useState, useEffect } from 'react';
import { Activity, Clock, Layers, Database, ArrowRight, Zap, RefreshCw, Trash2 } from 'lucide-react';
import { virtualRuntime, TelemetryTrace } from '../framework/runtime';

export const WaterfallTrace: React.FC = () => {
  const [traces, setTraces] = useState<TelemetryTrace[]>([]);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);

  useEffect(() => {
    setTraces(virtualRuntime.getTraces());

    const unsub = virtualRuntime.onTrace(() => {
      setTraces(virtualRuntime.getTraces());
    });

    return () => {
      unsub();
    };
  }, []);

  const activeTrace = traces.find((t) => t.id === selectedTraceId) || traces[0];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'client':
        return 'bg-amber-400 text-amber-950';
      case 'network':
        return 'bg-blue-400 text-blue-950';
      case 'server':
        return 'bg-purple-400 text-purple-950';
      case 'database':
        return 'bg-emerald-400 text-emerald-950';
      case 'job':
        return 'bg-pink-400 text-pink-950';
      case 'render':
        return 'bg-sky-400 text-sky-950';
      default:
        return 'bg-slate-400 text-slate-950';
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950 text-slate-100">
      {/* Trace List on Left */}
      <div className="w-64 border-r border-slate-800 bg-slate-950/80 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            Request Traces
          </span>
          <button
            onClick={() => {
              virtualRuntime.clearTraces();
              setTraces([]);
              setSelectedTraceId(null);
            }}
            className="text-slate-500 hover:text-white p-1 rounded"
            title="Clear Traces"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {traces.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No network requests yet. Interact with the Live App to trigger RPC traces.
            </div>
          ) : (
            traces.map((trace) => {
              const isSelected = (selectedTraceId || traces[0]?.id) === trace.id;
              return (
                <button
                  key={trace.id}
                  onClick={() => setSelectedTraceId(trace.id)}
                  className={`w-full p-2.5 rounded-lg text-left transition-colors border ${
                    isSelected
                      ? 'bg-sky-500/10 border-sky-500/30 text-white'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-semibold truncate text-slate-200">
                      {trace.actionName}
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400 font-bold">
                      {trace.totalDurationMs}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                    <span className="uppercase">{trace.kind}</span>
                    <span>·</span>
                    <span>{trace.spans.length} spans</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Trace Waterfall Detail */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
        {activeTrace ? (
          <>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-mono text-sky-400 uppercase font-bold tracking-wider">
                  Trace ID: {activeTrace.id}
                </span>
                <h3 className="text-xl font-bold text-white mt-1 font-mono">
                  {activeTrace.actionName}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {activeTrace.totalDurationMs} ms
                </span>
                <span className="block text-[11px] text-slate-400">Total Roundtrip</span>
              </div>
            </div>

            {/* Stage legend */}
            <div className="flex items-center gap-3 text-[11px] font-mono flex-wrap">
              <span className="text-slate-500 font-semibold uppercase">Stages:</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Client</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Network RPC</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Server</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Database</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-400" /> Background Job</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> DOM Render</span>
            </div>

            {/* Waterfall Timeline Spans */}
            <div className="space-y-3">
              {activeTrace.spans.map((span, idx) => (
                <div key={span.id} className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${getStageColor(span.stage)}`}>
                        {span.stage}
                      </span>
                      <span className="font-semibold text-slate-200">{span.label}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-xs font-semibold">
                      {span.durationMs}ms
                    </span>
                  </div>

                  {/* Visual Duration Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        span.stage === 'database'
                          ? 'bg-emerald-400'
                          : span.stage === 'server'
                          ? 'bg-purple-400'
                          : span.stage === 'network'
                          ? 'bg-blue-400'
                          : span.stage === 'job'
                          ? 'bg-pink-400'
                          : 'bg-amber-400'
                      }`}
                      style={{
                        width: `${Math.max(8, (span.durationMs / (activeTrace.totalDurationMs || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
            Select or trigger a request to inspect its waterfall lifecycle.
          </div>
        )}
      </div>
    </div>
  );
};
