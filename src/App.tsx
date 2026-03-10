/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { addMonths, subMonths, format } from 'date-fns';

import { MissedLesson } from './types';
import { Header } from './components/dashboard/Header';
import { TokenAlert } from './components/dashboard/TokenAlert';
import { StatsGrid } from './components/dashboard/StatsGrid';
import { CalendarWidget } from './components/dashboard/CalendarWidget';
import { DistributionWidget } from './components/dashboard/DistributionWidget';
import { TopMissed } from './components/dashboard/Sidebar/TopMissed';
import { RecentHistory } from './components/dashboard/Sidebar/RecentHistory';
import { SettingsModal } from './components/overlays/SettingsModal';
import { LessonsModal } from './components/overlays/LessonsModal';
import { LoadingOverlay } from './components/overlays/LoadingOverlay';
import { WelcomeOverlay } from './components/overlays/WelcomeOverlay';
import {
  APP_VERSION,
  API_BASE_URL,
  HARDCODED_SUBJECTS,
  HARDCODED_GRID,
  HARDCODED_HOLIDAYS,
  HARDCODED_SETTINGS,
  MIN_DATE,
  MAX_DATE
} from './constants.ts';

export default function App() {
  const [user, setUser] = useState<{ name?: string; given_name?: string } | null>(null);
  const [lessons, setLessons] = useState<MissedLesson[]>([]);
  const [plannedLessons, setPlannedLessons] = useState<MissedLesson[]>([]);
  const [token, setToken] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLessonsModalOpen, setIsLessonsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(Date.now()); // Январь 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const driverRef = useRef<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('backend_token');
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (!token) {
      setLessons([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setApiMessage(null);
      
      try {
        const userResp = await fetch(`${API_BASE_URL}/GetUser?token=${token}&v=${APP_VERSION}&ref=web`);
        if (!userResp.ok) throw new Error(`Err while trying to fetch user data: ${userResp.status}`);
        const userData = await userResp.json();
        setUser(userData);
      
        const response = await fetch(`${API_BASE_URL}/GetAttendance?token=${token}&v=${APP_VERSION}`);
        if (!response.ok) throw new Error(`Server err: ${response.status}`);
        const data = await response.json();

        if (data.message) {
          setApiMessage(data.message);
          setIsLoading(false);
          return;
        }

        const parsedLessons: MissedLesson[] = [];
        Object.entries(data).forEach(([dateString, subjectsDict]) => {
          // Указываем, что в объекте могут быть как предметы, так и служебное поле notified
          const { notified, ...subjects } = subjectsDict as any; 

          Object.values(subjects).forEach((subj: any) => {
            for (let i = 0; i < subj.q; i++) {
              parsedLessons.push({
                id: `${subj.id}_${dateString}_${i}`,
                date: dateString,
                subject: subj.name,
                notified: notified, // используем извлеченное ранее значение
                subject_id: String(subj.id),
              });
            }
          })});

        parsedLessons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setLessons(parsedLessons);

      } catch (e) {
        console.error("Err while trying to get an attendance:", e);
        setApiMessage("Не удалось загрузить данные. Проверьте токен или подключение к интернету");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const saveToken = (newToken: string) => {
    const cleanToken = newToken.trim();

    setToken(cleanToken);
    
    try {
      localStorage.setItem('backend_token', cleanToken);
    } catch (e) {
      console.warn("Local Storage can't be accessed..", e);
    }
    
    setIsSettingsOpen(false);
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      if (user && user.given_name && apiMessage == null) {
        setIsLessonsModalOpen(true);
      }
    }, 3000);
  };

  const nextMonth = () => {
    const next = addMonths(currentMonth, 1);
    if (next <= MAX_DATE) setCurrentMonth(next);
  };

  const prevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    setCurrentMonth(prev);
  };

  const handleTogglePlannedLesson = (date: Date, subjectId: string, subjectName: string, periodIndex: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const id = `planned_${dateStr}_${subjectId}_${periodIndex}`;
    
    setPlannedLessons(prev => {
      const exists = prev.find(l => l.id === id);
      if (exists) {
        return prev.filter(l => l.id !== id);
      }
      return [...prev, {
        id,
        date: dateStr,
        subject: subjectName,
        subject_id: subjectId,
        notified: false,
        // @ts-ignore: Adding custom property for UI logic
        isPlanned: true
      } as MissedLesson];
    });
  };

  const { stats, distributionData } = useMemo(() => {
    const earlyDate = new Date(2026, 0, 12);
    const mainDate = new Date(2026, 1, 2);
    
    const moscowTimeStr = new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" });
    const now = new Date(moscowTimeStr);

    const mySubjects: any[] = [];
    HARDCODED_SUBJECTS.forEach((row) => {
      const id = String(row[0]).trim();
      const name = row[1];
      const isRequired = String(row[3]).toUpperCase() === "TRUE";
      const useEarlyStart = String(row[4]).toUpperCase() === "TRUE";
      const groupNum = parseInt(row[5] as string, 10);
      const limitVal = parseFloat(row[6] as string);

      let isAllowed = isRequired;
      if (!isRequired) {
        const settingIndex = groupNum - 1;
        if (settingIndex >= 0 && settingIndex < HARDCODED_SETTINGS.length) {
          isAllowed = HARDCODED_SETTINGS[settingIndex] === true;
        }
      }

      if (isAllowed) {
        mySubjects.push({ id, name, limit: limitVal || 0.2, useEarlyStart });
      }
    });

    const lessonsPerWeek: Record<string, number> = {};
    mySubjects.forEach(s => lessonsPerWeek[s.id] = 0);

    HARDCODED_GRID.forEach((row) => {
      row.forEach(cellContent => {
        const cellStr = String(cellContent || "");
        if (!cellStr) return;
        
        const idsInCell = cellStr.split(';').map(i => i.trim());
        for (const cellId of idsInCell) {
          if (!cellId) continue;
          const foundSubject = mySubjects.find(s => s.id === cellId);
          if (foundSubject) {
            lessonsPerWeek[foundSubject.id]++;
            break; 
          }
        }
      });
    });

    const countWorkWeeks = (start: Date, end: Date) => {
      if (start > end) return 0;
      let count = 0;
      let curr = new Date(start);
      while (curr <= end) {
        if (curr.getDay() === 1) { 
          const isHoliday = HARDCODED_HOLIDAYS.some(h => curr >= h.start && curr <= h.end);
          if (!isHoliday) count++;
        }
        curr.setDate(curr.getDate() + 7);
      }
      return count || 1;
    };

    const weeksTotalMain = countWorkWeeks(mainDate, MAX_DATE);
    const weeksTotalEarly = countWorkWeeks(earlyDate, MAX_DATE);
    const weeksPassedMain = countWorkWeeks(mainDate, now);
    const weeksPassedEarly = countWorkWeeks(earlyDate, now);

    const allLessons = [...lessons, ...plannedLessons];

    const missedStats: Record<string, number> = {};
    allLessons.forEach((l) => {
      const subjId = l.subject_id || mySubjects.find(s => s.name === l.subject)?.id;
      if (subjId) {
        missedStats[subjId] = (missedStats[subjId] || 0) + 1; 
      }
    });

    let totalMissedOverall = 0;
    const subjectsStats = mySubjects.map(s => {
      const missed = missedStats[s.id] || 0;
      const freq = lessonsPerWeek[s.id] || 0;
      
      const currentPassedWeeks = s.useEarlyStart ? weeksPassedEarly : weeksPassedMain;
      const currentTotalWeeks = s.useEarlyStart ? weeksTotalEarly : weeksTotalMain;
      
      let occurred = freq * currentPassedWeeks;
      let totalPlanned = freq * currentTotalWeeks;
      
      // Исключения
      if (["33623580", "33623617"].includes(s.id)) {
        occurred += 3;
        totalPlanned += 3;
      }

      const factPercent = occurred > 0 ? missed / occurred : 0;
      totalMissedOverall += missed;

      return { 
        id: s.id, 
        name: s.name, 
        missed, 
        occurred, 
        totalPlanned,
        factPercent, 
        limit: s.limit 
      };
    }).filter(s => s.missed > 0);

    subjectsStats.sort((a, b) => b.factPercent - a.factPercent);

    let mostMissedByQuantity = subjectsStats.sort((a, b) => b.missed - a.missed);

    const calculatedStats = {
      total: totalMissedOverall,
      sortedSubjects: subjectsStats.map(s => ({ name: s.name, count: s.missed })),
      mostMissed: subjectsStats.length > 0 
        ? { name: mostMissedByQuantity[0].name, count: mostMissedByQuantity[0].missed } 
        : { name: '—', count: 0 }
    };

    const calcDistributionData = subjectsStats.map(subj => {
      const maxAllowed = Math.floor(subj.totalPlanned * subj.limit);
      const safeRemaining = Math.max(0, maxAllowed - subj.missed);

      return {
        name: subj.name,
        value: Math.round(subj.factPercent * 100),
        limit: Math.round(subj.limit * 100),
        yellow: Math.max(0, Math.round((subj.limit - 0.1) * 100)),
        red: Math.max(0, Math.round((subj.limit - 0.05) * 100)),
        safeRemaining
      };
    });

    return { stats: calculatedStats, distributionData: calcDistributionData };
  }, [lessons, plannedLessons]);

  const selectableSubjects = HARDCODED_SUBJECTS
  .filter(s => s[3] === "FALSE")
  .reduce((acc, s) => {
    const [id, name, cabinet, required, before, group] = s;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push({ id, group, cabinet });
    return acc;
  }, {});

  useEffect(() => {
    let selected = localStorage.getItem('selected_lessons');
    if ((!selected || JSON.parse(selected).length < Object.keys(selectableSubjects).length) && user && user.given_name) {
      setIsSettingsOpen(true);
    }
  }, []);

    const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      nextBtnText: 'Далее &rarr;',
      prevBtnText: '&larr; Назад',
      doneBtnText: 'Понятно',
      steps: [
        { 
          element: '#tour-stats',
          popover: { 
            title: 'Общая статистика', 
            description: 'Здесь отображается общее количество пропущенных уроков и самый проблемный предмет.', 
            side: "bottom", align: 'start' 
          }
        },
        { 
          element: '#tour-calendar', 
          popover: { 
            title: 'Календарь', 
            description: 'Если вы пропустили день, то под датой будет точка. Чем больше пропущено, тем больше точек. Нажмите на день, чтобы увидеть детали.', 
            side: "right", align: 'start' 
          }
        },
        { 
          element: '#tour-distribution', 
          popover: { 
            title: 'Статистика пропусков', 
            description: 'Самый важный виджет. Показывает процент пропусков и сколько уроков допустимо до красной зоны. Можно сортировать!', 
            side: "left", align: 'start' 
          }
        },
        { 
          element: '#app-container', 
          popover: { 
            title: 'Вот и все', 
            description: 'Спасибо, что пользуетесь трекером!', 
            side: "left", align: 'start' 
          }
        },
      ]
    });

    driverRef.current = driverObj;

    driverObj.drive();
  };

  useEffect(() => {
    const selected = localStorage.getItem('selected_lessons');
    const isConditionMet = (!selected || Object.keys(selectableSubjects || {}).length > JSON.parse(selected || '[]').length);
    console.log(isConditionMet, { selected, selectableSubjects });

    if (user && user.given_name && apiMessage == null && isConditionMet) {
        setIsLessonsModalOpen(true);
    }
  }, [token, user, apiMessage]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('has_seen_tour_v2');

    if (token && !hasSeenTour && user && user.given_name && apiMessage == null && !isLessonsModalOpen) {
      setTimeout(() => {
        startTour();
        localStorage.setItem('has_seen_tour_v2', 'true');
      }, 500);
    }
  }, [isLessonsModalOpen])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12" id="app-container">
        
        <div id="tour-settings">
          <Header onOpenSettings={() => setIsSettingsOpen(true)} />
        </div>

        {/* Уведомления */}
        {!token && <TokenAlert />}
        {apiMessage && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-800 font-medium">
            {apiMessage}
          </div>
        )}

        <div id="tour-stats">
          <StatsGrid total={stats.total} mostMissed={stats.mostMissed} />
        </div>

        {window.innerWidth < 568 ? <div className="space-y-6 md:space-y-8 mb-8">
            <TopMissed subjects={stats.sortedSubjects} />
            <RecentHistory 
              lessons={lessons} 
              onDateClick={(dateStr) => {
                const dateObj = new Date(dateStr);
                setSelectedDate(dateObj);
                setCurrentMonth(dateObj);
                
                document.getElementById('tour-calendar')?.scrollIntoView({ behavior: 'smooth' });
              }} 
            />
          </div> : ""}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div id="tour-calendar">
              <CalendarWidget 
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                lessons={lessons}
                planned={plannedLessons}
                holidays={HARDCODED_HOLIDAYS}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
                onSelectDate={setSelectedDate}
                onTogglePlannedLesson={handleTogglePlannedLesson}
              />
            </div>
            <div id="tour-distribution">
              {distributionData.length > 0 && <DistributionWidget data={distributionData} />}
            </div>
          </div>

          {/* Sidebar */}
          {window.innerWidth >= 568 ? <div className="space-y-6 md:space-y-8">
            <TopMissed subjects={stats.sortedSubjects} />
            <RecentHistory 
              lessons={lessons} 
              onDateClick={(dateStr) => {
                const dateObj = new Date(dateStr);
                setSelectedDate(dateObj);
                setCurrentMonth(dateObj);
                
                document.getElementById('tour-calendar')?.scrollIntoView({ behavior: 'smooth' });
              }} 
            />
          </div> : ""}

        </div>
      </div>

      {/* Overlays */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        currentToken={token}
        onClose={() => setIsSettingsOpen(false)} 
        onSave={saveToken} 
      />
      <LessonsModal isOpen={isLessonsModalOpen} data={selectableSubjects} onClose={() => setIsLessonsModalOpen(!isLessonsModalOpen)} />
      <LoadingOverlay isLoading={isLoading} />
      <WelcomeOverlay show={user ? showWelcome : false} name={user?.given_name} />
    </div>
  );
}