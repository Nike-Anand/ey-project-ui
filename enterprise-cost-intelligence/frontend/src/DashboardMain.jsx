import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Database, Cpu, Activity, Zap } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AnomalyExplorer from './components/AnomalyExplorer';
import Timeline from './components/Timeline';
import AuditTrail from './components/AuditTrail';
import DemoControls from './components/DemoControls';
import AIAssistant from './components/AIAssistant';
import CursorTrail from './components/CursorTrail';

function DashboardMain() {
  const [data, setData] = useState({ anomalies: [], actions: [], impact: null, sla_warnings: [] });
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [currentTab, setCurrentTab] = useState('dashboard');

  const addTimelineEvent = (msg, type = "info") => {
    setTimelineEvents(prev => [{ id: Date.now().toString(), msg, type, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  const handleGenerateData = async () => {
    setLoading(true);
    addTimelineEvent("Initializing neural pipeline and connecting to data lakes...", "info");
    try {
      await fetch('http://localhost:8000/api/generate-sample-data', { method: 'POST' });
      addTimelineEvent("Successfully synchronized 500+ invoice records.", "success");
      await handleAnalyze();
    } catch (e) {
      addTimelineEvent("Connection to Core Data Engine failed. Retrying...", "error");
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    addTimelineEvent("Detection Agent running Isolation Forest algorithms...", "warning");
    try {
      const res = await fetch('http://localhost:8000/api/analyze', { method: 'POST' });
      const analysis = await res.json();
      setData(analysis);
      setLoading(false);
      addTimelineEvent(`Analysis complete. Intercepted ${analysis.impact.total_anomalies_detected} critical threats totaling ₹${analysis.impact.total_potential_savings.toLocaleString()}.`, "error");
    } catch (e) {
      addTimelineEvent("Analysis module offline.", "error");
      setLoading(false);
    }
  };

  const executeAction = async (actionId, anomalyId) => {
    addTimelineEvent(`Initiating remote execution payload for incident [${actionId.substring(0,8)}]...`, "warning");
    try {
      const res = await fetch(`http://localhost:8000/api/action/execute/${actionId}`, { method: 'POST' });
      const result = await res.json();
      
      if (result.anomalies) {
        addTimelineEvent(`Payload delivered! Secured ₹${(data.impact?.total_potential_savings - result.impact?.total_potential_savings).toLocaleString()} across enterprise perimeter.`, "success");
        setData(result);
      }
    } catch (e) {
      addTimelineEvent("Action execution encountered resistance.", "error");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center relative z-10 overflow-x-hidden">
      <CursorTrail />
      
      {/* Background Orbs and Data Flow Animation */}
      <motion.div 
         animate={{ scale: loading ? [1, 1.2, 1] : 1, opacity: loading ? [0.5, 0.8, 0.5] : 0.3 }} 
         transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
         className="fixed top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"
      />
      <motion.div 
         animate={{ scale: loading ? [1, 1.4, 1] : 1, opacity: loading ? [0.4, 0.7, 0.4] : 0.2 }} 
         transition={{ duration: 5, repeat: Infinity, delay: 1, ease: "easeInOut" }}
         className="fixed bottom-20 right-10 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[150px] -z-10 mix-blend-screen pointer-events-none"
      />

      <AnimatePresence>
        {(loading || isLive) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          >
             {Array.from({ length: 15 }).map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ y: -200, opacity: 0 }}
                  animate={{ y: "100vh", opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.5 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2, ease: "linear" }}
                  className="absolute w-[2px] bg-gradient-to-b from-transparent via-primary/80 to-transparent shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                  style={{ left: `${5 + Math.random() * 90}%`, height: "20vh" }}
                />
             ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -30 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[1400px] flex flex-col md:flex-row items-center justify-between mb-10 gap-6 glass-panel py-4 px-8"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`absolute inset-0 ${isLive ? 'bg-danger/30' : 'bg-primary/30'} blur-md rounded-full`}></div>
            <div className={`relative p-3 rounded-xl bg-surface border ${isLive ? 'border-danger/50 text-danger' : 'border-primary/50 text-primary'}`}>
              <Cpu className={`w-8 h-8 ${isLive ? 'animate-spin-slow' : 'animate-pulse-slow'}`} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-1">
              NEXUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI</span>
            </h1>
            <p className="text-sm text-textMuted font-mono uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity className={`w-3 h-3 ${isLive ? 'text-danger animate-pulse' : 'text-secondary'}`} /> 
              {isLive ? 'Simulated Telemetry Uplink Active' : 'Enterprise Cost Intelligence Target'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
            {(loading || isLive) && (
               <div className={`flex items-center gap-3 font-mono text-sm border px-4 py-2 rounded-lg ${isLive ? 'text-danger border-danger/20 bg-danger/5' : 'text-primary border-primary/20 bg-primary/5'}`}>
                 <Zap className={`w-4 h-4 ${isLive ? 'animate-bounce' : 'animate-pulse'}`} /> 
                 {isLive ? 'Live Simulation' : 'Processing...'}
               </div>
            )}
          <button 
            onClick={handleGenerateData}
            disabled={loading}
            className="btn-primary group"
          >
            <Database className="w-5 h-5 group-hover:animate-bounce" /> 
            {loading ? 'Uplink Active...' : 'Initialize Analysis Pipeline'}
          </button>
        </div>
      </motion.header>

      <DemoControls onDataUpdate={setData} onTimelineEvent={addTimelineEvent} isLive={isLive} setIsLive={setIsLive} />

      {/* Tabs */}
      <div className="w-full max-w-[1400px] flex gap-4 mb-6 px-4 z-10">
        <button 
          onClick={() => setCurrentTab('dashboard')} 
          className={`px-6 py-2 rounded-full font-mono text-sm tracking-widest uppercase transition-all ${currentTab === 'dashboard' ? 'bg-primary text-background font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'border border-white/10 text-textMuted hover:text-white'}`}
        >
          Mission Control
        </button>
        <button 
          onClick={() => setCurrentTab('audit')} 
          className={`px-6 py-2 rounded-full font-mono text-sm tracking-widest uppercase transition-all ${currentTab === 'audit' ? 'bg-primary text-background font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'border border-white/10 text-textMuted hover:text-white'}`}
        >
          Audit Log
        </button>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentTab === 'dashboard' ? (
          <motion.main 
            key="dash"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[1400px] grid grid-cols-1 xl:grid-cols-12 gap-8"
          >
            {/* Left Column (8 cols) - Dashboard & Anomalies */}
            <div className="col-span-1 xl:col-span-8 flex flex-col gap-8">
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <Dashboard impact={data.impact} loading={loading} slaWarnings={data.sla_warnings || []} isLive={isLive} />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-semibold flex items-center gap-3 text-white">
                    <ShieldAlert className="w-6 h-6 text-danger drop-shadow-[0_0_10px_rgba(255,51,102,0.8)]" />
                    Detected Anomalies
                  </h2>
                  <span className="bg-surface border border-border px-3 py-1 rounded-full text-xs font-mono text-textMuted">
                     {data.anomalies?.length || 0} active threats
                  </span>
                </div>
                <AnomalyExplorer 
                   anomalies={data.anomalies} 
                   actions={data.actions} 
                   onExecute={executeAction} 
                />
              </motion.div>
            </div>

            {/* Right Column (4 cols) - Live Timeline */}
            <div className="col-span-1 xl:col-span-4 h-full">
              <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.3 }}
                className="h-full"
              >
                <Timeline events={timelineEvents} isLive={isLive} />
              </motion.div>
            </div>
          </motion.main>
        ) : (
          <motion.main 
            key="audit"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[1400px]"
          >
            <AuditTrail />
          </motion.main>
        )}
      </AnimatePresence>

      <AIAssistant />
    </div>
  );
}

export default DashboardMain;
