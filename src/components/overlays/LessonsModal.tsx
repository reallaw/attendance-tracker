import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';

interface SubjectVariant {
  id: string;
  group: string;
  cabinet: string;
}

interface LessonsModalProps {
  isOpen: boolean;
  data: Record<string, SubjectVariant[]>; 
  onClose: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1],
    },
  }),
};

export function LessonsModal({ isOpen, data, onClose }: LessonsModalProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const steps = Object.entries(data);
  const totalSteps = steps.length;
  const isFinished = currentStep >= totalSteps;

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('selected_lessons');
      if (saved) setSelections(JSON.parse(saved));
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleSelect = (subjectName: string, id: string) => {
    const newSelections = { ...selections, [subjectName]: id };
    setSelections(newSelections);
    localStorage.setItem('selected_lessons', JSON.stringify(newSelections));

    setDirection(1);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 250);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="flex items-start justify-between mb-8 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Настройки</h2>
                {!isFinished && (
                  <p className="block text-xs font-medium text-slate-400 mb-1">Вопрос {currentStep + 1} из {totalSteps}</p>
                )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <AnimatePresence mode="wait" custom={direction}>
              {isFinished ? (
                <motion.div
                  key="finished"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="text-center"
                >
                  <CheckCircle2 size={56} className="text-emerald-500 mx-auto stroke-[1.5] mb-2" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Настройки сохранены!</h3>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    Ваше расписание обновится в соответствии с выбранными практикумами. Вы всегда можете изменить выбор в настройках.
                  </p>
                  <button 
                    onClick={onClose}
                    className="w-full bg-slate-800 text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-slate-950 transition-colors flex items-center justify-center gap-2"
                  >
                    Перейти к расписанию <ArrowRight size={16} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={steps[currentStep][0]}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                >
                  {[steps[currentStep]].map(([name, variants]) => {
                    const isMultiGroup = variants.length > 1;
                    
                    return (
                      <div key={name} className="space-y-4">
                        <label className="block text-xs font-bold text-slate-400 uppercase text-center">
                          {"Сдаете " + name.replace('Практикум ', '') + "?"}
                        </label>
                        
                        <div className="flex flex-col gap-2.5">
                          {isMultiGroup ?
                          (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                {variants.map((v) => (
                                  <button
                                    key={v.id}
                                    onClick={() => handleSelect(name, v.id)}
                                    className={`py-4 px-3 rounded-xl border text-xs font-semibold transition-all ${
                                      selections[name] === v.id
                                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'
                                    }`}
                                  >
                                    Группа {v.group}
                                    <span className="block text-[10px] opacity-80 font-normal">каб. {v.cabinet}</span>
                                  </button>
                                ))}
                              </div>
                              
                              {/* Кнопка отказа для мульти-групп */}
                              <button
                                onClick={() => handleSelect(name, 'none')}
                                className={`w-full py-3 rounded-xl border-dash border-1 text-xs font-medium transition-all ${
                                  selections[name] === 'none'
                                    ? 'bg-red-50 text-red-600 border'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-red-400'
                                }`}
                              >
                                Не планирую посещать
                              </button>
                            </>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSelect(name, variants[0].id)}
                                className={`flex-1 py-4 rounded-xl border text-sm font-semibold transition-all ${
                                  selections[name] === variants[0].id
                                    ? 'bg-green-50 text-green-600 border hover:border-green-400'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-green-400'
                                }`}
                              >
                                Да
                              </button>
                              <button
                                onClick={() => handleSelect(name, 'none')}
                                className={`flex-1 py-4 rounded-xl border text-sm font-semibold transition-all ${
                                  selections[name] === 'none'
                                    ? 'bg-red-50 text-red-600 border hover:border-red-400'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-red-400'
                                }`}
                              >
                                Нет
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}