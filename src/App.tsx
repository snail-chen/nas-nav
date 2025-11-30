import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { X, Settings, Plus, Monitor, Search, Wifi } from 'lucide-react';
import { useConfig } from './hooks/useConfig';
import ParticleBackground from './components/ParticleBackground';

// --- Dock Icon Component ---
function DockIcon({ 
  children, 
  mouseX, 
  onClick, 
  label 
}: { 
  children: React.ReactNode; 
  mouseX: any; 
  onClick?: () => void;
  label?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [50, 100, 50]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      onClick={onClick}
      className="aspect-square rounded-2xl bg-[#1e293b]/60 backdrop-blur-md border border-white/10 flex items-center justify-center relative group cursor-pointer hover:bg-[#334155]/60 transition-colors shadow-lg shadow-black/20"
    >
      <div className="w-full h-full flex items-center justify-center p-2">
        {children}
      </div>
      {label && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-[#020617]/90 backdrop-blur-md text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-xl">
          {label}
        </div>
      )}
    </motion.div>
  );
}

// --- Main App ---
const App: React.FC = () => {
  const { config, updateBaseUrl, addLink, removeLink } = useConfig();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Local state
  const [tempBaseUrl, setTempBaseUrl] = useState(config.baseUrl);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkPort, setNewLinkPort] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dock mouse tracking
  const mouseX = useMotionValue(Infinity);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveSettings = () => {
    updateBaseUrl(tempBaseUrl);
    setIsSettingsOpen(false);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLinkName && newLinkPort) {
      addLink(newLinkName, newLinkPort);
      setNewLinkName('');
      setNewLinkPort('');
      setIsAddModalOpen(false);
    }
  };

  const getFullUrl = (port: string) => {
    let prefix = 'http://';
    if (config.baseUrl.startsWith('http://') || config.baseUrl.startsWith('https://')) {
      prefix = '';
    }
    return `${prefix}${config.baseUrl}:${port}`;
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative text-slate-100 font-sans selection:bg-cyan-500/30">
      <ParticleBackground />

      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 w-full h-8 px-4 flex justify-between items-center z-20 bg-[#020617]/60 backdrop-blur-md border-b border-white/5 text-xs font-medium text-cyan-100/80">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm text-white"> NAS OS</span>
          <span className="hidden sm:inline hover:text-white transition-colors cursor-default">File</span>
          <span className="hidden sm:inline hover:text-white transition-colors cursor-default">Edit</span>
          <span className="hidden sm:inline hover:text-white transition-colors cursor-default">View</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3" />
            <Search className="w-3 h-3" />
          </div>
          <span>
            {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            {' '}
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Main Desktop Area (Launchpad Grid) */}
      <div className="absolute inset-0 pt-20 pb-32 px-8 z-10 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10 place-items-center">
          {config.links.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="group flex flex-col items-center gap-3 w-32"
            >
              <a
                href={getFullUrl(link.port)}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-24 h-24 rounded-[24px] bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden group-hover:shadow-cyan-500/20 group-hover:border-cyan-400/30 transition-all duration-300 group-hover:-translate-y-1"
              >
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Icon */}
                <div className="relative z-10 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-200 to-blue-400 drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {link.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Hover remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeLink(link.id);
                  }}
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </a>
              <span className="text-sm font-medium text-slate-200 drop-shadow-md text-center truncate w-full px-2 group-hover:text-white transition-colors">
                {link.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Dock */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <motion.div
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="h-20 px-4 flex items-center gap-4 rounded-3xl bg-[#0f172a]/70 backdrop-blur-xl border border-cyan-500/20 shadow-2xl ring-1 ring-white/5"
        >
          <DockIcon mouseX={mouseX} onClick={() => setIsAddModalOpen(true)} label="Add App">
            <Plus className="w-full h-full text-cyan-400" />
          </DockIcon>
          
          <div className="w-[1px] h-10 bg-white/10 my-auto mx-2" />

          <DockIcon mouseX={mouseX} onClick={() => {
            setTempBaseUrl(config.baseUrl);
            setIsSettingsOpen(true);
          }} label="Settings">
            <Settings className="w-full h-full text-slate-400 group-hover:text-cyan-200 transition-colors" />
          </DockIcon>
          
          <DockIcon mouseX={mouseX} label="System">
            <Monitor className="w-full h-full text-blue-400 group-hover:text-blue-300 transition-colors" />
          </DockIcon>
        </motion.div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <div className="w-full max-w-md bg-[#020617]/85 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
              {/* Window Title Bar */}
              <div className="h-11 bg-[#1e293b]/50 border-b border-white/5 flex items-center px-4 relative justify-center">
                <div className="absolute left-4 flex gap-2">
                  <button onClick={() => setIsSettingsOpen(false)} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 border border-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840] border border-black/10" />
                </div>
                <span className="text-sm font-medium text-slate-400">System Preferences</span>
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/5 shadow-inner">
                    <Settings className="w-10 h-10 text-slate-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">NAS Configuration</h2>
                  <p className="text-sm text-slate-500 mt-1">Set your base connection URL</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">IP Address / Domain</label>
                  <input
                    type="text"
                    value={tempBaseUrl}
                    onChange={(e) => setTempBaseUrl(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    placeholder="192.168.1.100"
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <div className="w-full max-w-md bg-[#020617]/85 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
              <div className="h-11 bg-[#1e293b]/50 border-b border-white/5 flex items-center px-4 relative justify-center">
                <div className="absolute left-4 flex gap-2">
                  <button onClick={() => setIsAddModalOpen(false)} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 border border-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840] border border-black/10" />
                </div>
                <span className="text-sm font-medium text-slate-400">App Store</span>
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-[24px] mx-auto mb-4 flex items-center justify-center border border-blue-500/20 shadow-inner">
                    <Plus className="w-10 h-10 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Add New Service</h2>
                </div>

                <form onSubmit={handleAddLink} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">App Name</label>
                    <input
                      type="text"
                      value={newLinkName}
                      onChange={(e) => setNewLinkName(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                      placeholder="Plex"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Port</label>
                    <input
                      type="text"
                      value={newLinkPort}
                      onChange={(e) => setNewLinkPort(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                      placeholder="32400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                  >
                    Install App
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
