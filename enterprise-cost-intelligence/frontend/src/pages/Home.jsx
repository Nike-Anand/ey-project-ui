import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cpu, ShieldAlert, Activity, ArrowRight, Zap, Database } from 'lucide-react';
import ScrollVideoCanvas from '../components/ScrollVideoCanvas';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-background min-h-screen">
      {/* Cinematic Scroll Animation Section */}
      <section className="relative">
        <ScrollVideoCanvas />
      </section>

      {/* Hero Content Section - Appears after/over scroll */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen overflow-hidden px-4 py-24">
        {/* Background Orbs for the Hero section */}
        <motion.div 
           animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} 
           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"
        />
        
        <div className="z-10 flex flex-col items-center text-center max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-8 relative"
          >
             <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full"></div>
             <div className="relative p-6 rounded-3xl bg-surface border border-primary/40 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
               <Cpu className="w-16 h-16 text-primary animate-pulse-slow" />
             </div>
          </motion.div>

          <motion.h1 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-white mb-6"
          >
            NEXUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI</span>
          </motion.h1>

          <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: 0.4 }}
             className="text-xl md:text-2xl text-textMuted font-mono mb-12 max-w-2xl leading-relaxed"
          >
            Autonomous Enterprise Cost Intelligence. Detect anomalies, predict SLAs, and optimize cloud infrastructure in real-time.
          </motion.p>

          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: 0.6 }}
             className="flex flex-col sm:flex-row gap-6 mb-24"
          >
            <button 
               onClick={() => navigate('/dashboard')}
               className="px-8 py-4 rounded-xl bg-primary text-background font-bold font-mono uppercase tracking-widest flex items-center gap-3 hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105 transition-all duration-300"
            >
              Enter Mission Control <ArrowRight className="w-5 h-5" />
            </button>
            <button 
               className="px-8 py-4 rounded-xl glass-panel border border-white/10 text-white font-bold font-mono uppercase tracking-widest flex items-center gap-3 hover:bg-white/5 transition-all duration-300 group"
            >
              <Database className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" /> View Documentation
            </button>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1, delay: 0.8 }}
             className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
          >
             <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
               <Activity className="w-8 h-8 text-primary mb-4" />
               <h3 className="text-white font-mono font-bold mb-2 uppercase tracking-wide">Live Monitoring</h3>
               <p className="text-sm text-textMuted">Continuous data stream analysis via neural ensembles.</p>
             </div>
             <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
               <ShieldAlert className="w-8 h-8 text-danger mb-4" />
               <h3 className="text-white font-mono font-bold mb-2 uppercase tracking-wide">Threat Detection</h3>
               <p className="text-sm text-textMuted">Isolation Forests instantly identify cost abnormalities.</p>
             </div>
             <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
               <Zap className="w-8 h-8 text-secondary mb-4" />
               <h3 className="text-white font-mono font-bold mb-2 uppercase tracking-wide">Auto-Remediation</h3>
               <p className="text-sm text-textMuted">Remote execution payloads neutralize financial bleed immediately.</p>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Decoration */}
      <footer className="py-12 border-t border-white/5 flex justify-center opacity-30">
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-white">
          Quantum Financial Protocol v2.8.4 // DeepMind Enclave
        </p>
      </footer>
    </div>
  );
}
