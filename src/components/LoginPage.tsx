import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronRight, AlertCircle, User, Cpu, Activity, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  siteTitle: string;
  onLogin: (username: string, password: string) => boolean;
}

// --- Matrix / Tech Rain Background ---
const TechBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Configuration
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);
    const chars = "01ABCDEF"; // Hex-like characters

    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(2, 6, 23, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f766e'; // Dark Teal/Cyan text
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        // Randomly brighter characters
        if (Math.random() > 0.95) {
            ctx.fillStyle = '#2dd4bf'; // Bright Teal
        } else {
            ctx.fillStyle = '#115e59'; // Dim Teal
        }
        
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 opacity-30" 
    />
  );
};

// --- Glitch Text Component ---
const GlitchText: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => {
  return (
    <div className={`relative group inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-red-500 opacity-0 group-hover:opacity-70 group-hover:animate-pulse translate-x-[2px]">
        {text}
      </span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-cyan-500 opacity-0 group-hover:opacity-70 group-hover:animate-pulse -translate-x-[2px]">
        {text}
      </span>
    </div>
  );
};

const LoginPage: React.FC<LoginPageProps> = ({ siteTitle, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;
    
    setIsLoading(true);
    setError(false);

    // Simulate processing time
    setTimeout(() => {
      const success = onLogin(username, password);
      if (success) {
        setIsSuccess(true);
        // Allow success animation to play before unmounting/redirecting
        // The parent component will likely handle the redirect/state change
        // but visually we want to show success first.
      } else {
        setError(true);
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617] overflow-hidden font-mono">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)] z-0" />
      <TechBackground />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-1"
      >
        {/* HUD Container */}
        <div className="relative bg-black/40 backdrop-blur-md border border-cyan-900/50 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(8,145,178,0.1)]">
          
          {/* Top Bar (Decoration) */}
          <div className="h-8 bg-cyan-950/30 border-b border-cyan-900/30 flex items-center justify-between px-4">
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
            <div className="text-[10px] text-cyan-500/60 tracking-widest uppercase">System Access Interface v3.0</div>
          </div>

          {/* Scanning Line Animation */}
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.8)] z-20 animate-[scan_3s_ease-in-out_infinite]" />

          <div className="p-8 relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50" />

            {/* Header */}
            <div className="text-center mb-10 relative">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 relative group"
                >
                    <div className="absolute inset-0 rounded-2xl border border-cyan-400/20 animate-ping opacity-20" />
                    <Cpu className="w-10 h-10 text-cyan-400" />
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-white tracking-wider uppercase mb-2"
                >
                    <GlitchText text={siteTitle} />
                </motion.h1>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto max-w-[200px]" 
                />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {/* Username */}
                    <div className="group relative">
                        <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-0 group-focus-within:h-8 bg-cyan-500 transition-all duration-300" />
                        <div className="relative flex items-center">
                            <User className="absolute left-4 w-5 h-5 text-cyan-700 group-focus-within:text-cyan-400 transition-colors" />
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError(false);
                                }}
                                className="w-full bg-cyan-950/10 border border-cyan-900/30 rounded focus:border-cyan-500/50 focus:bg-cyan-950/20 text-cyan-100 pl-12 pr-4 py-3 outline-none transition-all placeholder:text-cyan-900/50 text-sm"
                                placeholder="USER_ID"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="group relative">
                        <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-0 group-focus-within:h-8 bg-cyan-500 transition-all duration-300" />
                        <div className="relative flex items-center">
                            <Lock className="absolute left-4 w-5 h-5 text-cyan-700 group-focus-within:text-cyan-400 transition-colors" />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(false);
                                }}
                                className="w-full bg-cyan-950/10 border border-cyan-900/30 rounded focus:border-cyan-500/50 focus:bg-cyan-950/20 text-cyan-100 pl-12 pr-4 py-3 outline-none transition-all placeholder:text-cyan-900/50 text-sm"
                                placeholder="ACCESS_CODE"
                            />
                        </div>
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
                            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded border border-red-500/20">
                                <AlertCircle className="w-4 h-4" />
                                <span>ACCESS DENIED: INVALID CREDENTIALS</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full relative group overflow-hidden rounded p-[1px] ${isSuccess ? 'cursor-default' : 'cursor-pointer'}`}
            >
                <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 transition-all duration-1000 ${isLoading ? 'animate-[spin_3s_linear_infinite]' : ''}`} />
                <div className="relative bg-[#020617] hover:bg-[#0f172a] transition-colors rounded-[3px] py-3 px-4 flex items-center justify-center gap-3">
                        {isLoading ? (
                            <>
                                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                                <span className="text-cyan-400 text-sm font-bold tracking-widest animate-pulse">AUTHENTICATING...</span>
                            </>
                        ) : isSuccess ? (
                             <>
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400 text-sm font-bold tracking-widest">ACCESS GRANTED</span>
                            </>
                        ) : (
                            <>
                                <span className="text-cyan-400 text-sm font-bold tracking-widest group-hover:text-cyan-300">INITIALIZE_SESSION</span>
                                <ChevronRight className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </div>
                </button>
            </form>
            
            {/* Footer */}
            <div className="mt-8 flex justify-between items-center text-[10px] text-cyan-900/60 font-mono">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-cyan-500'} animate-pulse`} />
                    SERVER_STATUS: ONLINE
                </div>
                <div>SECURE_CONNECTION_V2</div>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
