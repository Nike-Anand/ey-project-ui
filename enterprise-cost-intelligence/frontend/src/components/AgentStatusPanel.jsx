import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, ShieldAlert, Cpu, Crosshair, TrendingUp, CheckCircle2, Circle, Loader2 } from 'lucide-react';

export default function AgentStatusPanel({ loading }) {
  const [agents, setAgents] = useState([
    { id: 'data', name: 'Data Ingestion', icon: Server, status: 'idle' },
    { id: 'detection', name: 'Detection Engine', icon: ShieldAlert, status: 'idle' },
    { id: 'reasoning', name: 'Reasoning AI', icon: Cpu, status: 'idle' },
    { id: 'action', name: 'Action Coordinator', icon: Crosshair, status: 'idle' },
    { id: 'impact', name: 'Impact Calculator', icon: TrendingUp, status: 'idle' }
  ]);

  useEffect(() => {
    if (loading) {
      // Simulate sequential activation
      setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));
      
      const timing = [0, 800, 1600, 2600, 3200];
      const timeouts = timing.map((delay, index) => {
        return setTimeout(() => {
          setAgents(prev => prev.map((a, i) => {
            if (i === index) return { ...a, status: 'running' };
            if (i < index) return { ...a, status: 'completed' };
            return a;
          }));
        }, delay);
      });
      
      return () => timeouts.forEach(clearTimeout);
    } else {
      setAgents(prev => prev.map(a => ({ 
        ...a, 
        status: prev[0].status === 'idle' ? 'idle' : 'completed' 
      })));
    }
  }, [loading]);

  return (
    <div className="bento-card h-full flex flex-col group hover:border-primary/20 transition-colors">
      <h3 className="text-sm font-display font-semibold text-white tracking-widest uppercase mb-4 flex items-center justify-between">
        AI Protocol Swarm
        <span className="flex h-2 w-2 relative">
          {loading && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${loading ? 'bg-primary' : 'bg-success'}`}></span>
        </span>
      </h3>
      
      <div className="flex-1 flex flex-col justify-between gap-3">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          const isRunning = agent.status === 'running';
          const isCompleted = agent.status === 'completed';
          
          return (
            <div key={agent.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300
              ${isRunning ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 
                isCompleted ? 'bg-surface/60 border-success/20' : 'bg-surface/30 border-white/5 opacity-50'}`}>
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isRunning ? 'text-primary bg-primary/20' : isCompleted ? 'text-success bg-success/10' : 'text-textMuted bg-surface'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-display font-medium tracking-wide ${isRunning ? 'text-white' : isCompleted ? 'text-white/80' : 'text-textMuted'}`}>
                  {agent.name}
                </span>
              </div>
              
              <div className="flex items-center">
                {isRunning && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-success drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]" />}
                {!isRunning && !isCompleted && <Circle className="w-4 h-4 text-white/20" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
