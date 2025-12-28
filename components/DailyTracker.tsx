
import React, { useState, useEffect, useMemo } from 'react';
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
  
  // Motivational Quotes System
  const quotes = useMemo(() => ({
    lo: [
      "ຄວາມພະຍາຍາມຢູ່ບ່ອນໃດ, ຄວາມສຳເລັດຢູ່ບ່ອນນັ້ນ.",
      "ເງິນຄຳບໍ່ແມ່ນຂອງຫາໄດ້ງ່າຍ ແຕ່ຖ້າສູ້ກໍບໍ່ໄກເກີນເອື້ອມ.",
      "ເລີ່ມຕົ້ນມື້ນີ້ ເພື່ອອະນາຄົດທີ່ດີກວ່າ.",
      "ຄວາມຈົນບໍ່ແມ່ນກຳມະພັນ ແຕ່ຄວາມຂີ້ຄ້ານແມ່ນຕົ້ນເຫດຂອງຄວາມທຸກ.",
      "ຢຸດຈົ່ມ ແລ້ວລົງມືເຮັດ.",
      "ທຸກໆກີບທີ່ຫາໄດ້ ຄືຄວາມພາກພູມໃຈຂອງເຮົາ.",
      "ຢ່າຖ້າໂຊກຊະຕາ ເພາະເຮົາເປັນຄົນກຳນົດເອງ."
    ],
    th: [
      "ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น",
      "เงินทองไม่ใช่ของหาง่าย แต่ถ้าสู้ก็ไม่ไกลเกินเอื้อม",
      "เริ่มต้นวันนี้ เพื่ออนาคตที่ดีกว่า",
      "ความจนไม่ใช่กรรมพันธุ์ แต่ความขี้เกียจคือบ่อเกิดแห่งความทุกข์",
      "หยุดบ่น แล้วลงมือทำ",
      "ทุกบาทที่หาได้ คือความภาคภูมิใจของเรา",
      "อย่ารอโชคชะตา เพราะเราเป็นคนกำหนดเอง"
    ],
    en: [
      "Where there is effort, there is success.",
      "Success is not final; failure is not fatal: It is the courage to continue that counts.",
      "Start today for a better future.",
      "Poverty is not genetic, but laziness is a choice.",
      "Stop complaining and start doing.",
      "Every cent earned is a step towards your dream.",
      "Don't wait for luck, create your own destiny."
    ]
  }), []);

  const [activeQuote, setActiveQuote] = useState("");

  useEffect(() => {
    const qList = quotes[lang] || quotes.en;
    setActiveQuote(qList[Math.floor(Math.random() * qList.length)]);
    
    const saved = localStorage.getItem('lao_income_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        // Calculate today's earnings from history
        const today = new Date().toLocaleDateString();
        const todayTotal = parsed
          .filter((entry: any) => entry.date === today)
          .reduce((acc: number, curr: any) => acc + curr.amount, 0);
        setEarnings(todayTotal);
      } catch (e) {
        console.error("History parse error", e);
      }
    }
  }, [lang, quotes]);

  const addEarning = () => {
    const amount = parseInt(inputValue);
    if (isNaN(amount) || amount <= 0) return;

    const today = new Date().toLocaleDateString();
    const newEntry = { date: today, amount };
    const newHistory = [newEntry, ...history].slice(0, 15);
    
    setHistory(newHistory);
    localStorage.setItem('lao_income_history', JSON.stringify(newHistory));
    setEarnings(prev => prev + amount);
    setInputValue("");
    
    // Switch quote on every addition for extra motivation
    const qList = quotes[lang] || quotes.en;
    setActiveQuote(qList[Math.floor(Math.random() * qList.length)]);
  };

  const progress = Math.min((earnings / target) * 100, 100);

  const getEncouragement = () => {
    if (progress === 0) return lang === 'lo' ? "ເລີ່ມຕົ້ນເລີຍ ທ່ານເຮັດໄດ້!" : "Let's start, you can do it!";
    if (progress < 30) return lang === 'lo' ? "ກ້າວທຳອິດສຳຄັນທີ່ສຸດ ສູ້ຕໍ່ໄປ!" : "First step is key, keep going!";
    if (progress < 70) return lang === 'lo' ? "ມາໄດ້ເຄິ່ງທາງແລ້ວ ອີກນິດດຽວ!" : "Halfway there, almost there!";
    if (progress < 100) return lang === 'lo' ? "ໃກ້ຈະຮອດເປົ້າໝາຍແລ້ວ ເລັ່ງມືອີກ!" : "Target in sight, push harder!";
    return lang === 'lo' ? "ສຸດຍອດ! ທ່ານເຮັດສຳເລັດແລ້ວ!" : "Amazing! You reached your goal!";
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Motivation Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <i className="fas fa-fire-flame-curved text-[140px]"></i>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner animate-pulse">
            <i className="fas fa-bolt text-yellow-300"></i>
          </div>
          <h2 className="text-xl font-black uppercase tracking-[0.2em] mb-4 opacity-80">{lang === 'lo' ? 'ພະລັງໃຈໃນມື້ນີ້' : 'Today\'s Power'}</h2>
          <p className="text-2xl font-black leading-relaxed italic max-w-md mx-auto">
            "{activeQuote}"
          </p>
        </div>
      </div>

      {/* Main Tracker Card */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
           <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex flex-col items-center mt-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.targetToday}</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-black text-slate-900 font-mono tracking-tighter">{earnings?.toLocaleString() || '0'}</span>
            <span className="text-xl font-bold text-slate-400">/ {target?.toLocaleString() || '0'}</span>
            <span className="text-sm font-black text-blue-600 uppercase ml-2">{t.amountKip}</span>
          </div>
          
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 shadow-sm border ${progress >= 100 ? 'bg-green-100 text-green-600 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
            <i className={`fas ${progress >= 100 ? 'fa-medal' : 'fa-chart-line'} mr-2`}></i>
            {getEncouragement()}
          </div>

          {/* Circular Progress (Visual only for aesthetic) */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-10">
             <svg className="w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-blue-600" strokeDasharray={553} strokeDashoffset={553 - (553 * progress) / 100} strokeLinecap="round" />
             </svg>
             <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-slate-900">{Math.round(progress)}%</span>
                <span className="text-[9px] font-black text-slate-400 uppercase">Completed</span>
             </div>
          </div>

          <div className="w-full max-w-md space-y-4">
            <div className="relative">
              <input 
                type="number" 
                inputMode="numeric"
                placeholder={t.inputAmount}
                className="w-full p-6 border-2 border-slate-100 rounded-[24px] bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-xl text-center"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xs uppercase">Kip</div>
            </div>
            <button 
              onClick={addEarning}
              disabled={!inputValue}
              className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <i className="fas fa-plus-circle"></i> {t.btnSave}
            </button>
          </div>
        </div>
      </div>

      {/* Motivational Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-2xl">
               <i className="fas fa-calendar-check"></i>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{lang === 'lo' ? 'ວັນທີ່ຫາເງິນໄດ້' : 'Active Days'}</p>
               <p className="text-xl font-black text-slate-800">{new Set(history.map(h => h.date)).size} {lang === 'lo' ? 'ມື້' : 'Days'}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center text-2xl">
               <i className="fas fa-sack-dollar"></i>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{lang === 'lo' ? 'ລາຍໄດ້ສະສົມ' : 'Total Earnings'}</p>
               <p className="text-xl font-black text-slate-800">{history.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} {t.amountKip}</p>
            </div>
         </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">{t.history7_Days}</h3>
           <div className="w-8 h-8 bg-slate-50 text-slate-300 rounded-lg flex items-center justify-center">
              <i className="fas fa-clock-rotate-left text-xs"></i>
           </div>
        </div>
        {history.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center text-xs font-black group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                      {i + 1}
                   </div>
                   <div>
                      <span className="text-sm font-bold text-slate-700 block">{h.date}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase">Daily Record</span>
                   </div>
                </div>
                <div className="text-right">
                   <span className="font-black text-green-600 font-mono text-lg">+{h.amount?.toLocaleString() || '0'}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">{t.amountKip}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto">
                <i className="fas fa-database text-2xl"></i>
             </div>
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">
               {t.noData}
             </p>
          </div>
        )}
      </div>

      <div className="text-center">
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Consistency is the key to wealth</p>
      </div>
    </div>
  );
};

export default DailyTracker;
