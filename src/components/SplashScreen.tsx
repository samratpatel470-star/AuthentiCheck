import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'welcome' | 'madeInIndia' | 'madeByAuthenti' | 'exit'>('welcome');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('madeInIndia'), 2000);
    const timer2 = setTimeout(() => setPhase('madeByAuthenti'), 4000);
    const timer3 = setTimeout(() => setPhase('exit'), 6000);
    const timer4 = setTimeout(() => onComplete(), 6500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center text-white overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {phase === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <div className="bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-500/20">
                <ShieldCheck className="w-16 h-16 text-white" />
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter">
              Welcome to <span className="text-indigo-400">AuthentiCheck</span>
            </h1>
            <p className="mt-4 text-slate-400 text-lg font-medium tracking-wide uppercase">
              AI-Powered Luxury Verification
            </p>
          </motion.div>
        )}

        {phase === 'madeInIndia' && (
          <motion.div
            key="madeInIndia"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="h-1 bg-indigo-500 mb-8 mx-auto max-w-[200px]"
            />
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-[0.2em] italic">
              <span className="text-[#FF9933]">MADE</span> <span className="text-white">IN</span> <span className="text-[#138808]">INDIA</span>
            </h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex items-center justify-center gap-4"
            >
              <div className="w-12 h-px bg-slate-700" />
              <span className="text-slate-500 font-bold tracking-widest text-xs uppercase">Authenticity Redefined</span>
              <div className="w-12 h-px bg-slate-700" />
            </motion.div>
          </motion.div>
        )}

        {phase === 'madeByAuthenti' && (
          <motion.div
            key="madeByAuthenti"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center flex flex-col items-center"
          >
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
              className="mb-8"
            >
              <div className="bg-indigo-900/50 p-6 rounded-full border border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
                <ShieldCheck className="w-20 h-20 text-indigo-400" />
              </div>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-[0.1em] uppercase">
              Made By <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Authenti
              </span>
            </h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex items-center justify-center gap-4"
            >
              <div className="w-12 h-px bg-indigo-500/50" />
              <span className="text-indigo-300 font-bold tracking-widest text-xs uppercase">Premium Quality</span>
              <div className="w-12 h-px bg-indigo-500/50" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/30 rounded-full blur-[120px]" />
      </div>
    </motion.div>
  );
};
