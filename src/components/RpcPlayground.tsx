/**
 * OmniJS Interactive RPC API Tester & Procedure Playground
 * Enables direct testing of server queries and mutations with live payloads, latency, and status codes.
 */

import React, { useState } from 'react';
import { Play, Send, Zap, Clock, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, Shield } from 'lucide-react';
import { OmniFileAST } from '../framework/parser';
import { virtualRuntime } from '../framework/runtime';

interface RpcPlaygroundProps {
  ast: OmniFileAST;
}

export const RpcPlayground: React.FC<RpcPlaygroundProps> = ({ ast }) => {
  const procedures = ast.server?.procedures || [
    { name: 'getCatalog', kind: 'query', params: ['category', 'search'], body: '' },
    { name: 'createOrder', kind: 'mutation', params: ['productId', 'quantity'], body: '' },
  ];

  const [selectedProcName, setSelectedProcName] = useState<string>(procedures[0]?.name || 'getCatalog');
  const [requestArgs, setRequestArgs] = useState<string>('{\n  "category": "hardware",\n  "search": ""\n}');
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentProc = procedures.find((p) => p.name === selectedProcName) || procedures[0];

  const handleSelectProcedure = (name: string) => {
    setSelectedProcName(name);
    const proc = procedures.find((p) => p.name === name);
    if (proc?.kind === 'mutation') {
      if (name.includes('Order') || name.includes('purchase')) {
        setRequestArgs('{\n  "productId": "product_1",\n  "quantity": 1,\n  "customerEmail": "tester@omni.js"\n}');
      } else if (name.includes('Task')) {
        setRequestArgs('{\n  "title": "New feature from RPC Playground",\n  "priority": "urgent"\n}');
      } else {
        setRequestArgs('{\n  "id": "item_1"\n}');
      }
    } else {
      setRequestArgs('{\n  "category": "all",\n  "search": ""\n}');
    }
    setResponseOutput(null);
    setResponseStatus(null);
  };

  const handleSendRpc = async () => {
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const parsedArgs = requestArgs.trim() ? JSON.parse(requestArgs) : {};
      let res: any;

      if (currentProc?.kind === 'mutation') {
        res = await virtualRuntime.callMutation(selectedProcName, parsedArgs, {
          invalidate: ['products', 'tasks'],
        });
      } else {
        res = await virtualRuntime.callQuery(selectedProcName, parsedArgs);
      }

      setResponseLatency(Math.round(performance.now() - startTime));
      setResponseStatus(200);
      setResponseOutput(res);
    } catch (err: any) {
      setResponseLatency(Math.round(performance.now() - startTime));
      setResponseStatus(400);
      setResponseOutput({ error: err.message || 'Execution error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (!responseOutput) return;
    navigator.clipboard.writeText(JSON.stringify(responseOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#07090e] text-slate-100 font-sans">
      {/* Procedure Selector Sidebar */}
      <div className="w-full md:w-60 border-r border-slate-800/80 bg-slate-950/70 p-3 space-y-3 shrink-0 flex flex-col">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono px-1">
          Server Procedures ({procedures.length})
        </span>

        <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
          {procedures.map((p) => {
            const isSelected = p.name === selectedProcName;
            return (
              <button
                key={p.name}
                onClick={() => handleSelectProcedure(p.name)}
                className={`w-full p-2 rounded-lg text-left transition-colors flex items-center justify-between border ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-500/30 text-white font-semibold'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span className="truncate">{p.name}</span>
                <span
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded font-mono ${
                    p.kind === 'query' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {p.kind}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Request / Response Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Request Action Bar */}
        <div className="h-12 px-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs font-mono shrink-0 gap-3">
          <div className="flex items-center gap-2 truncate">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                currentProc?.kind === 'query' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {currentProc?.kind || 'query'}
            </span>
            <span className="text-white font-bold truncate">/api/rpc/{selectedProcName}</span>
          </div>

          <button
            onClick={handleSendRpc}
            disabled={isLoading}
            className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow shrink-0"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{isLoading ? 'Executing...' : 'Send Request'}</span>
          </button>
        </div>

        {/* Split Request & Response Areas */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Request Payload Editor */}
          <div className="w-full md:w-1/2 flex flex-col border-r border-slate-800/80 bg-slate-950/40">
            <div className="px-3 py-1.5 border-b border-slate-800/60 bg-slate-950/60 text-[11px] font-mono text-slate-400">
              Request Arguments (JSON)
            </div>
            <textarea
              value={requestArgs}
              onChange={(e) => setRequestArgs(e.target.value)}
              spellCheck={false}
              className="flex-1 p-3 bg-transparent text-slate-200 outline-none resize-none font-mono text-xs leading-relaxed selection:bg-sky-500/30"
            />
          </div>

          {/* Response Inspector */}
          <div className="w-full md:w-1/2 flex flex-col bg-[#07090e]">
            <div className="px-3 py-1.5 border-b border-slate-800/60 bg-slate-950/60 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">Response</span>
                {responseStatus !== null && (
                  <span
                    className={`font-bold ${
                      responseStatus === 200 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {responseStatus} {responseStatus === 200 ? 'OK' : 'ERROR'}
                  </span>
                )}
                {responseLatency !== null && (
                  <span className="text-slate-500 tabular-nums">
                    {responseLatency}ms
                  </span>
                )}
              </div>

              {responseOutput && (
                <button
                  onClick={handleCopyResponse}
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <pre className="flex-1 p-3 overflow-auto font-mono text-xs text-slate-300 leading-relaxed selection:bg-sky-500/30">
              {responseOutput !== null
                ? JSON.stringify(responseOutput, null, 2)
                : '// Press "Send Request" to invoke RPC procedure'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
