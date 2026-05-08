import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingDown, Activity, DollarSign, Target, ArrowUpRight, AlertTriangle, Zap, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import AgentStatusPanel from './AgentStatusPanel';

const generateChartData = (isSimulating, savings) => {
  return Array.from({ length: 30 }).map((_, i) => {
    const baseline = 12000 + (i * 100) + Math.random() * 500;
    let cost = baseline + Math.random() * 5000;
    
    if (i === 15) cost += 15000; // spike
    
    if (isSimulating && i > 5) {
      const reduction = (savings / 20) * Math.min(i - 5, 20);
      cost = baseline - reduction;
    }
    
    return {
      name: `Day ${i+1}`,
      cost: cost,
      baseline: baseline
    };
  });
};

const AnimatedCounter = ({ value, prefix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value || 0;
    if (start === end) return;
    
    const duration = 1500;
    const increment = (end - start) / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        start = end;
        clearInterval(timer);
      }
      setDisplayValue(start);
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>;
};

export default function Dashboard({ impact, loading, slaWarnings = [], isLive }) {
  const [chartData, setChartData] = useState(() => generateChartData(false, 0));
  
  useEffect(() => {
    setChartData(generateChartData(isLive, impact?.total_potential_savings || 20000));
  }, [isLive, impact]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-wide">CFO Intelligence Hub</h2>
          <p className="text-xs font-mono text-textMuted uppercase tracking-widest mt-1">Multi-agent cost orchestration engine</p>
        </div>
        
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {isLive && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 bg-danger/10 border border-danger/30 px-4 py-1.5 rounded-full"
              >
                <div className="w-2 h-2 rounded-full bg-danger animate-ping" />
                <span className="text-[10px] font-mono text-danger uppercase tracking-[0.2em] font-bold">Live Simulation Active</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className={`flex items-center gap-2 ${isLive ? 'text-textMuted' : 'text-success'} bg-surface/40 border border-white/5 px-4 py-1.5 rounded-full transition-colors`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">{isLive ? 'Bypassing Core' : 'System Guard Online'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bento-card group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-danger/10 rounded-xl text-danger border border-danger/20 group-hover:bg-danger/20 transition-colors">
              <Target className="w-6 h-6" />
            </div>
             <span className="text-xs font-mono text-danger flex items-center gap-1 bg-danger/10 px-2 py-1 rounded-full">
               <ArrowUpRight className="w-3 h-3" /> {impact?.total_spend ? ((impact.total_potential_savings / impact.total_spend) * 100).toFixed(1) : "14.2"}%
            </span>
          </div>
          <h3 className="text-sm text-textMuted uppercase tracking-wider font-semibold mb-1">Exposure at Risk</h3>
          <div className="text-4xl font-display font-bold text-white tracking-tight">
            <AnimatedCounter prefix="₹" value={impact?.total_potential_savings || 0} />
          </div>
          <p className="text-sm mt-3 text-textMuted border-t border-border pt-3">
             <strong className="text-white">{impact?.total_anomalies_detected || 0}</strong> Anomalies found
          </p>
        </div>

        <div className="bento-card neon-border group z-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[80px] -z-10 group-hover:bg-primary/30 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm text-primary uppercase tracking-wider font-semibold mb-1">Capital Recovered</h3>
          <div className="text-5xl font-display font-bold text-white neon-text-cyan tracking-tight">
            <AnimatedCounter prefix="₹" value={impact?.total_actual_savings || 0} />
          </div>
          <p className="text-sm mt-3 text-primary/70 border-t border-primary/20 pt-3 flex items-center gap-2">
             <Activity className="w-4 h-4" /> Hard cash returned
          </p>
        </div>

        <div className="bento-card neon-border group z-10 border-success/30">
          <div className="absolute top-0 right-0 w-48 h-48 bg-success/10 rounded-full blur-[80px] -z-10 group-hover:bg-success/20 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-success/10 rounded-xl text-success border border-success/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm text-success uppercase tracking-wider font-semibold mb-1">Prevented Loss</h3>
          <div className="text-4xl font-display font-bold text-white tracking-tight">
            <AnimatedCounter prefix="₹" value={impact?.prevented_loss || 0} />
          </div>
          <p className="text-sm mt-3 text-success/70 border-t border-success/20 pt-3 flex items-center gap-2">
             <Activity className="w-4 h-4" /> Spike avoidance
          </p>
        </div>

        <div className="bento-card group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-sm text-textMuted uppercase tracking-wider font-semibold mb-1 relative z-10">Autonomous Actions</h3>
          <div className="text-4xl font-display font-bold text-white tracking-tight relative z-10">
            <AnimatedCounter value={impact?.resolved_anomalies || 0} />
            <span className="text-xl text-textMuted ml-1 font-mono">/ {impact?.total_anomalies_detected || 0}</span>
          </div>
          <p className="text-sm mt-3 text-secondary/80 border-t border-border pt-3 relative z-10">
             Interventions completed
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[400px]">
        <div className="bento-card h-[400px] lg:h-full relative lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <div>
               <h3 className="text-lg font-display font-semibold text-white">Enterprise Spend Velocity</h3>
               <p className="text-sm text-textMuted font-mono">30-day trailing metric comparison</p>
             </div>
             <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm text-textMuted"><div className="w-3 h-3 rounded-full bg-primary" /> Projected</div>
                <div className="flex items-center gap-2 text-sm text-textMuted"><div className={`w-3 h-3 rounded-full ${isLive ? 'bg-danger/80 animate-pulse' : 'bg-danger/50'}`} /> {isLive ? 'Simulation' : 'Anomalous'}</div>
             </div>
          </div>
          
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-t-2 border-primary border-r-2 border-r-transparent animate-spin" />
              <p className="text-primary font-mono text-sm animate-pulse">Synchronizing telemetry...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isLive ? "#ff3366" : "#ff3366"} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={isLive ? "#ff3366" : "#ff3366"} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.1)" tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  tickFormatter={(val) => `₹${val/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A24', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#00f0ff', fontWeight: 600 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Area type="monotone" dataKey="cost" stroke="#ff3366" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                <Area type="monotone" dataKey="baseline" stroke="#00f0ff" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorBase)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="h-[400px] lg:h-full lg:col-span-1">
          <AgentStatusPanel loading={loading} />
        </div>
      </div>
    </div>
  );
}
