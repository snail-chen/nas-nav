import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ChevronRight, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (password: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Simulate network delay for effect
    setTimeout(() => {
      const success = onLogin(password);
      if (!success) {
        setError(true);
        setIsLoading(false);
        // Shake animation trigger could go here
      }
    }, 800);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Background Elements specific to Login */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 mx-4"
      >
        {/* Glass Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-white/5">
          
          {/* Top decorative line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

          <div className="p-8 flex flex-col items-center">
            {/* Icon */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            >
              <Lock className="w-8 h-8 text-blue-400" />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-2 tracking-tight"
            >
              System Access
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 text-sm mb-8 text-center"
            >
              Identity verification required to access NAS OS console.
            </motion.p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="relative group"
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Enter Access Key"
                  className={`w-full bg-black/20 border ${error ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'} rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20' : 'focus:ring-blue-500/20'} focus:border-transparent transition-all text-center tracking-widest`}
                  autoFocus
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                type="submit"
                className={`w-full ${isLoading ? 'bg-blue-600/50 cursor-wait' : 'bg-blue-600 hover:bg-blue-500'} text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <>
                    <span>Initialize Session</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Footer Status */}
          <div className="bg-[#020617]/50 border-t border-white/5 p-4 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-medium">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Online
            </div>
            <div>v2.0.0</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
