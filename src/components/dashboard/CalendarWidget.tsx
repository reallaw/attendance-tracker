import React, { useId, useMemo } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface CalendarWidgetProps {
  currentMonth: Date;
  selectedDate: Date | null;
  lessons: MissedLesson[];
  minDate: Date;
  maxDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date | null) => void;
}

export function CalendarWidget({
  currentMonth,
  selectedDate,
  lessons,
  minDate,
  maxDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate
}: CalendarWidgetProps) {

  const windowWidth = window.innerWidth;

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const lessonsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return lessons.filter(l => l.date === dateStr);
  }, [selectedDate, lessons]);

  console.log(lessonsOnSelectedDate)

  return (
    <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
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
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {calendarDays.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayLessons = lessons.filter(l => l.date === dateStr);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <button
              key={i}
              onClick={() => onSelectDate(day)}
              disabled={!isCurrentMonth}
              className={cn(
                "aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center relative transition-all text-slate-700",
                !isCurrentMonth && "opacity-0 pointer-events-none",
                isCurrentMonth && "hover:bg-slate-50",
                windowWidth < 468 && (dayLessons.length > 0 && dayLessons.length <=3 ? "border-yellow-500 border" : dayLessons.length > 3 ? "border-red-500 border" : ""),
                isSelected && "bg-indigo-600 hover:bg-indigo-700 text-white border-0",
                !isSelected && isCurrentMonth && "bg-white",
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
                        isSelected ? "bg-white" : "bg-indigo-500"
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
                  <div key={lesson.id} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                      <div className="w-2 max-w-2 h-2 max-h-2 rounded-full bg-indigo-500" />
                      <span className="font-medium text-slate-700">{lesson.subject}</span>
                    </div>
                    <span className={cn(
                      "w-6 h-6 flex items-center justify-center font-bold rounded-lg",
                      !lesson.notified ? "bg-red-50 text-red-600" : "text-slate-700"
                    )} data-tooltip-id={lesson.id} data-tooltip-content={!lesson.notified ? "Пропуск без уведомления" : "По заявлению родителя"}>Н</span>
                    <ReactTooltip id={lesson.id} place="bottom" opacity="1"/>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">В этот день пропусков не было</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}