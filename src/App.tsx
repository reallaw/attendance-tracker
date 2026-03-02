/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { addMonths, subMonths } from 'date-fns';

import { MissedLesson } from './types';
import { Header } from './components/dashboard/Header';
import { TokenAlert } from './components/dashboard/TokenAlert';
import { StatsGrid } from './components/dashboard/StatsGrid';
import { CalendarWidget } from './components/dashboard/CalendarWidget';
import { DistributionWidget } from './components/dashboard/DistributionWidget';
import { TopMissed } from './components/dashboard/Sidebar/TopMissed';
import { RecentHistory } from './components/dashboard/Sidebar/RecentHistory';
import { SettingsModal } from './components/overlays/SettingsModal';
import { LoadingOverlay } from './components/overlays/LoadingOverlay';
import { WelcomeOverlay } from './components/overlays/WelcomeOverlay';

// Актуальная версия фронтенда для API
const APP_VERSION = "1.21";
const API_BASE_URL = "https://mesh-api.duckdns.org";

// ============================================================================
// ХАРДКОД ДАННЫХ ИЗ GOOGLE ТАБЛИЦЫ
// ============================================================================

// База предметов (Столбцы H - N)
// [id, name, cabinet, required, before, group, maximum]
const HARDCODED_SUBJECTS = [
  ["33623600", "Разговоры о важном", "301", "TRUE", "TRUE", "", "1"],
  ["33623649", "Алгебра и начала анализа", "301", "TRUE", "TRUE", "", "0.6"],
  ["33623650", "Геометрия", "301", "TRUE", "TRUE", "", "0.6"],
  ["33623651", "Вероятность и статистика", "301", "TRUE", "TRUE", "", "0.6"],
  ["33623580", "Физическая культура", "сп. зал 1", "TRUE", "TRUE", "", "0.6"],
  ["33623645", "История", "311", "TRUE", "TRUE", "", "0.6"],
  ["33623605", "Обществознание", "309", "TRUE", "TRUE", "", "0.6"],
  ["33623617", "Литература", "304", "TRUE", "TRUE", "", "0.6"],
  ["33818461", "Практикум ЕГЭ по информатике", "211", "FALSE", "FALSE", "1", "0.4"],
  ["33818462", "Практикум ЕГЭ по информатике", "211", "FALSE", "FALSE", "2", "0.4"],
  ["23823601", "Практикум ЕГЭ по физике", "313", "FALSE", "FALSE", "3", "0.4"],
  ["23823602", "Практикум ЕГЭ по английскому языку", "312", "FALSE", "FALSE", "4", "0.4"],
  ["23823603", "Практикум ЕГЭ по обществознанию", "309", "FALSE", "FALSE", "5", "0.4"],
  ["23823604", "Практикум ЕГЭ по географии", "406", "FALSE", "FALSE", "6", "0.4"],
  ["33823605", "Практикум ЕГЭ", "301", "TRUE", "FALSE", "", "0.4"],
  ["33818434", "Практикум ЕГЭ по математике", "113", "TRUE", "FALSE", "", "0.4"],
  ["33802624", "Практикум ЕГЭ по русскому языку", "302", "TRUE", "FALSE", "", "0.4"]
];

// Сетка расписания (Столбцы A - E, строки 2 - 11)
const HARDCODED_GRID = [
  ["33623600;33818461", "33818462;23823601", "23823601;23823602", "33623645", ""],
  ["23823601;23823602", "33623649", "33818462", "23823601;23823603", "33802624"],
  ["33623649", "33818434", "", "33623645", "33623605"],
  ["33623580", "33818434", "33623649", "33623649", "33623650"],
  ["33623651", "33623617", "33623650", "33818461", "33623650"],
  ["33818461", "33823605", "33802624", "33818461", "33818462"],
  ["33818461", "23823602", "33802624", "33623605", "33623617"],
  ["33818462;23823601", "", "23823603", "23823603", "33623617"],
  ["", "", "23823603", "", ""],
  ["", "", "", "", ""]
];

// Каникулы (A15:G16)
const HARDCODED_HOLIDAYS = [
  { start: new Date(2026, 1, 23), end: new Date(2026, 1, 27) }, // 23.02 - 27.02
  { start: new Date(2026, 2, 30), end: new Date(2026, 3, 3) }   // 30.03 - 03.04
];

// Галочки настроек профильных групп (1-6)
const HARDCODED_SETTINGS = [true, true, true, true, true, true]; 

// ============================================================================

export default function App() {
  const [user, setUser] = useState<{ name?: string; given_name?: string } | null>(null);
  const [lessons, setLessons] = useState<MissedLesson[]>([]);
  const [token, setToken] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(Date.now()); // Январь 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const minDate = new Date(2026, 0, 2);  // 2 января
  const maxDate = new Date(2026, 4, 23); // 23 мая

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
          const typedSubjectsDict = subjectsDict as Record<string, { name: string; id: number; q: number }>;
          Object.values(typedSubjectsDict).forEach((subj) => {
            for (let i = 0; i < subj.q; i++) {
              parsedLessons.push({
                id: `${subj.id}_${dateString}_${i}`,
                date: dateString,
                subject: subj.name,
                subject_id: String(subj.id)
              });
            }
          });
        });

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
      console.warn("Local Storage can't be accessed!", e);
    }
    
    setIsSettingsOpen(false);
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 3000);
  };

  const nextMonth = () => {
    const next = addMonths(currentMonth, 1);
    if (next <= maxDate) setCurrentMonth(next);
  };

  const prevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    setCurrentMonth(prev);
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

    const weeksTotalMain = countWorkWeeks(mainDate, maxDate);
    const weeksTotalEarly = countWorkWeeks(earlyDate, maxDate);
    const weeksPassedMain = countWorkWeeks(mainDate, now);
    const weeksPassedEarly = countWorkWeeks(earlyDate, now);

    const missedStats: Record<string, number> = {};
    lessons.forEach((l) => {
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
  }, [lessons]);

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
        }
      ]
    });

    driverObj.drive();
  };

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('has_seen_tour');
    
    if (token && !hasSeenTour) {
      setTimeout(() => {
        startTour();
        localStorage.setItem('has_seen_tour', 'true');
      }, 500); 
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div id="tour-calendar">
              <CalendarWidget 
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                lessons={lessons}
                minDate={minDate}
                maxDate={maxDate}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
                onSelectDate={setSelectedDate}
              />
            </div>
            <div id="tour-distribution">
              {distributionData.length > 0 && <DistributionWidget data={distributionData} />}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 md:space-y-8">
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
          </div>

        </div>
      </div>

      {/* Overlays */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        currentToken={token}
        onClose={() => setIsSettingsOpen(false)} 
        onSave={saveToken} 
      />
      <LoadingOverlay isLoading={isLoading} />
      <WelcomeOverlay show={user ? showWelcome : false} name={user?.given_name} />
    </div>
  );
}