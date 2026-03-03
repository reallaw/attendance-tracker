import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';

export function TokenAlert() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-center gap-4 text-amber-800"
    >
      <AlertCircle className="shrink-0" />
      <div>
        <p className="font-semibold">Токен не установлен</p>
        <p className="text-sm opacity-80">Пожалуйста, добавьте ваш API токен в настройках для загрузки данных с сервера. <a className="text-indigo-600" target="_blank" href="https://school.mos.ru/?backUrl=https%3A%2F%2Fschool.mos.ru%2Fv2%2Ftoken%2Frefresh">Получить токен &rarr;</a></p>
      </div>
    </motion.div>
  );
}