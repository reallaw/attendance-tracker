import React from 'react';

interface UpdateOverlayProps {
  show: boolean;
  onClose: () => void;
  version: string;
  updates: string[];
}

export function UpdateOverlay({ show, onClose, version, updates }: UpdateOverlayProps) {
  // Ранний возврат: если show === false, вообще ничего не рендерим
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
      {/* Затемненный фон — клик по нему закрывает модалку */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Сама модалка (без onClick, чтобы клики внутри нее ничего не закрывали) */}
      <div className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden">
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold mb-4">
            ОБНОВЛЕНИЕ {version}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Что нового?</h2>
        </div>

        <div className="space-y-4 mb-8">
          {updates.map((text, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-3 text-left"
            >
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <p className="text-slate-600 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Добавили обработчик на кнопку */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 text-white rounded-2xl font-semibold shadow-lg shadow-slate-200 transition-colors hover:bg-slate-800"
        >
          Это приятно знать, но тем не менее
        </button>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
          <div className="h-full bg-indigo-600" />
        </div>
      </div>
    </div>
  );
}