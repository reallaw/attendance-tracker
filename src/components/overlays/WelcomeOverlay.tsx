import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomeOverlayProps {
  show: boolean;
  name: string;
}

export function WelcomeOverlay({ show, name }: WelcomeOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] p-12 shadow-2xl text-center overflow-hidden"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <img src="/assets/hello.png" alt="Welcome" className="w-24 h-24 rounded-full" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Привет, {name}!</h2>
              <p className="text-slate-500 font-medium">Твой токен сохранен</p>
            </motion.div>

            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 2 }}
              className="absolute bottom-0 left-0 h-1.5 bg-indigo-600"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}