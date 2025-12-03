import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Power, RefreshCw, X, Server, Laptop, Wifi } from 'lucide-react';

interface Device {
  ip: string;
  mac?: string;
  hostname?: string;
  vendor?: string;
}

interface LanManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanManager: React.FC<LanManagerProps> = ({ isOpen, onClose }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [waking, setWaking] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Auto scan on open if list is empty
  useEffect(() => {
    if (isOpen && devices.length === 0) {
      scanNetwork();
    }
  }, [isOpen]);

  const scanNetwork = async () => {
    setScanning(true);
    setMessage(null);
    try {
      const res = await fetch('/api/lan/scan');
      const data = await res.json();
      if (res.ok) {
          setDevices(data);
      } else {
          throw new Error(data.error || 'Scan failed');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: '扫描失败: ' + err.message });
    } finally {
      setScanning(false);
    }
  };

  const wakeDevice = async (mac: string) => {
    setWaking(mac);
    try {
        const res = await fetch('/api/lan/wake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mac })
        });
        const data = await res.json();
        if (res.ok) {
            setMessage({ type: 'success', text: `已发送唤醒包至 ${mac}` });
        } else {
            throw new Error(data.error);
        }
    } catch (err: any) {
        setMessage({ type: 'error', text: '唤醒失败: ' + err.message });
    } finally {
        setWaking(null);
        setTimeout(() => setMessage(null), 3000);
    }
  };

  const getDeviceIcon = (vendor: string = '') => {
      const v = vendor.toLowerCase();
      if (v.includes('apple') || v.includes('synology') || v.includes('qnap')) return <Server className="w-5 h-5 text-blue-400" />;
      if (v.includes('intel') || v.includes('microsoft')) return <Laptop className="w-5 h-5 text-slate-400" />;
      return <Network className="w-5 h-5 text-slate-500" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className="w-full max-w-2xl bg-[#020617]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col max-h-[80vh]">
            
            {/* Header */}
            <div className="h-14 bg-[#1e293b]/50 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Network className="w-5 h-5 text-blue-400" />
                </div>
                <span className="font-medium text-white">局域网设备管理</span>
              </div>
              <div className="flex items-center gap-3">
                  <button 
                    onClick={scanNetwork}
                    disabled={scanning}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-medium text-slate-300 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                    {scanning ? '扫描中...' : '刷新列表'}
                  </button>
                  <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 p-3 rounded-lg border text-sm ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                    >
                        {message.text}
                    </motion.div>
                )}

                <div className="grid gap-3">
                    {devices.map((device, index) => (
                        <motion.div
                            key={device.ip + index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-black/30 border border-white/5">
                                    {getDeviceIcon(device.vendor)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white">{device.hostname || 'Unknown Device'}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-white/5">{device.ip}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                        {device.mac ? (
                                            <span className="font-mono opacity-70">{device.mac}</span>
                                        ) : (
                                            <span className="opacity-50">MAC 未知</span>
                                        )}
                                        {device.vendor && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                <span>{device.vendor}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {device.mac && (
                                <button
                                    onClick={() => wakeDevice(device.mac!)}
                                    disabled={waking === device.mac}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                    <Power className="w-3.5 h-3.5" />
                                    {waking === device.mac ? '发送中...' : '唤醒'}
                                </button>
                            )}
                        </motion.div>
                    ))}
                    
                    {!scanning && devices.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <Wifi className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>未发现设备</p>
                            <p className="text-xs opacity-60 mt-1">请点击刷新按钮扫描局域网</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-4 border-t border-white/5 bg-black/20 text-[10px] text-slate-500 text-center">
                注意: 网络唤醒 (WoL) 需要目标设备支持并已在 BIOS/网卡设置中开启该功能。Docker 环境下建议使用 host 网络模式。
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LanManager;
