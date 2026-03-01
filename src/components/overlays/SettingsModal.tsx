import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  currentToken: string;
  onClose: () => void;
  onSave: (token: string) => void;
}

export function SettingsModal({ isOpen, currentToken, onClose, onSave }: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Настройки</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Key size={14} />
                  API Токен
                </label>
                <input 
                  type="text" 
                  defaultValue={currentToken}
                  id="tokenInput"
                  placeholder="Введите ваш токен..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm"
                />
                <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">
                  Токен необходим для авторизации ваших запросов к бэкэнду. Он хранится только в вашем браузере.
                </p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => {
                    const val = (document.getElementById('tokenInput') as HTMLInputElement).value;
                    onSave(val);
                  }}
                  className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                >
                  Сохранить изменения
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}