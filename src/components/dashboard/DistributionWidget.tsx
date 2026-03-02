import React, { useState } from 'react';
import { ChartBar } from 'lucide-react';

// Добавьте типизацию, если используете TypeScript
interface DistributionData {
  name: string;
  value: number;
  limit: number;
  yellow: number;
  red: number;
  safeRemaining: number;
}

export const DistributionWidget = ({ data }: { data: DistributionData[] }) => {
  const [sortBy, setSortBy] = useState<'percent' | 'remaining'>('percent');

  // Сортируем и берем топ-5 прямо здесь
  const sortedData = [...data]
    .sort((a, b) => {
      if (sortBy === 'percent') {
        return b.value - a.value; // По убыванию процента пропусков
      } else {
        return a.safeRemaining - b.safeRemaining; // По возрастанию запаса (самые опасные сверху)
      }
    })
    .slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold flex items-center leading-none gap-2 align-middle"><ChartBar size={20} className="text-indigo-500" />Статистика пропусков</h3>
        
        {/* Переключатель сортировки */}
        {sortedData.length > 0 ? (<div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSortBy('percent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              sortBy === 'percent' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            По проценту
          </button>
          <button
            onClick={() => setSortBy('remaining')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              sortBy === 'remaining' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            По запасу
          </button>
        </div> ) : ""}
      </div>

      <div className="space-y-5">
        {sortedData.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-end mb-1">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                <span className="text-xs font-medium text-slate-400 mt-0.5">
                  В запасе: {item.safeRemaining} {item.safeRemaining === 1 ? 'урок' : (item.safeRemaining > 1 && item.safeRemaining < 5 ? 'урока' : 'уроков')}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500">{item.value}%</span>
            </div>
            {/* Здесь ваш код самого прогресс-бара... */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${item.value >= item.red ? 'bg-red-500' : item.value >= item.yellow ? 'bg-amber-400' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(item.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};