import React, { useMemo } from 'react';
import { isWithinInterval } from 'date-fns';
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import 'react-tooltip/dist/react-tooltip.css'
import { ru } from 'date-fns/locale';
import { cn } from '../../utils';
import { MissedLesson } from '../../types';
import { HARDCODED_GRID, HARDCODED_SUBJECTS } from '../../constants';

interface CalendarWidgetProps {
  currentMonth: Date;
  selectedDate: Date | null;
  lessons: MissedLesson[];
  planned: MissedLesson[];
  holidays: { start: Date; end: Date }[];
  minDate: Date;
  maxDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date | null) => void;
  onTogglePlannedLesson: (date: Date, subjectId: string, subjectName: string, periodIndex: number) => void;
}

export function CalendarWidget({
  currentMonth,
  selectedDate,
  lessons,
  minDate,
  maxDate,
  planned,
  holidays,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onTogglePlannedLesson
}: CalendarWidgetProps) {

  const windowWidth = window.innerWidth;
  
  const allLessons = useMemo(() => [...lessons, ...planned], [lessons, planned]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const lessonsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return allLessons.filter(l => l.date === dateStr);
  }, [selectedDate, allLessons]);

  const scheduleForDate = useMemo(() => {
    if (!selectedDate) return [];
    const dayIndex = selectedDate.getDay() - 1;
    if (dayIndex < 0 || dayIndex > 4) return [];

    const subjects: {id: string, name: string, period: number}[] = [];
    
    HARDCODED_GRID.forEach((row, rowIndex) => {
      const cell = row[dayIndex];
      if (!cell) return;
      const ids = cell.split(';').map(s => s.trim()).filter(Boolean);
      ids.forEach(id => {
        const subjDef = HARDCODED_SUBJECTS.find(s => s[0] === id);
        if (subjDef) {
          subjects.push({ id, name: subjDef[1] as string, period: rowIndex });
        }
      });
    });
    return subjects;
  }, [selectedDate]);

  const isHoliday = (date: Date) => {
    return holidays.some(holiday => 
      isWithinInterval(date, { start: holiday.start, end: holiday.end })
    );
  };

  return (
    <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold flex items-center leading-none gap-2 align-middle">
          <CalendarIcon size={20} className="text-indigo-500" />
          Календарь
        </h2>
        <div className="flex items-center gap-1">
          <span className="text-sm text-slate-600 uppercase tracking-widest">
            {format(currentMonth, 'LLL', { locale: ru })}
          </span>
          <div className="flex gap-1">
            <button 
              onClick={onPrevMonth}
              disabled={currentMonth <= minDate}
              className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={onNextMonth}
              disabled={currentMonth >= maxDate}
              className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {calendarDays.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayLessons = allLessons.filter(l => l.date === dateStr);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const holiday = isHoliday(day);
          
          return (
            <button
              key={i}
              onClick={() => onSelectDate(day)}
              // Отключаем клик, если это не текущий месяц или если это каникулы
              disabled={!isCurrentMonth || holiday} 
              className={cn(
                "aspect-square rounded-xl md:rounded-xl flex flex-col items-center justify-center relative",
                !isCurrentMonth && "opacity-0 pointer-events-none",
                
                isCurrentMonth && !holiday && "bg-white hover:bg-slate-50 text-slate-700",
                
                isCurrentMonth && holiday && "bg-orange-100 text-orange-500 border cursor-default",
                
                isSelected && "bg-indigo-600 hover:bg-indigo-700 text-white border-0",
                
                windowWidth < 468 && !holiday && (dayLessons.length > 0 && dayLessons.length <=3 ? "border-yellow-500 border" : dayLessons.length > 3 ? "border-red-500 border" : ""),
              )}
            >
              <span className={cn(
                "text-base font-semibold",
              )}>
                {format(day, 'd')}
              </span>
              {dayLessons.length > 0 && (
                <div className={cn(
                  "absolute bottom-2 flex gap-0.5 flex-wrap justify-center",
                  isSelected ? "p-0.5 rounded-full" : ""
                )}>
                  {windowWidth > 468 ?
                  (dayLessons.slice(0, 3).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "w-1 h-1 rounded-full",
                        isSelected ? "bg-white" : (dayLessons[idx] as any).isPlanned ? "bg-indigo-300" : "bg-indigo-500"
                      )} 
                    />
                  )))
                  : ""}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Details */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 pt-8 border-t border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">
                {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
              </h3>
              <button 
                onClick={() => onSelectDate(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Закрыть
              </button>
            </div>
            <div className="space-y-3">
              {lessonsOnSelectedDate.length > 0 ? (
                lessonsOnSelectedDate.map(lesson => (
                  <div key={lesson.id} className={cn(
                    "p-4 rounded-2xl flex items-center justify-between",
                    (lesson as any).isPlanned ? "bg-indigo-50 border border-indigo-100" : "bg-slate-50"
                  )}>
                    <div className="flex gap-2 items-center">
                      <div className={cn(
                        "w-2 max-w-2 h-2 max-h-2 rounded-full",
                        (lesson as any).isPlanned ? "bg-indigo-400" : "bg-indigo-500"
                      )} />
                      <span className={cn(
                        "font-medium",
                        (lesson as any).isPlanned ? "text-indigo-900" : "text-slate-700"
                      )}>{lesson.subject}</span>
                    </div>
                    <span className={cn(
                      "px-2 py-1 text-xs font-bold rounded-lg",
                      (lesson as any).isPlanned ? "bg-indigo-100 text-indigo-600" : (!lesson.notified ? "bg-red-50 text-red-600" : "text-slate-500")
                    )} data-tooltip-id={lesson.id} data-tooltip-content={(lesson as any).isPlanned ? "Запланированный пропуск" : (!lesson.notified ? "Пропуск без уведомления" : "По заявлению родителя")}>
                      {(lesson as any).isPlanned ? "План" : "Н"}
                    </span>
                    <ReactTooltip id={lesson.id} place="bottom" opacity="1"/>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">В этот день пропусков не было</p>
              )}

              {/* Секция планирования */}
              {/* {scheduleForDate.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h4 className="text-sm text-slate-400 mb-3">Запланировать пропуск</h4>
                  <div className="space-y-2">
                    {scheduleForDate.map((item) => {
                      const isPlanned = planned.some(l => l.id === `planned_${format(selectedDate, 'yyyy-MM-dd')}_${item.id}_${item.period}`);
                      const isReal = lessons.some(l => l.date === format(selectedDate, 'yyyy-MM-dd') && l.subject_id === item.id);

                      return (
                        <button
                          key={`${item.id}_${item.period}`}
                          onClick={() => !isReal && onTogglePlannedLesson(selectedDate, item.id, item.name, item.period)}
                          disabled={isReal}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl text-left transition-all",
                            isReal ? "bg-slate-50 opacity-50 cursor-not-allowed" : 
                            isPlanned ? "bg-indigo-50 border border-indigo-200 shadow-sm" : "bg-white border border-slate-100 hover:border-slate-300"
                          )}
                        >
                          <span className={cn("text-sm font-medium", isPlanned ? "text-indigo-900" : "text-slate-600")}>
                            {item.name}
                          </span>
                          {isReal ? (
                            <span className="text-[10px] font-bold uppercase text-slate-400">Уже пропущено</span>
                          ) : (
                            isPlanned ? <Check size={18} className="text-indigo-600" /> : <Plus size={18} className="text-slate-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )} */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}