import React from 'react';

interface SubjectCount {
  name: string;
  count: number;
}

interface TopMissedProps {
  subjects: SubjectCount[];
}

export function TopMissed({ subjects }: TopMissedProps) {
  return (
    <section className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200">
      <h2 className="text-lg md:text-xl font-semibold mb-6">Топ пропусков</h2>
      <div className="space-y-5">
        {subjects.slice(0, 3).map((s, i) => (
          <div key={s.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-mono text-[10px]">0{i + 1}</span>
              <span className="text-sm font-medium">{s.name}</span>
            </div>
            <span className="bg-white/10 px-2 py-1 rounded-lg text-[10px] font-bold">{s.count}</span>
          </div>
        ))}
        {subjects.length === 0 && (
          <p className="text-slate-500 text-sm italic">Данные отсутствуют</p>
        )}
      </div>
    </section>
  );
}