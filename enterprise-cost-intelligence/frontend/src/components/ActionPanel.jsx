import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { useState } from 'react';

export default function ActionPanel({ action, anomalyId, onExecute }) {
  const [status, setStatus] = useState('idle');

  const handleExecute = async () => {
    setStatus('loading');
    await onExecute(action.id, anomalyId);
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="h-full flex flex-col justify-center items-center text-success space-y-3 bg-success/5 rounded-xl border border-success/20 p-4">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }} 
          animate={{ scale: 1, rotate: 0 }} 
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <CheckCircle2 className="w-10 h-10 mx-auto drop-shadow-[0_0_15px_rgba(0,255,157,0.8)]" />
        </motion.div>
        <p className="text-sm font-display font-medium tracking-wide uppercase">Threat Neutralized</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between gap-4 p-2">
      <div>
        <h5 className="flex items-center gap-2 text-warning font-display font-semibold text-xs mb-3 uppercase tracking-widest border-b border-white/5 pb-2">
          <Cpu className="w-4 h-4" /> AI Remediation Protocol
        </h5>
        <div className="bg-surface/50 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="font-display font-semibold text-white tracking-wide">{action.action_type}</p>
          <p className="text-sm text-textMuted mt-2 leading-relaxed">{action.description}</p>
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleExecute}
        disabled={status === 'loading'}
        className={`w-full py-3 rounded-xl font-display font-semibold tracking-wide flex justify-center items-center gap-2 transition-all shadow-lg text-sm uppercase
          ${status === 'loading' 
            ? 'glass-panel border-primary/50 text-primary' 
            : 'bg-primary text-background hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] relative overflow-hidden'
          }`}
      >
        {status === 'loading' ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Executing Protocol...
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-white/20 w-0 hover:w-full transition-all duration-300 pointer-events-none" />
            <Play className="w-4 h-4" fill="currentColor" />
            Engage Fix
          </>
        )}
      </motion.button>
    </div>
  );
}
