import React, { useState } from 'react';
import { getLessonLabel } from '@/src/utils';
import { ChartBar } from 'lucide-react';
import { is } from 'date-fns/locale';

// Добавьте типизацию, если используете TypeScript
interface DistributionData {
  name: string;
  value: number;
  limit: number;
  yellow: number;
  red: number;
  safeRemaining: number;
  maxAllowed: number;
  totalPlanned: number;
}

export const DistributionWidget = ({ data }: { data: DistributionData[] }) => {
  const [sortBy, setSortBy] = useState<'percent' | 'remaining'>('percent');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Сортируем и берем топ-5 прямо здесь
  const sortedData = [...data]
    .sort((a, b) => {
      if (sortBy === 'percent') {
        return b.value - a.value; // По убыванию процента пропусков
      } else {
        return a.safeRemaining - b.safeRemaining; // По возрастанию запаса (самые опасные сверху)
      }
    })
    .slice(0, 7);

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
          <button key={index} className="mb-4 w-full text-left" onClick={() => {
            if (isInfoOpen.name === item.name) {
              setIsInfoOpen(false);
              return;
            }
            setIsInfoOpen(item);
            console.log(item);
          }}>
            <div className="flex justify-between items-end mb-1">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                
                {isInfoOpen.name != item.name && <span 
                  className="flex gap-1 items-center text-xs font-medium text-slate-400 mt-0.5 cursor-help" 
                  data-tooltip-id="global-tooltip" 
                >
                  В запасе: {item.safeRemaining} {getLessonLabel(item.safeRemaining)}
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 -960 960 960">
                    <path d="M440-280h80v-240h-80v240Zm68.5-331.5Q520-623 520-640t-11.5-28.5Q497-680 480-680t-28.5 11.5Q440-657 440-640t11.5 28.5Q463-600 480-600t28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                  </svg>
                </span>}
                {isInfoOpen.name === item.name && (
                <p className="text-xs font-medium text-slate-700 mt-0.5">Всего {item.totalPlanned} {getLessonLabel(item.totalPlanned)}, вы пропустили {item.maxAllowed-item.safeRemaining} {getLessonLabel(item.maxAllowed-item.safeRemaining)}.
                Если пропустить еще {item.safeRemaining}, то общий процент пропусков составит {((item.maxAllowed/item.totalPlanned)*100).toFixed(2)}%</p>
                )}
              </div>
              <span className="text-xs font-bold text-slate-500">{item.value}%</span>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${ // Добавил анимацию
                  item.value >= item.red ? 'bg-red-500' : 
                  item.value >= item.yellow ? 'bg-amber-400' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(item.value, 100)}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};