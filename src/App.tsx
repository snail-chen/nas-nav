import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { X, Settings, Plus, Monitor, Search, Wifi, Edit2, Trash2, LogOut, User, Shield, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { useConfig } from './hooks/useConfig';
import { useAuth } from './hooks/useAuth';
import ParticleBackground from './components/ParticleBackground';
import LoginPage from './components/LoginPage';
import SystemMonitor from './components/SystemMonitor';
import { NavLink } from './types';

// --- Context Menu Component ---
interface ContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  isAdmin: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onEdit, onDelete, onClose, isAdmin }) => {
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

  if (!isAdmin) return null;

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
        编辑
      </button>
      <div className="h-[1px] bg-white/10 my-1" />
      <button
        onClick={onDelete}
        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 flex items-center gap-2 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        删除
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
  const { config, updateSiteTitle, updateBaseUrl, updateSessionTimeout, addLink, removeLink, updateLink, updateLinkIcon } = useConfig();
  const { currentUser, users, login, logout, addUser, changePassword, deleteUser, toggleConcurrent, resetSession } = useAuth();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'users' | 'profile'>('general');

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; linkId: string } | null>(null);

  // Local state
  const [isSystemMonitorOpen, setIsSystemMonitorOpen] = useState(false);
  const [tempSiteTitle, setTempSiteTitle] = useState(config.siteTitle);
  const [tempBaseUrl, setTempBaseUrl] = useState(config.baseUrl);
  const [tempSessionTimeout, setTempSessionTimeout] = useState(config.sessionTimeout || 30);
  const [editingLink, setEditingLink] = useState<NavLink | null>(null);
  const [linkName, setLinkName] = useState('');
  const [linkPort, setLinkPort] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // User Management State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [newAllowConcurrent, setNewAllowConcurrent] = useState(false);
  const [changePassNew, setChangePassNew] = useState('');
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  // Dock mouse tracking
  const mouseX = useMotionValue(Infinity);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync local state when config changes or modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      setTempSiteTitle(config.siteTitle);
      setTempBaseUrl(config.baseUrl);
      setTempSessionTimeout(config.sessionTimeout || 30);
      setActiveSettingsTab('general');
      setUserError('');
      setUserSuccess('');
    }
  }, [isSettingsOpen, config]);

  // Sync document title
  useEffect(() => {
    document.title = config.siteTitle;
  }, [config.siteTitle]);

  const handleLogin = (u: string, p: string) => {
    return login(u, p);
  };

  const handleSaveSettings = () => {
    updateSiteTitle(tempSiteTitle);
    updateBaseUrl(tempBaseUrl);
    updateSessionTimeout(Number(tempSessionTimeout));
    setUserSuccess('设置已保存。');
    setTimeout(() => setIsSettingsOpen(false), 800);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');
    
    if (newPassword !== newPasswordConfirm) {
      setUserError('两次输入的密码不一致。');
      return;
    }
    
    if (newUsername.length < 3 || newPassword.length < 3) {
      setUserError('用户名和密码至少需要3个字符。');
      return;
    }

    addUser(newUsername, newPassword, 'user', newAllowConcurrent).then(success => {
        if (success) {
          setUserSuccess(`用户 ${newUsername} 添加成功。`);
          setNewUsername('');
          setNewPassword('');
          setNewPasswordConfirm('');
          setNewAllowConcurrent(false);
        } else {
          setUserError('用户已存在或添加失败。');
        }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (changePassNew.length < 3) {
      setUserError('密码至少需要3个字符。');
      return;
    }

    changePassword(changePassNew).then(success => {
        if (success) {
          setUserSuccess('密码修改成功。');
          setChangePassNew('');
        } else {
          setUserError('密码修改失败。');
        }
    });
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
    if (currentUser?.role !== 'admin') return;
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

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="h-screen w-screen overflow-hidden relative text-slate-100 font-sans selection:bg-cyan-500/30" onClick={() => setContextMenu(null)}>
      <ParticleBackground />

      {!currentUser && <LoginPage siteTitle={config.siteTitle} onLogin={handleLogin} />}

      {currentUser && (
        <>
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
          isAdmin={isAdmin}
        />
      )}

      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 w-full h-8 px-4 flex justify-between items-center z-20 bg-black/20 backdrop-blur-md border-b border-white/10 text-xs font-medium text-white/90">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm text-white drop-shadow-md flex items-center gap-2">
            <Shield className="w-3 h-3 text-blue-400" />
            {config.siteTitle}
          </span>
          <div className="h-4 w-[1px] bg-white/10 mx-1" />
          
          <div className="flex items-center gap-1.5 text-blue-200">
            <User className="w-3 h-3" />
            <span>{currentUser.username}</span>
            {isAdmin && <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-[10px] border border-blue-500/30">管理员</span>}
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-1.5 hover:text-red-400 transition-colors cursor-pointer ml-2"
          >
            <LogOut className="w-3 h-3" />
            <span>退出登录</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3" />
            <Search className="w-3 h-3" />
          </div>
          <span>
            {currentTime.toLocaleDateString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric' })}
            {' '}
            {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
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
              <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
                <a
                  href={getFullUrl(link.port)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link)}
                  onContextMenu={(e) => handleContextMenu(e, link.id)}
                  className="block relative w-24 h-24 rounded-[24px] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex items-center justify-center overflow-hidden group-hover:bg-white/20 transition-all duration-300 group-hover:shadow-2xl"
                >
                  {/* Inner Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Icon */}
                  {link.iconUrl ? (
                    <img 
                      src={link.iconUrl}
                      alt={link.name}
                      className="relative z-10 w-full h-full object-cover"
                      onError={() => updateLinkIcon(link.id, undefined)}
                    />
                  ) : (
                    <div className="relative z-10 text-3xl font-bold text-white drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                      {link.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </a>
                
                {/* Hover remove button (Admin Only) */}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeLink(link.id);
                    }}
                    className="absolute -top-2 -left-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg z-20"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
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
          {isAdmin && (
            <>
              <DockIcon mouseX={mouseX} onClick={openAddModal} label="添加应用">
                <Plus className="w-full h-full text-white" />
              </DockIcon>
              <div className="w-[1px] h-10 bg-white/20 my-auto mx-2" />
            </>
          )}

          <DockIcon mouseX={mouseX} onClick={() => {
            setIsSettingsOpen(true);
          }} label="设置">
            <Settings className="w-full h-full text-white" />
          </DockIcon>
          
          <DockIcon mouseX={mouseX} onClick={() => setIsSystemMonitorOpen(!isSystemMonitorOpen)} label="系统监控">
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
            <div className="w-full max-w-xl bg-[#020617]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col h-[600px]">
              {/* Window Title Bar */}
              <div className="h-11 bg-[#1e293b]/50 border-b border-white/5 flex items-center px-4 relative justify-center shrink-0">
                <div className="absolute left-4 flex gap-2">
                  <button onClick={() => setIsSettingsOpen(false)} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 border border-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840] border border-black/10" />
                </div>
                <span className="text-sm font-medium text-slate-400">系统偏好设置</span>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 bg-black/20 border-r border-white/5 p-4 space-y-1">
                   {isAdmin && (
                    <button 
                      onClick={() => setActiveSettingsTab('general')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSettingsTab === 'general' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <Settings className="w-4 h-4" />
                      通用
                    </button>
                   )}
                   {isAdmin && (
                    <button 
                      onClick={() => setActiveSettingsTab('users')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSettingsTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <Users className="w-4 h-4" />
                      用户管理
                    </button>
                   )}
                   <button 
                    onClick={() => setActiveSettingsTab('profile')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSettingsTab === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <User className="w-4 h-4" />
                    个人资料
                  </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                  {userSuccess && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                      {userSuccess}
                    </div>
                  )}
                  {userError && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {userError}
                    </div>
                  )}

                  {activeSettingsTab === 'general' && isAdmin && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">通用设置</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">网站标题</label>
                          <input
                            type="text"
                            value={tempSiteTitle}
                            onChange={(e) => setTempSiteTitle(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">基础 IP / 域名</label>
                          <input
                            type="text"
                            value={tempBaseUrl}
                            onChange={(e) => setTempBaseUrl(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all mt-1"
                            placeholder="192.168.1.100"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">登录保护阈值 (分钟)</label>
                          <input
                            type="number"
                            value={tempSessionTimeout}
                            onChange={(e) => setTempSessionTimeout(Number(e.target.value))}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all mt-1"
                            placeholder="30"
                            min="1"
                          />
                          <p className="text-[10px] text-slate-500 mt-1 ml-1">超过此时间无操作需重新验证，用于并发登录检查。</p>
                        </div>
                        <button
                          onClick={handleSaveSettings}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                        >
                          保存更改
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === 'users' && isAdmin && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">添加新用户</h2>
                        <form onSubmit={handleAddUser} className="space-y-3">
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="用户名"
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="密码"
                              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                            <input
                              type="password"
                              value={newPasswordConfirm}
                              onChange={(e) => setNewPasswordConfirm(e.target.value)}
                              placeholder="确认密码"
                              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                          </div>
                          <div className="flex items-center gap-2 px-1">
                            <button
                                type="button"
                                onClick={() => setNewAllowConcurrent(!newAllowConcurrent)}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${newAllowConcurrent ? 'text-blue-400' : 'text-slate-500'}`}
                            >
                                {newAllowConcurrent ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                允许同时登录 (白名单)
                            </button>
                          </div>
                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2 rounded-lg transition-all shadow-lg active:scale-[0.98]"
                          >
                            创建用户
                          </button>
                        </form>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">已存在用户</h2>
                        <div className="space-y-2">
                          {users.map(user => (
                            <div key={user.username} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                  <User className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-medium text-white flex items-center gap-2">
                                    {user.username}
                                    {user.isOnline && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="在线" />}
                                  </div>
                                  <div className="text-xs text-slate-500 capitalize flex items-center gap-2">
                                      {user.role}
                                      {user.allowConcurrent && <span className="text-blue-400 border border-blue-500/30 px-1 rounded-[4px] text-[10px]">白名单</span>}
                                  </div>
                                </div>
                              </div>
                              {user.username !== 'admin' && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => toggleConcurrent(user.username, !user.allowConcurrent)}
                                        className={`p-2 rounded-lg transition-all ${user.allowConcurrent ? 'text-blue-400 bg-blue-500/10' : 'text-slate-600 hover:text-slate-400'}`}
                                        title={user.allowConcurrent ? "取消白名单" : "设为白名单"}
                                    >
                                        <Shield className="w-4 h-4" />
                                    </button>
                                    {user.isOnline && (
                                        <button
                                            onClick={() => resetSession(user.username)}
                                            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                                            title="下线 / 清除会话"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button 
                                      onClick={() => deleteUser(user.username)}
                                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                      title="删除用户"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === 'profile' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">修改密码</h2>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">新密码</label>
                          <input
                            type="password"
                            value={changePassNew}
                            onChange={(e) => setChangePassNew(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all mt-1"
                            placeholder="至少3个字符"
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                        >
                          更新密码
                        </button>
                      </form>
                    </div>
                  )}
                </div>
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
                <span className="text-sm font-medium text-slate-400">应用中心</span>
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
                    {editingLink ? '编辑服务' : '添加新服务'}
                  </h2>
                </div>

                <form onSubmit={handleSaveLink} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">应用名称</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">端口</label>
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
                    {editingLink ? '保存更改' : '添加应用'}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Monitor */}
      <SystemMonitor isOpen={isSystemMonitorOpen} onClose={() => setIsSystemMonitorOpen(false)} />
      </>
      )}
    </div>
  );
};

export default App;
