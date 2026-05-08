import { useEffect, useRef, useState } from 'react';
import { Play, Square, AlertTriangle, CheckCircle, Activity, UploadCloud, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DemoControls({ onDataUpdate, onTimelineEvent, isLive, setIsLive }) {
  const [loading, setLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTxn, setCustomTxn] = useState({
      date: new Date().toISOString().split('T')[0],
      vendor: '', category: 'Cloud Infrastructure', amount: '', description: '', account: 'Engineering'
  });
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isLive) {
      interval = setInterval(() => {
        handleStreamTransaction();
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  const handleStreamTransaction = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/stream-transaction', { method: 'POST' });
      const analysis = await res.json();
      onDataUpdate(analysis);
      
      if (analysis.anomalies && analysis.anomalies.length > 0) {
         onTimelineEvent("Live Stream: Sync complete.", "info");
      }
    } catch (e) {
      console.error(e);
      setIsLive(false);
      onTimelineEvent("Live Stream connection lost.", "error");
    }
  };

  const injectManualTransaction = async (type) => {
    setLoading(true);
    let txnPayload;
    if (type === 'anomaly') {
      txnPayload = {
        id: "",
        date: new Date().toISOString().split('T')[0],
        vendor: "AWS",
        category: "Cloud Infrastructure",
        amount: 85000.00,
        description: "Unprecedented spike in compute usage",
        account: "Engineering"
      };
      onTimelineEvent("Manual Inject: Simulating critical AWS anomaly...", "warning");
    } else {
      txnPayload = {
        id: "",
        date: new Date().toISOString().split('T')[0],
        vendor: "Google Cloud",
        category: "Cloud Infrastructure",
        amount: 450.00,
        description: "Standard monthly usage",
        account: "Marketing"
      };
      onTimelineEvent("Manual Inject: Adding standard transaction...", "info");
    }
    
    try {
      const res = await fetch('http://localhost:8000/api/inject-transaction', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txnPayload)
      });
      const analysis = await res.json();
      onDataUpdate(analysis);
      onTimelineEvent(type === 'anomaly' ? "Anomaly injected successfully. Agents alerted." : "Transaction added to stream.", type === 'anomaly' ? "error" : "success");
    } catch (e) {
       console.error(e);
       onTimelineEvent("Injection failed.", "error");
    }
    setLoading(false);
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    onTimelineEvent(`Uploading CSV: ${file.name}...`, "info");
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch('http://localhost:8000/api/upload-data', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      onTimelineEvent(data.message || "CSV Upload successful.", "success");
      
      const analysisRes = await fetch('http://localhost:8000/api/analyze', { method: 'POST' });
      const analysis = await analysisRes.json();
      onDataUpdate(analysis);
      onTimelineEvent("Analysis complete for uploaded batch.", "success");
    } catch (err) {
      console.error(err);
      onTimelineEvent("CSV Upload failed.", "error");
    }
    setLoading(false);
    e.target.value = null;
  };

  const submitCustomTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    onTimelineEvent(`Injecting custom transaction for ${customTxn.vendor}...`, "info");
    
    try {
      const res = await fetch('http://localhost:8000/api/inject-transaction', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customTxn, id: "", amount: parseFloat(customTxn.amount) || 0 })
      });
      const analysis = await res.json();
      onDataUpdate(analysis);
      onTimelineEvent("Custom transaction added successfully.", "success");
      setShowCustomForm(false);
    } catch (err) {
       console.error(err);
       onTimelineEvent("Custom injection failed.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-primary/20 flex flex-col gap-4 bg-surface/80 backdrop-blur-md relative overflow-hidden w-full max-w-[1400px] mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {isLive && (
        <motion.div 
           initial={{ opacity: 0 }} animate={{ opacity: 1 }}
           className="absolute inset-0 bg-danger/5 shadow-[inset_0_0_20px_rgba(255,51,102,0.1)] pointer-events-none"
        />
      )}
      
      <div className="flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <Activity className={`w-5 h-5 ${isLive ? 'text-danger animate-pulse' : 'text-textMuted'}`} />
          <span className="font-mono text-sm tracking-widest uppercase text-white font-semibold flex items-center gap-2">
            Simulation Control
            {isLive && <span className="flex w-2 h-2 bg-danger rounded-full animate-ping ml-2"/>}
          </span>
        </div>
        
        <div className="flex items-center gap-3 md:border-l border-white/10 md:pl-6 z-10">
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide transition-all ${isLive ? 'bg-danger/20 text-danger border border-danger/50 shadow-[0_0_10px_rgba(255,51,102,0.3)]' : 'bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30'}`}
          >
            {isLive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isLive ? 'Halt Simulation' : 'Engage Live Simulation'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:border-l border-white/10 md:pl-6 z-10">
          <span className="text-xs font-mono text-textMuted uppercase mr-2 flex items-center gap-2">
             Manual Inject
          </span>
          <button 
            onClick={() => injectManualTransaction('normal')}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface border border-white/10 text-white hover:border-success/50 hover:text-success transition-all text-xs font-mono"
          >
            <CheckCircle className="w-3 h-3 text-success" /> Preset Normal
          </button>
          <button 
            onClick={() => injectManualTransaction('anomaly')}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface border border-danger/30 text-danger hover:bg-danger/10 hover:shadow-[0_0_10px_rgba(255,51,102,0.3)] transition-all text-xs font-mono"
          >
            <AlertTriangle className="w-3 h-3" /> Preset Anomaly
          </button>
          <button 
            onClick={() => setShowCustomForm(!showCustomForm)}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all text-xs font-mono ${showCustomForm ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'bg-surface border-white/10 text-white hover:border-primary/50 hover:text-primary'}`}
          >
            {showCustomForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3 text-primary" />} Custom Entry
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface border border-secondary/30 text-secondary hover:bg-secondary/10 hover:shadow-[0_0_10px_rgba(0,255,204,0.3)] transition-all text-xs font-mono"
          >
            <UploadCloud className="w-3 h-3" /> Upload CSV
          </button>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleCSVUpload} 
          />
        </div>
      </div>

      {/* Expandable Custom Form */}
      <AnimatePresence>
        {showCustomForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 mt-2 z-10"
          >
            <form onSubmit={submitCustomTransaction} className="pt-4 grid grid-cols-1 md:grid-cols-6 gap-4 items-end" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col gap-1">
                 <label className="text-[10px] font-mono text-textMuted uppercase tracking-wider">Date</label>
                 <input type="date" required value={customTxn.date} onChange={e => setCustomTxn({...customTxn, date: e.target.value})} className="bg-background border border-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1">
                 <label className="text-[10px] font-mono text-textMuted uppercase tracking-wider">Vendor</label>
                 <input type="text" required placeholder="e.g. AWS" value={customTxn.vendor} onChange={e => setCustomTxn({...customTxn, vendor: e.target.value})} className="bg-background border border-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                 <label className="text-[10px] font-mono text-textMuted uppercase tracking-wider">Description</label>
                 <input type="text" placeholder="Transaction description..." value={customTxn.description} onChange={e => setCustomTxn({...customTxn, description: e.target.value})} className="bg-background border border-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1">
                 <label className="text-[10px] font-mono text-textMuted uppercase tracking-wider">Amount (₹)</label>
                 <input type="number" step="0.01" required placeholder="1500.00" value={customTxn.amount} onChange={e => setCustomTxn({...customTxn, amount: e.target.value})} className="bg-background border border-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
              </div>
              <div className="flex justify-end gap-2">
                 <button type="submit" disabled={loading} className="btn-primary py-2 px-4 w-full">Inject</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
