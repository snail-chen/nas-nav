import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { X, Settings, Plus, Monitor, Search, Wifi, Edit2, Trash2 } from 'lucide-react';
import { useConfig } from './hooks/useConfig';
import ParticleBackground from './components/ParticleBackground';
import { NavLink } from './types';

// --- Context Menu Component ---
interface ContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onEdit, onDelete, onClose }) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className="fixed z-50 w-48 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden py-1"
    >
      <button
        onClick={onEdit}
        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-blue-500/50 flex items-center gap-2 transition-colors"
      >
        <Edit2 className="w-4 h-4" />
        Edit
      </button>
      <div className="h-[1px] bg-white/10 my-1" />
      <button
        onClick={onDelete}
        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 flex items-center gap-2 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
};

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
      className="aspect-square rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center relative group cursor-pointer hover:bg-white/20 transition-colors shadow-lg"
    >
      <div className="w-full h-full flex items-center justify-center p-2">
        {children}
      </div>
      {label && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-xl">
          {label}
        </div>
      )}
    </motion.div>
  );
}

// --- Main App ---
const App: React.FC = () => {
  const { config, updateBaseUrl, addLink, removeLink, updateLink, updateLinkIcon } = useConfig();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; linkId: string } | null>(null);

  // Local state
  const [tempBaseUrl, setTempBaseUrl] = useState(config.baseUrl);
  const [editingLink, setEditingLink] = useState<NavLink | null>(null);
  const [linkName, setLinkName] = useState('');
  const [linkPort, setLinkPort] = useState('');
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

  const openAddModal = () => {
    setEditingLink(null);
    setLinkName('');
    setLinkPort('');
    setIsLinkModalOpen(true);
  };

  const openEditModal = (link: NavLink) => {
    setEditingLink(link);
    setLinkName(link.name);
    setLinkPort(link.port);
    setIsLinkModalOpen(true);
    setContextMenu(null);
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkName && linkPort) {
      if (editingLink) {
        updateLink(editingLink.id, linkName, linkPort);
      } else {
        addLink(linkName, linkPort);
      }
      setLinkName('');
      setLinkPort('');
      setIsLinkModalOpen(false);
      setEditingLink(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, linkId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, linkId });
  };

  const handleDeleteLink = () => {
    if (contextMenu) {
      removeLink(contextMenu.linkId);
      setContextMenu(null);
    }
  };

  const getFullUrl = (port: string) => {
    let prefix = 'http://';
    if (config.baseUrl.startsWith('http://') || config.baseUrl.startsWith('https://')) {
      prefix = '';
    }
    return `${prefix}${config.baseUrl}:${port}`;
  };

  const handleLinkClick = (link: NavLink) => {
    if (!link.iconUrl) {
      const url = getFullUrl(link.port);
      const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      const faviconUrl = `${cleanUrl}/favicon.ico`;
      
      const img = new Image();
      img.src = faviconUrl;
      img.onload = () => {
        updateLinkIcon(link.id, faviconUrl);
      };
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative text-slate-100 font-sans selection:bg-cyan-500/30" onClick={() => setContextMenu(null)}>
      <ParticleBackground />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={() => {
            const link = config.links.find(l => l.id === contextMenu.linkId);
            if (link) openEditModal(link);
          }}
          onDelete={handleDeleteLink}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 w-full h-8 px-4 flex justify-between items-center z-20 bg-black/20 backdrop-blur-md border-b border-white/10 text-xs font-medium text-white/90">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm text-white drop-shadow-md"> NAS OS</span>
          <span className="hidden sm:inline hover:text-white transition-colors cursor-default drop-shadow-sm">File</span>
          <span className="hidden sm:inline hover:text-white transition-colors cursor-default drop-shadow-sm">Edit</span>
          <span className="hidden sm:inline hover:text-white transition-colors cursor-default drop-shadow-sm">View</span>
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
                onClick={() => handleLinkClick(link)}
                onContextMenu={(e) => handleContextMenu(e, link.id)}
                className="relative w-24 h-24 rounded-[24px] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex items-center justify-center overflow-hidden group-hover:bg-white/20 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl"
              >
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Icon */}
                {link.iconUrl ? (
                  <img 
                    src={link.iconUrl}
                    alt={link.name}
                    className="relative z-10 w-16 h-16 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                    onError={() => updateLinkIcon(link.id, undefined)}
                  />
                ) : (
                  <div className="relative z-10 text-3xl font-bold text-white drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                    {link.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Hover remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeLink(link.id);
                  }}
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </a>
              <span className="text-sm font-medium text-white drop-shadow-lg text-center truncate w-full px-2">
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
          className="h-20 px-4 flex items-center gap-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl ring-1 ring-white/10"
        >
          <DockIcon mouseX={mouseX} onClick={openAddModal} label="Add App">
            <Plus className="w-full h-full text-white" />
          </DockIcon>
          
          <div className="w-[1px] h-10 bg-white/20 my-auto mx-2" />

          <DockIcon mouseX={mouseX} onClick={() => {
            setTempBaseUrl(config.baseUrl);
            setIsSettingsOpen(true);
          }} label="Settings">
            <Settings className="w-full h-full text-white" />
          </DockIcon>
          
          <DockIcon mouseX={mouseX} label="System">
            <Monitor className="w-full h-full text-white" />
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

      {/* Link Modal (Add/Edit) */}
      <AnimatePresence>
        {isLinkModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <div className="w-full max-w-md bg-[#020617]/85 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
              <div className="h-11 bg-[#1e293b]/50 border-b border-white/5 flex items-center px-4 relative justify-center">
                <div className="absolute left-4 flex gap-2">
                  <button onClick={() => setIsLinkModalOpen(false)} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 border border-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840] border border-black/10" />
                </div>
                <span className="text-sm font-medium text-slate-400">App Store</span>
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-[24px] mx-auto mb-4 flex items-center justify-center border border-blue-500/20 shadow-inner">
                    {editingLink ? (
                      <Edit2 className="w-10 h-10 text-blue-400" />
                    ) : (
                      <Plus className="w-10 h-10 text-blue-400" />
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {editingLink ? 'Edit Service' : 'Add New Service'}
                  </h2>
                </div>

                <form onSubmit={handleSaveLink} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">App Name</label>
                    <input
                      type="text"
                      value={linkName}
                      onChange={(e) => setLinkName(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                      placeholder="Plex"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Port</label>
                    <input
                      type="text"
                      value={linkPort}
                      onChange={(e) => setLinkPort(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                      placeholder="32400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                  >
                    {editingLink ? 'Save Changes' : 'Install App'}
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
