
import React, { useState, useEffect, useRef } from 'react';
import { generateInvestmentAdvice, getMarketData } from '../services/geminiService';
import { InvestmentAdvice, Language, InvestmentOption, MarketData, UserSkills, SavedInvestmentPlan, ProjectionData } from '../types';
import { locales } from '../locales';
import Chart from 'chart.js';
import InvestmentTutorial from './InvestmentTutorial';

interface InvestmentGuideProps {
  lang: Language;
  isOnline: boolean;
}

const InvestmentGuide: React.FC<InvestmentGuideProps> = ({ lang, isOnline }) => {
  const t = locales[lang];
  const [capital, setCapital] = useState("");
  const [assets, setAssets] = useState<Partial<UserSkills>>({
    hasBike: false,
    hasCar: false,
    hasTuktuk: false
  });
  const [advice, setAdvice] = useState<InvestmentAdvice | null>(null);
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<InvestmentOption | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [watchlist, setWatchlist] = useState<InvestmentOption[]>([]);
  
  const [savedPlans, setSavedPlans] = useState<SavedInvestmentPlan[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const investLoadingSteps = [
    lang === 'lo' ? 'ກຳລັງວິເຄາະເງິນທຶນຂອງທ່ານ...' : 'Analyzing your capital...',
    lang === 'lo' ? 'ກຳລັງກວດສອບຈຸດຄຸ້ມທຶນທີ່ເປັນຈິງ...' : 'Calculating real break-even point...',
    lang === 'lo' ? 'ກຳລັງຊອກຫາແຫຼ່ງຊື້ສິນຄ້າລາຄາຖືກ...' : 'Finding cheapest suppliers...',
    lang === 'lo' ? 'ກຳລັງປະເມີນຄວາມສ່ຽງທີ່ຈະເຈັ່ງ...' : 'Assessing failure risks...',
    lang === 'lo' ? 'ກຳລັງສ້າງແຜນງານປະຈຳວັນ...' : 'Creating daily operational plan...'
  ];

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < investLoadingSteps.length - 1 ? prev + 1 : prev));
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading, investLoadingSteps.length]);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('investment_tutorial_seen_v1');
    if (!tutorialSeen) setShowTutorial(true);
    
    const savedHistory = localStorage.getItem('lao_invest_history_v1');
    if (savedHistory) {
      try {
        setSavedPlans(JSON.parse(savedHistory));
      } catch(e) { console.error("History parse error", e); }
    }

    const fetchMarket = async () => {
      if (!isOnline) return;
      setLoadingMarket(true);
      setMarketError(null);
      try {
        const data = await getMarketData(lang);
        setMarket(data);
      } catch (e: any) {
        console.error("Failed to fetch market data", e);
        setMarketError(lang === 'lo' ? 'ບໍ່ສາມາດອັບເດດຂໍ້ມູນຕະຫຼາດໄດ້ (Quota Exceeded)' : 'Cannot update market data (Quota Exceeded)');
      } finally {
        setLoadingMarket(false);
      }
    };
    fetchMarket();
  }, [lang, isOnline]);

  useEffect(() => {
    if (market && market.history && chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: market.history.map(p => p.date),
          datasets: [
            { label: 'USD / LAK', data: market.history.map(p => p.usd), borderColor: '#3b82f6', tension: 0.3, yAxisID: 'yFX' },
            { label: t.goldPrice, data: market.history.map(p => p.gold), borderColor: '#f59e0b', tension: 0.3, yAxisID: 'yGold' }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { yFX: { position: 'left' }, yGold: { position: 'right' } } }
      });
    }
  }, [market, t.goldPrice]);

  const handleSearch = async () => {
    const amountStr = capital.replace(/,/g, '');
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount < 10000) {
      alert(t.minInvestAlert);
      return;
    }
    setLoading(true);
    setAdvice(null);
    setShowHistory(false);
    try {
      const res = await generateInvestmentAdvice(amount, lang, assets as UserSkills);
      setAdvice(res);
    } catch (e) {
      console.error(e);
      alert(t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = () => {
    if (!advice) return;
    const amountStr = capital.replace(/,/g, '');
    const amount = parseInt(amountStr);

    const newPlan: SavedInvestmentPlan = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      capitalAmount: amount,
      advice: advice,
      title: advice.options?.[0]?.name || "Investment Plan"
    };

    const updated = [newPlan, ...savedPlans];
    setSavedPlans(updated);
    localStorage.setItem('lao_invest_history_v1', JSON.stringify(updated));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleDeletePlan = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this plan?")) return;
    const updated = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updated);
    localStorage.setItem('lao_invest_history_v1', JSON.stringify(updated));
  };

  const handleLoadPlan = (plan: SavedInvestmentPlan) => {
    setAdvice(plan.advice);
    setCapital((plan.capitalAmount || 0).toLocaleString());
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSafeCapitalDisplay = () => {
    if (!capital) return "";
    const num = parseInt(capital.replace(/,/g, ''));
    if (isNaN(num)) return capital;
    return num.toLocaleString();
  };

  const renderProjection = (proj: ProjectionData, title: string) => (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
      <div className="flex justify-between items-center">
        <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{title} ({proj.timeframe})</h5>
        <span className="text-[9px] font-black text-slate-400">{proj.riskLevel} Risk</span>
      </div>
      <div>
        <div className="flex justify-between items-end mb-1">
          <p className="text-[9px] font-black text-slate-400 uppercase">{t.successChance}</p>
          <p className="text-xs font-black text-green-600">{proj.successProbability}%</p>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${proj.successProbability}%` }}></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[8px] font-black text-slate-400 uppercase">Return</p>
          <p className="text-sm font-black text-slate-800">{proj.expectedReturn}</p>
        </div>
        <div>
          <p className="text-[8px] font-black text-red-400 uppercase">{lang === 'lo' ? 'ໂອກາດເສຍ' : 'Loss Potential'}</p>
          <p className="text-sm font-black text-red-600">{proj.potentialLoss}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {showTutorial && <InvestmentTutorial lang={lang} onClose={() => setShowTutorial(false)} />}

      {/* MACRO ECONOMIC DASHBOARD */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <i className="fas fa-chart-pie"></i>
            </div>
            {lang === 'lo' ? 'ວິເຄາະສະພາບຕະຫຼາດ & ຄວາມເໝາະສົມ' : 'Market Feasibility Dashboard'}
          </h2>
          {loadingMarket ? (
            <i className="fas fa-circle-notch animate-spin text-blue-400"></i>
          ) : marketError ? (
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded">Offline/Stale</span>
          ) : null}
        </div>
        
        {market ? (
          <div className="p-6 space-y-8">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">USD/LAK</p>
                  <p className="text-lg font-black text-slate-800">{market.exchangeRates?.USD_LAK || 'N/A'}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-[9px] font-black text-amber-600 mb-1 uppercase tracking-widest">{t.goldPrice}</p>
                  <p className="text-lg font-black text-amber-900">{market.indicators?.goldPrice || 'N/A'}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[9px] font-black text-indigo-600 mb-1 uppercase tracking-widest">{lang === 'lo' ? 'ລາຄານ້ຳມັນ' : 'Fuel Price'}</p>
                  <p className="text-sm font-black text-indigo-900">{market.fuelPrices?.regular || 'N/A'}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-[9px] font-black text-red-600 mb-1 uppercase tracking-widest">{t.inflation}</p>
                  <p className="text-lg font-black text-red-900">{market.indicators?.inflationRate || 'N/A'}</p>
                </div>
             </div>

             <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[24px] p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                   <i className="fas fa-lightbulb text-[80px]"></i>
                </div>
                <h3 className="text-sm font-black text-blue-300 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                  <i className="fas fa-robot"></i> {lang === 'lo' ? 'AI ວິເຄາະຄວາມເໝາະສົມທຸລະກິດ (ມື້ນີ້)' : 'AI Business Suitability Analysis'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                   <div className="space-y-2">
                      <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest bg-green-900/30 px-2 py-1 rounded inline-block">
                         <i className="fas fa-check-circle"></i> {lang === 'lo' ? 'ຄວນເຮັດ' : 'Best For'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {market.businessSuitability?.bestFor?.map((biz, i) => (
                           <span key={i} className="px-3 py-1 bg-green-500/20 text-green-200 rounded-lg text-xs font-bold border border-green-500/30">
                              {biz}
                           </span>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-900/30 px-2 py-1 rounded inline-block">
                         <i className="fas fa-triangle-exclamation"></i> {lang === 'lo' ? 'ຄວາມສ່ຽງສູງ' : 'High Risk'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {market.businessSuitability?.riskyFor?.map((biz, i) => (
                           <span key={i} className="px-3 py-1 bg-red-500/20 text-red-200 rounded-lg text-xs font-bold border border-red-500/30">
                              {biz}
                           </span>
                        ))}
                      </div>
                   </div>
                </div>
                <p className="mt-4 text-xs text-slate-300 italic border-l-2 border-blue-500 pl-3">
                   "{market.businessSuitability?.reasoning}"
                </p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-3">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                     {lang === 'lo' ? 'ທ່າອ່ຽງແຕ່ລະຂະແໜງການ' : 'Sector Trends'}
                   </h3>
                   {market.sectorTrends?.map((sector, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs ${sector.trend === 'up' ? 'bg-green-500' : (sector.trend === 'down' ? 'bg-red-500' : 'bg-slate-400')}`}>
                               <i className={`fas ${sector.trend === 'up' ? 'fa-arrow-trend-up' : (sector.trend === 'down' ? 'fa-arrow-trend-down' : 'fa-minus')}`}></i>
                            </div>
                            <div>
                               <p className="text-xs font-bold text-slate-800">{sector.name}</p>
                               <p className="text-[9px] text-slate-400 line-clamp-1">{sector.insight}</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
                <div className="lg:col-span-2 h-[200px] bg-slate-50 rounded-2xl p-4 border border-slate-100">
                   <canvas ref={chartRef}></canvas>
                </div>
             </div>
          </div>
        ) : (
           <div className="py-12 text-center text-slate-300 italic flex flex-col items-center gap-2">
             <i className="fas fa-chart-line text-2xl animate-pulse"></i>
             <p>{marketError || t.loading}</p>
           </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
               <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
                 <i className="fas fa-rocket text-xl"></i>
               </div>
               {t.investTitle}
            </h2>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showHistory ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
               <i className={`fas ${showHistory ? 'fa-times' : 'fa-clock-rotate-left'}`}></i> {t.viewHistory}
            </button>
          </div>

          {showHistory ? (
            <div className="animate-fadeIn space-y-4 mb-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.savedPlansTitle}</h3>
              {savedPlans.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {savedPlans.map((plan) => (
                     <div key={plan.id} className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-blue-300 hover:shadow-md transition cursor-pointer flex justify-between items-center group" onClick={() => handleLoadPlan(plan)}>
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-lg">
                              {plan.capitalAmount > 10000000 ? '$$' : '$'}
                           </div>
                           <div>
                              <p className="font-bold text-slate-800">{plan.title}</p>
                              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                 <span><i className="far fa-calendar"></i> {new Date(plan.timestamp).toLocaleDateString()}</span>
                                 <span><i className="fas fa-coins"></i> {plan.capitalAmount?.toLocaleString()} {t.amountKip}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={(e) => handleDeletePlan(e, plan.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition">
                              <i className="fas fa-trash"></i>
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-400 italic">
                   {t.noSavedPlans}
                </div>
              )}
              <div className="pt-4 border-t border-slate-100">
                <button onClick={() => setShowHistory(false)} className="text-sm font-bold text-slate-500 hover:text-slate-800">
                  <i className="fas fa-arrow-left mr-2"></i> {t.backToInvest}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  inputMode="numeric" 
                  value={getSafeCapitalDisplay()} 
                  onChange={(e) => setCapital(e.target.value.replace(/[^0-9]/g, ''))} 
                  placeholder="5,000,000" 
                  className="flex-1 p-6 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-green-500/10 font-mono text-2xl" 
                />
                <button 
                  onClick={handleSearch} 
                  disabled={loading || !capital || !isOnline} 
                  className="bg-green-600 text-white px-10 py-6 rounded-2xl font-black text-lg hover:bg-green-700 active:scale-95 transition-all shadow-xl shadow-green-200"
                >
                  {loading ? <i className="fas fa-circle-notch animate-spin"></i> : t.btnAnalyze}
                </button>
              </div>
              
              {loading && (
                <div className="mt-8 flex flex-col items-center gap-3 animate-fadeIn">
                   <div className="flex gap-2">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= loadingStep ? 'bg-green-500 scale-125' : 'bg-slate-200'}`}></div>
                      ))}
                   </div>
                   <p className="text-sm font-black text-green-600 uppercase tracking-widest">{investLoadingSteps[loadingStep]}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {advice && advice.options && !showHistory && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.capitalInvested}</p>
                <p className="text-xl font-black text-slate-900 font-mono">{advice.capital?.toLocaleString()} {t.amountKip}</p>
             </div>
             <button 
               onClick={handleSavePlan}
               disabled={justSaved}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${justSaved ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
             >
                <i className={`fas ${justSaved ? 'fa-check' : 'fa-floppy-disk'}`}></i> {justSaved ? t.saveSuccess : t.savePlan}
             </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {advice.options?.map((opt, i) => (
              <div key={i} onClick={() => setSelectedOption(opt)} className="bg-white p-6 rounded-[32px] border border-slate-100 cursor-pointer hover:border-green-300 hover:shadow-2xl transition-all duration-500 group relative flex flex-col">
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-200">
                   {i + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight">{opt.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 mb-6 leading-relaxed italic">"{opt.description}"</p>
                
                <div className="flex items-center gap-2 mb-4">
                   <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                     <i className="fas fa-clock"></i> {opt.breakEvenPoint || 'N/A'}
                   </span>
                </div>

                <div className="mt-auto bg-green-50 p-3 rounded-2xl border border-green-100 flex justify-between items-center">
                  <span className="text-[8px] font-black text-green-600 uppercase">Net Profit</span>
                  <span className="text-xs font-black text-green-700 font-mono">{opt.financialBreakdown ? opt.financialBreakdown.netDailyProfit : 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedOption && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md" onClick={() => setSelectedOption(null)}>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[98vh] animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="bg-indigo-600 p-8 text-white relative">
              <div className="flex justify-between items-start relative z-10">
                 <div>
                    <span className="bg-yellow-400 text-slate-900 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">Business Blueprint</span>
                    <h3 className="text-3xl font-black tracking-tight mt-2">{selectedOption.name}</h3>
                 </div>
                 <button onClick={() => setSelectedOption(null)} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center border border-white/10">
                    <i className="fas fa-times text-xl"></i>
                 </button>
              </div>
            </div>
            <div className="p-8 overflow-y-auto space-y-12 scrollbar-hide">
              
              <section className="bg-slate-900 p-8 rounded-[32px] text-white border border-white/5">
                 <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <i className="fas fa-hourglass-start"></i> {t.timelineProjections}
                 </h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {selectedOption.shortTermProjection && renderProjection(selectedOption.shortTermProjection, t.shortTerm)}
                   {selectedOption.longTermProjection && renderProjection(selectedOption.longTermProjection, t.longTerm)}
                 </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <section className="bg-slate-50 p-8 rounded-[32px] border border-slate-200">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <i className="fas fa-stopwatch"></i> {lang === 'lo' ? 'ຈຸດຄຸ້ມທຶນ' : 'Break-Even Point'}
                    </h4>
                    <p className="text-4xl font-black text-slate-800 mb-2 leading-none">{selectedOption.breakEvenPoint || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{lang === 'lo' ? 'ໄລຍະເວລາຄືນທຶນ' : 'Time to recover capital'}</p>
                 </section>

                 <section className="bg-red-50 p-8 rounded-[32px] border border-red-100">
                    <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <i className="fas fa-triangle-exclamation"></i> {t.potentialLossLabel}
                    </h4>
                    <p className="text-sm font-bold text-red-800 leading-relaxed italic">"{selectedOption.failureRisk || 'Standard market risk'}"</p>
                 </section>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <i className="fas fa-map-location-dot text-blue-500"></i> {t.exactLocationsTitle}
                      </h4>
                      <div className="space-y-3">
                          {selectedOption.exactLocations?.map((loc, idx) => (
                              <div key={idx} className="flex gap-3 items-start p-3 bg-blue-50 rounded-2xl border border-blue-100">
                                  <i className="fas fa-map-pin text-blue-500 mt-1"></i>
                                  <span className="text-sm font-bold text-blue-900">{loc}</span>
                              </div>
                          ))}
                      </div>
                  </section>

                  <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <i className="fas fa-cart-shopping text-green-500"></i> {t.shoppingListTitle}
                      </h4>
                      <div className="space-y-3">
                          {selectedOption.shoppingList?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0">
                                  <div>
                                      <p className="text-xs font-bold text-slate-800">{item.item}</p>
                                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                          <i className="fas fa-store"></i> {item.source}
                                      </p>
                                  </div>
                                  <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                      {item.estCost}
                                  </span>
                              </div>
                          ))}
                      </div>
                  </section>
              </div>
              
              <section className="bg-amber-50 p-8 rounded-[32px] border border-amber-100">
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <i className="fas fa-clipboard-check"></i> {t.marketVerificationTitle}
                  </h4>
                  <p className="text-sm font-bold text-amber-900 italic">"{selectedOption.marketVerification}"</p>
              </section>

              <section className="bg-slate-50 p-8 rounded-[40px] border border-slate-200">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <i className="fas fa-calendar-day text-indigo-500"></i> {lang === 'lo' ? 'ຕາຕະລາງຊີວິດຈິງ (1 ມື້)' : 'Daily Operations'}
                 </h4>
                 <div className="space-y-4">
                    {selectedOption.dailyTasks?.map((task, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                         <div className="w-16 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xs font-black text-indigo-600 shrink-0">
                            {task.time}
                         </div>
                         <p className="text-sm font-bold text-slate-700">{task.activity}</p>
                      </div>
                    ))}
                 </div>
              </section>

              <section className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Real Result Breakdown</h4>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                       <span className="text-xs font-bold text-slate-500">{t.grossRevenue}</span>
                       <span className="font-mono font-bold">{selectedOption.financialBreakdown?.estDailyRevenue || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-2xl border border-red-100">
                       <span className="text-xs font-bold text-red-500">{t.operationCost}</span>
                       <span className="font-mono font-bold text-red-600">-{selectedOption.financialBreakdown?.estDailyCost || '0'}</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                       <p className="text-green-600 font-black text-lg">Net Profit</p>
                       <p className="text-3xl font-black font-mono text-green-600">{selectedOption.financialBreakdown?.netDailyProfit || '0'}</p>
                    </div>
                 </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <section className="bg-white p-8 rounded-[40px] border border-slate-200">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t.masteryRoadmapTitle}</h4>
                    <div className="space-y-6">
                       {selectedOption.masteryRoadmap?.map((roadmap, idx) => (
                         <div key={idx} className="flex gap-4">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">{idx+1}</span>
                            <div>
                               <p className="text-xs font-black text-indigo-600 uppercase mb-1">{roadmap.phase}</p>
                               <ul className="text-xs text-slate-600 space-y-1">
                                  {roadmap.actions?.map((a, i) => <li key={i}>• {a}</li>)}
                               </ul>
                            </div>
                         </div>
                       ))}
                    </div>
                 </section>
                 
                 <section className="space-y-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.closingTechniqueLabel}</h4>
                       <p className="text-sm font-bold text-slate-800 italic">"{selectedOption.closingTechnique}"</p>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.competitiveMoatLabel}</h4>
                       <p className="text-sm font-bold text-slate-800 italic">"{selectedOption.competitiveMoat}"</p>
                    </div>
                 </section>
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-200">
              <button onClick={() => setSelectedOption(null)} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black shadow-xl uppercase tracking-widest active:scale-95 transition-all">
                {t.btnGotIt}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentGuide;
