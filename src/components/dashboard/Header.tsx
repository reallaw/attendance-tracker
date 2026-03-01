import React from 'react';
import { Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Журнал пропусков
        </h1>
        <p className="text-slate-500 text-base md:text-lg">
          Учет и статистика пропущенных занятий
        </p>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={onOpenSettings}
          className="inline-flex items-center justify-center gap-2 bg-white text-slate-600 px-5 py-3 rounded-2xl font-medium hover:bg-slate-50 transition-all active:scale-95 border border-slate-200"
        >
          <Settings size={20} />
          <span className="hidden sm:inline">Настройки</span>
        </button>
      </div>
    </header>
  );
}