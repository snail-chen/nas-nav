import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Lock, ChevronRight, AlertCircle, User, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  siteTitle: string;
  onLogin: (username: string, password: string) => Promise<boolean>;
}

const LoginPage: React.FC<LoginPageProps> = ({ siteTitle, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mouse position for interaction
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for the background blob
  const springConfig = { damping: 20, stiffness: 100 }; // Softer spring for floaty feel
  const blobX = useSpring(mouseX, springConfig);
  const blobY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;
    
    setIsLoading(true);
    setError(false);

    // Simulate processing time
    setTimeout(async () => {
      const success = await onLogin(username, password);
      if (success) {
        setIsSuccess(true);
      } else {
        setError(true);
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#f0f2f5] font-sans selection:bg-blue-500/20"
      onMouseMove={handleMouseMove}
    >
      {/* Interactive Background - Vivid Colors for Glass Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Mouse Following Blob - Main Light Source */}
        <motion.div
          style={{ 
            x: blobX, 
            y: blobY,
            translateX: '-50%',
            translateY: '-50%'
          }}
          className="absolute w-[60vw] h-[60vw] rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-[120px] opacity-40 pointer-events-none mix-blend-multiply"
        />

        {/* Ambient Floating Blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-rose-300 rounded-full blur-[100px] opacity-40 mix-blend-multiply" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -80, 0],
            y: [0, 80, 0],
            rotate: [0, -60, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-300 rounded-full blur-[100px] opacity-40 mix-blend-multiply" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] px-6"
      >
        {/* Ultimate Glass Card */}
        <div className="relative backdrop-blur-3xl bg-white/30 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-[32px] overflow-hidden ring-1 ring-white/60">
          
          {/* Noise Texture Overlay (Optional subtle grain) */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

          {/* Header Section */}
          <div className="pt-12 pb-8 px-10 text-center relative z-10">
            {/* Logo / Icon */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-20 h-20 mx-auto mb-6 rounded-[20px] bg-white/40 border border-white/50 flex items-center justify-center shadow-lg shadow-black/5 backdrop-blur-md"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#blue-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="blue-gradient" x1="0" y1="0" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </motion.div>

            {/* Site Title */}
            <motion.h1 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl font-bold text-slate-800 tracking-tight mb-3 drop-shadow-sm"
            >
              {siteTitle}
            </motion.h1>
            
            <motion.p 
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-slate-600 font-medium"
            >
              登录到您的工作区
            </motion.p>
          </div>

          {/* Form Section */}
          <div className="px-10 pb-12 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                {/* Username */}
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-600 transition-colors duration-300" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError(false);
                    }}
                    className="w-full bg-white/40 hover:bg-white/60 focus:bg-white/80 border border-white/50 focus:border-blue-400/50 rounded-2xl pl-12 pr-4 py-4 text-slate-800 placeholder-slate-500 outline-none transition-all duration-300 text-[15px] shadow-sm backdrop-blur-sm"
                    placeholder="用户名"
                  />
                </div>

                {/* Password */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-600 transition-colors duration-300" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    className="w-full bg-white/40 hover:bg-white/60 focus:bg-white/80 border border-white/50 focus:border-blue-400/50 rounded-2xl pl-12 pr-4 py-4 text-slate-800 placeholder-slate-500 outline-none transition-all duration-300 text-[15px] shadow-sm backdrop-blur-sm"
                    placeholder="密码"
                  />
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-100/50 border border-red-200/50 px-4 py-3 rounded-2xl backdrop-blur-md mt-2 shadow-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>用户名或密码错误</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full mt-6 relative overflow-hidden rounded-2xl py-4 font-bold text-[16px] transition-all duration-300 shadow-xl ${
                  isSuccess 
                    ? 'bg-emerald-500 text-white cursor-default shadow-emerald-500/30' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>正在验证...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>验证成功</span>
                    </>
                  ) : (
                    <>
                      <span>进入系统</span>
                      <ChevronRight className="w-4 h-4 opacity-80" />
                    </>
                  )}
                </div>
              </motion.button>
            </form>
          </div>
          
          {/* Footer Decorative Line */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center space-y-2">
           <p className="text-xs text-slate-500/80 font-semibold tracking-widest uppercase drop-shadow-sm">
             安全环境已就绪
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
