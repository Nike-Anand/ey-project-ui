import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, CheckCircle, AlertOctagon, Info, Crosshair } from 'lucide-react';

export default function Timeline({ events, isLive }) {
  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error': return <AlertOctagon className="w-4 h-4 text-danger" />;
      case 'warning': return <Zap className="w-4 h-4 text-warning" />;
      case 'info': default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getBorderColor = (type) => {
    switch(type) {
      case 'success': return 'border-success/30 shadow-[0_0_10px_rgba(0,255,157,0.3)] bg-success/10';
      case 'error': return 'border-danger/30 shadow-[0_0_10px_rgba(255,51,102,0.3)] bg-danger/10';
      case 'warning': return 'border-warning/30 shadow-[0_0_10px_rgba(255,179,0,0.3)] bg-warning/10';
      case 'info': default: return 'border-primary/30 shadow-[0_0_10px_rgba(0,240,255,0.3)] bg-primary/10';
    }
  };

  return (
    <div className="bento-card h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none" />
      
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6 relative z-10">
        <h3 className="text-lg font-display font-semibold flex items-center gap-3 text-white">
          <Crosshair className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
          Live Neural Uplink
        </h3>
        <div className="flex gap-1">
           <div className={`w-2 h-2 rounded-full bg-danger ${isLive ? 'animate-pulse' : 'opacity-30'}`} />
           <div className={`w-2 h-2 rounded-full bg-warning ${isLive ? 'animate-pulse delay-75' : 'opacity-30'}`} />
           <div className={`w-2 h-2 rounded-full bg-primary ${isLive ? 'animate-pulse delay-150' : 'opacity-30'}`} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 relative filter-container scroll-smooth">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-textMuted/40 font-mono text-sm space-y-4">
            <Activity className="w-8 h-8 opacity-50" />
            <p>Awaiting telemetry synchronization...</p>
          </div>
        ) : (
          <div className="absolute top-4 bottom-0 left-[19px] w-[2px] bg-gradient-to-b from-primary/30 via-secondary/20 to-transparent z-0" />
        )}
        
        <div className="space-y-6 relative z-10 pb-4">
          <AnimatePresence initial={false}>
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex gap-5 group/item"
              >
                <div className={`mt-1 w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 z-10 backdrop-blur-sm transition-transform group-hover/item:scale-110 ${getBorderColor(event.type)}`}>
                  {getIcon(event.type)}
                </div>
                <div className="bg-surfaceHover/40 p-4 rounded-xl border border-white/5 w-full hover:bg-surfaceHover transition-colors flex flex-col gap-1 shadow-md">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-textMuted font-mono uppercase tracking-[0.2em] bg-surface px-2 py-0.5 rounded-sm">{event.time}</span>
                  </div>
                  <p className="text-sm text-text leading-relaxed font-medium">{event.msg}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
