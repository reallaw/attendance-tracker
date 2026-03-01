import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils';

interface ProgressBarProps {
  name: string;
  value: number;
  yellow: number;
  red: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ name, value, yellow, red, safeRemaining }) => {
  let colorClass = "bg-emerald-500";
  if (value >= red) colorClass = "bg-red-500";
  else if (value >= yellow) colorClass = "bg-amber-400";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end mb-1">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700">{name}</span>
            {/* Показываем, сколько еще можно безопасно пропустить */}
            <span className="text-xs font-medium text-slate-400 mt-0.5">
              Можно пропустить: {safeRemaining} {safeRemaining === 1 ? 'урок' : (safeRemaining > 1 && safeRemaining < 5 ? 'урока' : 'уроков')}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500">{value}%</span>
        </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClass)}
        />
      </div>
    </div>
  );
}