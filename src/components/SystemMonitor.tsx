import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Activity, HardDrive, Wifi, X } from 'lucide-react';

interface SystemStats {
  cpu: number;
  memory: number;
  storage: number;
  networkUp: number;
  networkDown: number;
  temperature: number;
}

interface SystemMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    memory: 0,
    storage: 45, // Simulated initial storage
    networkUp: 0,
    networkDown: 0,
    temperature: 40,
  });

  // Simulate data updates
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
        memory: Math.floor(Math.random() * 10) + 30, // 30-40%
        networkUp: Math.floor(Math.random() * 500) + 100, // KB/s
        networkDown: Math.floor(Math.random() * 2000) + 500, // KB/s
        temperature: Math.floor(Math.random() * 5) + 38, // 38-43C
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-32 right-8 z-40 w-80 bg-[#020617]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10"
        >
          {/* Header */}
          <div className="h-12 bg-white/5 border-b border-white/5 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-white/90 font-medium">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>系统状态</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-6">
            
            {/* CPU Section */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" /> CPU 使用率
                </span>
                <span className="text-white">{stats.cpu}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  animate={{ width: `${stats.cpu}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-xs text-slate-500 text-right">Temp: {stats.temperature}°C</div>
            </div>

            {/* Memory Section */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> 内存
                </span>
                <span className="text-white">{stats.memory}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-400"
                  animate={{ width: `${stats.memory}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-xs text-slate-500 text-right">3.8 GB / 8 GB</div>
            </div>

            {/* Storage Section */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3 h-3" /> 存储空间
                </span>
                <span className="text-white">{stats.storage}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400"
                  initial={{ width: `${stats.storage}%` }}
                  animate={{ width: `${stats.storage}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 text-right">1.8 TB / 4 TB</div>
            </div>

            {/* Network Section */}
            <div className="bg-white/5 rounded-xl p-3 space-y-3">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wifi className="w-3 h-3" /> 网络流量
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-slate-500 mb-1">上传</div>
                  <div className="text-sm font-mono text-emerald-400 font-medium flex items-center gap-1">
                    ↑ {stats.networkUp} <span className="text-[10px] text-slate-600">KB/s</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-1">下载</div>
                  <div className="text-sm font-mono text-blue-400 font-medium flex items-center gap-1">
                    ↓ {(stats.networkDown / 1024).toFixed(1)} <span className="text-[10px] text-slate-600">MB/s</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SystemMonitor;
