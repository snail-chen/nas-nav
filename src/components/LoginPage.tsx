import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ChevronRight, AlertCircle, User as UserIcon } from 'lucide-react';

interface LoginPageProps {
  siteTitle: string;
  onLogin: (username: string, password: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ siteTitle, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Simulate network delay for effect
    setTimeout(() => {
      const success = onLogin(username, password);
      if (!success) {
        setError(true);
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>
      
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 mx-4"
      >
        {/* Glass Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-white/5">
          
          {/* Top decorative line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-70" />

          <div className="p-10 flex flex-col items-center">
            {/* Icon */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] relative group"
            >
              <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20" />
              <Lock className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2 tracking-tight text-center"
            >
              {siteTitle}
            </motion.h1>
            
            <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-slate-400 text-sm mb-8 text-center font-light tracking-wide"
                    >
                      安全身份验证
                    </motion.p>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                      {/* Username Input */}
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 }}
                        className="relative group"
                      >
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            setError(false);
                          }}
                          placeholder="用户名"
                          className={`w-full bg-black/30 border ${error ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'} rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20' : 'focus:ring-cyan-500/20'} focus:border-transparent transition-all tracking-wide`}
                          autoFocus
                        />
                      </motion.div>

                      {/* Password Input */}
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="relative group"
                      >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError(false);
                          }}
                          placeholder="密码"
                          className={`w-full bg-black/30 border ${error ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'} rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20' : 'focus:ring-cyan-500/20'} focus:border-transparent transition-all tracking-widest`}
                        />
                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400"
                          >
                            <AlertCircle className="w-5 h-5" />
                          </motion.div>
                        )}
                      </motion.div>

                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(6,182,212,0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        type="submit"
                        className={`w-full ${isLoading ? 'bg-cyan-600/50 cursor-wait' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'} text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 group relative overflow-hidden`}
                      >
                        {/* Button Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        
                        {isLoading ? (
                          <span className="flex items-center gap-2 relative z-10">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            正在验证...
                          </span>
                        ) : (
                          <>
                            <span className="relative z-10">进入系统</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                          </>
                        )}
                      </motion.button>
                    </form>
                  </div>

                  {/* Footer Status */}
                  <div className="bg-[#020617]/50 border-t border-white/5 p-4 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      系统在线
                    </div>
            <div>v2.1.0</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
