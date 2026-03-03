import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingOverlayProps {
  isLoading: boolean;
}

export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-white/60 backdrop-blur-[4px] flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Загрузка и тд..</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}