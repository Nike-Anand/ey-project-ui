import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, Fingerprint, Clock, CheckCircle, Shield } from 'lucide-react';
import { useState, useMemo } from 'react';
import ActionPanel from './ActionPanel';

export default function AnomalyExplorer({ anomalies, actions, onExecute }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const categories = useMemo(() => ['All', ...new Set(anomalies?.map(a => a.type) || [])], [anomalies]);
  
  const filteredAnomalies = useMemo(() => {
    return filter === 'All' ? (anomalies || []) : (anomalies || []).filter(a => a.type === filter);
  }, [filter, anomalies]);

  const totalPages = Math.ceil(filteredAnomalies.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedAnomalies = filteredAnomalies.slice(startIdx, startIdx + itemsPerPage);

  const handleFilterChange = (c) => {
    setFilter(c);
    setExpandedId(null);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Logic for ellipsis
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      
      pages.push(totalPages);
    }
    return pages;
  };

  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bento-card p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative">
          <div className="absolute inset-0 bg-success/20 blur-[50px] rounded-full" />
          <Shield className="w-16 h-16 text-success mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(0,255,157,0.5)]" />
        </div>
        <h3 className="text-xl font-display font-semibold text-white mb-2 tracking-wide">All Systems Nominal</h3>
        <p className="text-sm text-textMuted font-mono">Continuous monitoring active. No threats detected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => handleFilterChange(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest whitespace-nowrap transition-all
                ${filter === c 
                  ? 'bg-primary text-background font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]' 
                  : 'bg-surface/60 border border-white/5 text-textMuted hover:text-white hover:bg-surface/90'}`}
            >
              {c} {c !== 'All' && `(${anomalies.filter(a => a.type === c).length})`}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {paginatedAnomalies.map((anomaly, index) => {
          const isExpanded = expandedId === anomaly.id;
          const isHighRisk = anomaly.risk_level === 'high';
          const correspondingAction = actions?.find(a => a.anomaly_id === anomaly.id);

          return (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, height: 0, margin: 0, padding: 0 }}
              transition={{ delay: index * 0.05, layout: { duration: 0.3 } }}
              key={anomaly.id}
              className={`bg-surface/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl mb-4
                ${isHighRisk ? 'ring-1 ring-danger/30' : 'ring-1 ring-warning/30'} 
                transition-all duration-300 hover:bg-surface/80 group`}
            >
              {/* Header */}
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-4 relative overflow-hidden"
                onClick={() => setExpandedId(isExpanded ? null : anomaly.id)}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isHighRisk ? 'bg-danger shadow-[0_0_10px_rgba(255,51,102,0.8)]' : 'bg-warning shadow-[0_0_10px_rgba(255,179,0,0.8)]'}`} />
                
                <div className="flex items-center gap-5 pl-3">
                  <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0
                    ${isHighRisk ? 'bg-danger/10 border-danger/20 text-danger shadow-[0_0_15px_rgba(255,51,102,0.2)]' 
                                : 'bg-warning/10 border-warning/20 text-warning shadow-[0_0_15px_rgba(255,179,0,0.2)]'}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-lg text-white flex items-center gap-3 tracking-wide">
                      {anomaly.type} 
                      <span className={`text-[10px] font-mono px-2 py-1 rounded-sm border uppercase tracking-widest
                        ${isHighRisk ? 'bg-danger/10 text-danger border-danger/30' : 'bg-warning/10 text-warning border-warning/30'}`}>
                        {anomaly.risk_level}
                      </span>
                    </h4>
                    <p className="text-sm font-mono text-textMuted flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {anomaly.date}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-white/80 font-medium">{anomaly.vendor}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 pl-3 md:pl-0">
                  <div className="text-right">
                    <p className="text-[10px] text-textMuted uppercase font-mono tracking-widest mb-1">Exposure</p>
                    <p className="font-display font-bold text-xl text-white tracking-tight">
                      ₹{anomaly.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="bg-white/5 p-2 rounded-lg group-hover:bg-white/10 transition-colors">
                    <ChevronDown className="w-5 h-5 text-white/70" />
                  </motion.div>
                </div>
              </div>

              {/* Expansion Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 bg-gradient-to-b from-surfaceHover/30 to-surface/80"
                  >
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-4">
                        <h5 className="flex items-center gap-2 text-primary font-display font-semibold text-xs uppercase tracking-widest">
                          <Fingerprint className="w-4 h-4" /> AI Diagnostics
                        </h5>
                        <p className="text-sm text-text/90 leading-relaxed bg-surface/50 p-4 rounded-xl border border-white/5 font-medium shadow-inner">
                          {anomaly.explanation}
                        </p>
                        
                        {anomaly.factors_detected && anomaly.factors_detected.length > 0 && (
                          <div className="mt-4 p-4 border border-white/5 rounded-xl bg-surface/30">
                            <h6 className="text-xs uppercase tracking-widest text-textMuted font-mono mb-2">Why this decision?</h6>
                            <ul className="space-y-2 mb-4">
                              {anomaly.factors_detected.map((factor, idx) => (
                                <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                                  <span className="text-primary mt-1">▹</span> {factor}
                                </li>
                              ))}
                            </ul>
                            
                            <div className="mt-4">
                              <div className="flex justify-between text-xs font-mono mb-1">
                                <span className="text-textMuted uppercase">Confidence Level</span>
                                <span className="text-success tracking-tight">{(anomaly.confidence * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${anomaly.confidence * 100}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="h-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="lg:border-l border-white/5 lg:pl-8">
                        {correspondingAction ? (
                           <ActionPanel 
                             action={correspondingAction} 
                             anomalyId={anomaly.id} 
                             onExecute={onExecute} 
                           />
                        ) : (
                          <div className="h-full flex flex-col justify-center items-center text-textMuted font-mono text-sm border border-dashed border-white/10 rounded-xl bg-surface/30 p-6 text-center">
                            No autonomous remediation protocols mapped for this threat vector.
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 p-4 glass-panel border border-white/10 rounded-xl relative z-10">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-6 py-2 border border-white/10 rounded-lg text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-10 disabled:cursor-not-allowed"
          >
            ← Previous Uplink
          </button>
          
          <div className="flex gap-2 items-center">
            {getPageNumbers().map((p, i) => (
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-white/30 font-mono tracking-widest">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono transition-all
                    ${currentPage === p 
                      ? 'bg-primary text-background font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] border-transparent' 
                      : 'bg-white/5 border border-white/10 text-textMuted hover:text-white hover:bg-white/10'}`}
                >
                  {String(p).padStart(2, '0')}
                </button>
              )
            ))}
          </div>
          
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-6 py-2 border border-white/10 rounded-lg text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all disabled:opacity-10 disabled:cursor-not-allowed"
          >
            Next Uplink →
          </button>
        </div>
      )}
    </div>
  );
}
