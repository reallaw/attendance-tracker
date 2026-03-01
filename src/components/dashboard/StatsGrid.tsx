import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, BookOpen, TrendingUp } from 'lucide-react';

interface StatsGridProps {
  total: number;
  mostMissed: { name: string; count: number };
}

export function StatsGrid({ total, mostMissed }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px] md:text-xs">Всего пропущено</span>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <BarChart3 size={18} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-light">{total}</span>
          <span className="text-slate-400 font-medium text-sm md:text-base">уроков</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px] md:text-xs">Чаще всего</span>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <BookOpen size={18} />
          </div>
        </div>
        <div>
          <div className="text-xl md:text-2xl font-medium text-slate-800 truncate mb-1">
            {mostMissed.name}
          </div>
          <div className="text-slate-400 font-medium text-sm">
            {mostMissed.count} {mostMissed.count === 1 ? 'пропуск' : mostMissed.count < 5 && mostMissed.count > 0 ? 'пропуска' : 'пропусков'}
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between sm:col-span-2 md:col-span-1"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px] md:text-xs">Статус</span>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <TrendingUp size={18} />
          </div>
        </div>
        <div>
          <div className="text-xl md:text-2xl font-medium text-slate-800 mb-1">
            {total > 10 ? 'Требует внимания' : 'В пределах нормы'}
          </div>
          <div className="text-slate-400 font-medium text-sm">
            {total > 10 ? 'Слишком много пропусков' : 'Продолжайте в том же духе'}
          </div>
        </div>
      </motion.div>
    </div>
  );
}