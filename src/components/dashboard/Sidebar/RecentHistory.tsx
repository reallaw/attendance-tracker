import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { MissedLesson } from '../../../types'; // Проверьте правильность пути до типов

interface RecentHistoryProps {
  lessons: MissedLesson[];
  onDateClick: (date: string) => void;
}

export const RecentHistory = ({ lessons, onDateClick }: RecentHistoryProps) => {
  // Группируем пропуски по дням
  const recentDays = useMemo(() => {
    const grouped: Record<string, number> = {};
    
    lessons.forEach(l => {
      grouped[l.date] = (grouped[l.date] || 0) + 1;
    });

    // Превращаем в массив, сортируем от новых к старым и берем топ-5 последних дней
    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [lessons]);

  if (recentDays.length === 0) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Последние пропуски</h3>
        <p className="text-slate-500 text-sm italic">Данные отсутствуют</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-5">Последние пропуски</h3>
      
      <div className="space-y-3">
        {recentDays.map(({ date, count }) => {
          const dateObj = new Date(date);
          const formattedDate = format(dateObj, 'd MMMM, EEEEEE', { locale: ru });
          
          return (
            <button
              key={date}
              onClick={() => onDateClick(date)}
              className="w-full flex justify-between items-center p-3 rounded-2xl hover:bg-indigo-50/50 transition-colors text-left group"
            >
              <div>
                <div className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors capitalize">
                  {formattedDate}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Показать в календаре
                </div>
              </div>
              
              <div className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                {count} {'ур.'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};