
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { locales } from '../locales';

interface DailyTrackerProps {
  target: number;
  lang: Language;
}

const DailyTracker: React.FC<DailyTrackerProps> = ({ target, lang }) => {
  const t = locales[lang];
  const [earnings, setEarnings] = useState<number>(0);
  const [history, setHistory] = useState<{ date: string; amount: number }[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('lao_income_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addEarning = () => {
    const amount = parseInt(inputValue);
    if (isNaN(amount) || amount <= 0) return;

    const today = new Date().toLocaleDateString();
    const newEntry = { date: today, amount };
    const newHistory = [newEntry, ...history].slice(0, 7);
    
    setHistory(newHistory);
    localStorage.setItem('lao_income_history', JSON.stringify(newHistory));
    setEarnings(prev => prev + amount);
    setInputValue("");
  };

  const progress = Math.min((earnings / target) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{t.targetToday}</h2>
        <div className="text-4xl font-black text-slate-900 mb-6 font-mono">
          {earnings.toLocaleString()} / <span className="text-blue-600">{target.toLocaleString()}</span> <span className="text-lg">{t.amountKip}</span>
        </div>
        
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex gap-2 max-w-sm mx-auto">
          <input 
            type="number" 
            placeholder={t.inputAmount}
            className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button 
            onClick={addEarning}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-200"
          >
            {t.btnSave}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 mb-4">{t.history7Days}</h3>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-500">{h.date}</span>
                <span className="font-bold text-slate-800 font-mono">+{h.amount.toLocaleString()} {t.amountKip}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 italic">
            {t.noData}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTracker;
