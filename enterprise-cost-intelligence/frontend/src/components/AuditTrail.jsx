import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, CheckCircle, Clock } from 'lucide-react';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('http://localhost:8000/api/audit-log');
        const data = await res.json();
        setLogs(data);
      } catch (e) {
        console.error("Failed to fetch audit logs", e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLogs();
    
    // Auto refresh every 5s for demo feeling alive
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
         <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bento-card text-center p-12 h-[600px] flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surfaceHover/40 via-surface/10 to-transparent"></div>
        <FileText className="w-16 h-16 text-white/20 mb-4 drop-shadow-md z-10" />
        <h3 className="text-xl font-display font-semibold text-white tracking-widest uppercase z-10">Decision Log Immutable</h3>
        <p className="text-sm font-mono text-textMuted mt-2 z-10">Awaiting intelligent execution traces from core logic block.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-wide flex items-center gap-3">
             <FileText className="w-6 h-6 text-primary" /> Immutable Audit Trail
          </h2>
          <p className="text-sm font-mono text-textMuted mt-1">Enterprise logging & accountability matrix</p>
        </div>
        <div className="bg-surface/50 border border-white/5 py-1.5 px-3 rounded-lg flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
           <span className="text-xs font-mono uppercase tracking-widest text-textMuted">Live Sync</span>
        </div>
      </div>

      <div className="space-y-4 relative">
        <div className="absolute left-6 top-8 bottom-8 w-px bg-white/5" />
        
        <AnimatePresence>
          {logs.map((log, i) => (
            <motion.div 
              key={log.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative pl-16 group"
            >
              <div className="absolute left-[21px] top-6 w-3 h-3 rounded-full bg-surface border-2 border-primary z-10 shadow-[0_0_10px_rgba(0,240,255,0.4)] group-hover:scale-125 transition-transform" />
              
              <div 
                className="bento-card hover:bg-surfaceHover/80 transition-colors cursor-pointer"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start md:items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-white tracking-wide">{log.action_taken}</h4>
                      <p className="text-xs font-mono text-textMuted flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" /> 
                        {new Date(log.timestamp).toLocaleString()} 
                        <span className="text-white/20">•</span> 
                        <span className="text-white/80">{log.vendor}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                       <p className="text-[10px] uppercase font-mono tracking-widest text-textMuted mb-1">Impact Registered</p>
                       <p className="font-display font-bold text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.4)] tracking-tight">
                         +₹{log.impact.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                       </p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${expandedId === log.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === log.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/5 mt-5 pt-5 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-textMuted mb-2">Original Context</p>
                          <div className="bg-surface/50 p-4 rounded-xl border border-white/5 h-full">
                            <h5 className="font-display text-warning font-semibold tracking-wide text-sm">{log.anomaly_type}</h5>
                            {log.factors && log.factors.length > 0 ? (
                               <ul className="mt-3 space-y-1">
                                 {log.factors.map((f, i) => (
                                   <li key={i} className="text-sm text-textMuted flex items-start gap-2">
                                     <span className="text-warning mt-1">▹</span> {f}
                                   </li>
                                 ))}
                               </ul>
                            ) : (
                               <p className="text-sm text-textMuted mt-2 italic">Standard AI derivation</p>
                            )}
                          </div>
                        </div>
                        <div>
                           <p className="text-xs font-mono uppercase tracking-widest text-textMuted mb-2">Transaction Fingerprint</p>
                           <div className="bg-surface/50 p-4 rounded-xl border border-white/5 font-mono text-xs text-white/70 h-full flex items-center justify-center break-all">
                             {log.id}-{btoa(log.timestamp).substring(0,20)}
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
