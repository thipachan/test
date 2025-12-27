
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { generateInvestmentAdvice, getMarketData } from '../services/geminiService';
import { InvestmentAdvice, Language, InvestmentOption, MarketData, UserSkills } from '../types';
import { locales } from '../locales';
import Chart from 'chart.js';
import InvestmentTutorial from './InvestmentTutorial';

interface InvestmentGuideProps {
  lang: Language;
}

const InvestmentGuide: React.FC<InvestmentGuideProps> = ({ lang }) => {
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
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [selectedOption, setSelectedOption] = useState<InvestmentOption | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [watchlist, setWatchlist] = useState<InvestmentOption[]>([]);

  // Calculator State
  const [calcAmount, setCalcAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("LAK");

  // Chart Ref
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // Helper to format currency values according to Lao/Locale conventions
  const formatCurrency = (value: string | number | undefined, currencyCode?: string) => {
    if (value === undefined || value === null || value === '') return '';
    
    let num: number;
    if (typeof value === 'string') {
      const cleanStr = value.replace(/[^0-9.]/g, '');
      num = parseFloat(cleanStr);
      if (isNaN(num)) return value;
    } else {
      num = value;
    }

    const formattedNum = num.toLocaleString(undefined, {
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });

    // If it's specifically LAK or unspecified (defaulting to LAK context)
    if (!currencyCode || currencyCode === 'LAK') {
      return `${formattedNum} ${t.amountKip}`;
    }

    // For other currencies in the calculator context
    return `${formattedNum} ${currencyCode}`;
  };

  useEffect(() => {
    // Load Watchlist
    const savedWatchlist = localStorage.getItem('lao_income_watchlist_v1');
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));

    // Check if tutorial has been shown for this specific page
    const tutorialSeen = localStorage.getItem('investment_tutorial_seen_v1');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }

    const fetchMarket = async () => {
      setLoadingMarket(true);
      try {
        const data = await getMarketData(lang);
        setMarket(data);
      } catch (e) {
        console.error("Failed to fetch market data", e);
      } finally {
        setLoadingMarket(false);
      }
    };
    fetchMarket();
  }, [lang]);

  const handleTutorialComplete = () => {
    localStorage.setItem('investment_tutorial_seen_v1', 'true');
    setShowTutorial(false);
  };

  const toggleWatchlist = (e: React.MouseEvent, option: InvestmentOption) => {
    e.stopPropagation();
    const isSaved = watchlist.some(item => item.name === option.name);
    let next: InvestmentOption[];
    if (isSaved) {
      next = watchlist.filter(item => item.name !== option.name);
    } else {
      next = [option, ...watchlist];
    }
    setWatchlist(next);
    localStorage.setItem('lao_income_watchlist_v1', JSON.stringify(next));
  };

  useEffect(() => {
    if (market && market.history && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const labels = market.history.map(p => p.date);
      const usdData = market.history.map(p => p.usd);
      const thbData = market.history.map(p => p.thb);
      const cnyData = market.history.map(p => p.cny);
      const goldData = market.history.map(p => p.gold);
      
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'USD / LAK',
              data: usdData,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 3,
              yAxisID: 'yFX',
            },
            {
              label: 'THB / LAK',
              data: thbData,
              borderColor: '#ef4444',
              backgroundColor: 'transparent',
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 3,
              yAxisID: 'yFX',
            },
            {
              label: 'CNY / LAK',
              data: cnyData,
              borderColor: '#10b981',
              backgroundColor: 'transparent',
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 3,
              yAxisID: 'yFX',
            },
            {
              label: t.goldPrice,
              data: goldData,
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.05)',
              borderWidth: 3,
              borderDash: [5, 5],
              tension: 0.3,
              pointRadius: 4,
              yAxisID: 'yGold',
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'bottom',
              labels: { 
                boxWidth: 12, 
                padding: 15,
                font: { size: 10, weight: 'bold' } 
              }
            },
            tooltip: {
              backgroundColor: '#1e293b',
              padding: 12,
              titleFont: { size: 10 },
              bodyFont: { size: 12, weight: 'bold' },
              callbacks: {
                label: function(context: any) {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) {
                    label += context.parsed.y.toLocaleString();
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 9 }, color: '#94a3b8' }
            },
            yFX: {
              type: 'linear',
              display: true,
              position: 'left',
              title: { display: true, text: 'Exchange Rates (LAK)', font: { size: 10, weight: 'bold' } },
              grid: { color: 'rgba(241, 245, 249, 1)' },
              ticks: { font: { size: 9 }, color: '#94a3b8' }
            },
            yGold: {
              type: 'linear',
              display: true,
              position: 'right',
              title: { display: true, text: 'Gold Price (LAK)', font: { size: 10, weight: 'bold' } },
              grid: { drawOnChartArea: false },
              ticks: { font: { size: 9 }, color: '#f59e0b' }
            }
          }
        }
      });
    }
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [market, t.goldPrice]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (rawValue.length > 12) return;
    setCapital(rawValue);
  };

  // Masked display for the input field
  const displayCapital = capital ? parseInt(capital).toLocaleString() : "";

  const handleSearch = async () => {
    const amount = parseInt(capital);
    if (isNaN(amount) || amount < 10000) {
      alert(t.minInvestAlert);
      return;
    }
    setLoading(true);
    setSelectedOption(null);
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

  // Calculator Logic
  const conversionResult = useMemo(() => {
    if (!market || !calcAmount) return null;
    const amount = parseFloat(calcAmount);
    if (isNaN(amount)) return 0;

    const rates: Record<string, number> = {
      LAK: 1,
      USD: parseFloat(market.exchangeRates.USD_LAK.replace(/[^0-9.]/g, '')),
      THB: parseFloat(market.exchangeRates.THB_LAK.replace(/[^0-9.]/g, '')),
      CNY: parseFloat(market.exchangeRates.CNY_LAK.replace(/[^0-9.]/g, ''))
    };

    if (fromCurrency === toCurrency) return amount;
    
    // Convert to LAK first then to target
    const amountInLak = amount * rates[fromCurrency];
    const finalAmount = amountInLak / rates[toCurrency];
    
    return finalAmount;
  }, [market, calcAmount, fromCurrency, toCurrency]);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {showTutorial && <InvestmentTutorial lang={lang} onClose={handleTutorialComplete} />}

      {/* Market Insights Dashboard */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-chart-line"></i>
            </div>
            {t.marketInsights}
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowTutorial(true)}
              className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center text-xs"
              title="Help"
            >
              <i className="fas fa-question-circle"></i>
            </button>
            {loadingMarket && <i className="fas fa-circle-notch animate-spin text-blue-400"></i>}
          </div>
        </div>

        {market ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* USD */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">USD / LAK</p>
                    <p className="text-lg font-black text-slate-800 font-mono">{market.exchangeRates.USD_LAK}</p>
                  </div>
                  {/* THB */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">THB / LAK</p>
                    <p className="text-lg font-black text-slate-800 font-mono">{market.exchangeRates.THB_LAK}</p>
                  </div>
                  {/* Gold */}
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">{t.goldPrice}</p>
                    <p className="text-lg font-black text-amber-900 font-mono">{market.indicators.goldPrice}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600 shadow-sm shrink-0">
                      <i className="fas fa-arrow-trend-up"></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest">{t.inflation}</p>
                      <p className="font-bold text-purple-900">{market.indicators.inflationRate}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-green-600 shadow-sm shrink-0">
                      <i className="fas fa-building-columns"></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">{t.interestRate}</p>
                      <p className="font-bold text-green-900">{market.indicators.bankInterestRate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 min-h-[350px] relative">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <i className="fas fa-chart-area text-blue-500"></i> Market Trends (Last 7 Days)
                </p>
                <div className="absolute inset-x-6 top-14 bottom-6">
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>
            </div>

            {/* Currency Converter Section */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <i className="fas fa-calculator text-[80px]"></i>
              </div>
              
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-blue-400">
                <i className="fas fa-coins"></i> {t.calculator}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t.amount}</label>
                  <input 
                    type="number"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t.convertFrom}</label>
                  <select 
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="USD" className="text-slate-900">USD</option>
                    <option value="THB" className="text-slate-900">THB</option>
                    <option value="CNY" className="text-slate-900">CNY</option>
                    <option value="LAK" className="text-slate-900">LAK</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t.convertTo}</label>
                  <select 
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="LAK" className="text-slate-900">LAK</option>
                    <option value="USD" className="text-slate-900">USD</option>
                    <option value="THB" className="text-slate-900">THB</option>
                    <option value="CNY" className="text-slate-900">CNY</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t.result}</p>
                <p className="text-2xl font-black text-green-400 font-mono">
                  {formatCurrency(conversionResult ?? 0, toCurrency)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-sm">
              <p className="font-bold text-blue-800 mb-1 flex items-center gap-2">
                <i className="fas fa-info-circle"></i> {t.marketSummary}
              </p>
              <p className="text-blue-700 leading-relaxed italic">"{market.summary}"</p>
            </div>

            {/* Verified Official Sources Section - NEW PROMINENT DESIGN */}
            {market.sources.length > 0 && (
              <div className="bg-slate-50/80 p-8 rounded-[40px] border border-slate-200/60 shadow-inner relative overflow-hidden animate-fadeIn">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                  <i className="fas fa-shield-halved text-[120px]"></i>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <i className="fas fa-building-columns"></i>
                      </div>
                      {lang === 'lo' ? 'ແຫຼ່ງຂໍ້ມູນຈາກທາງການ' : (lang === 'th' ? 'แหล่งข้อมูลอย่างเป็นทางการ' : 'Verified Official Sources')}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 ml-13">
                      {lang === 'lo' ? 'ຂໍ້ມູນທັງໝົດຖືກຢັ້ງຢືນຈາກເວັບໄຊທາງການຂອງລັດຖະບານ ແລະ ທະນາຄານ.' : 
                       (lang === 'th' ? 'ข้อมูลทั้งหมดได้รับการยืนยันจากเว็บไซต์ทางการของรัฐบาลและธนาคาร' : 
                       'All market data is cross-referenced from official government and banking websites.')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {market.sources.map((src, i) => (
                    <a 
                      key={i} 
                      href={src.uri} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 p-4 bg-white border border-slate-200/80 rounded-2xl hover:border-blue-400 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <i className="fas fa-link text-[10px]"></i>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[11px] font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                          {src.title}
                        </p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate opacity-70">
                          {src.uri}
                        </p>
                      </div>
                      <i className="fas fa-arrow-up-right-from-square text-[9px] text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"></i>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <i className="fas fa-chart-pie text-3xl mb-3 opacity-20"></i>
            <p className="text-sm italic">{t.loading}</p>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
           <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
             <i className="fas fa-sack-dollar text-xl"></i>
           </div>
           {t.investTitle}
        </h2>
        <p className="text-sm text-slate-500 mb-8">{t.investInputSub}</p>
        
        {/* Added Vehicle Assets Selection for realistic advice */}
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-md">
            {[
                { id: 'hasBike', label: t.bike, icon: 'fa-motorcycle' },
                { id: 'hasTuktuk', label: t.tuktuk, icon: 'fa-shuttle-van' },
                { id: 'hasCar', label: t.car, icon: 'fa-car' }
            ].map((v) => (
                <button
                    key={v.id}
                    onClick={() => setAssets(prev => ({ ...prev, [v.id]: !prev[v.id as keyof typeof assets] }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition ${assets[v.id as keyof typeof assets] ? 'bg-green-50 border-green-500 text-green-700 shadow-inner shadow-green-200/50' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-green-200'}`}
                >
                    <i className={`fas ${v.icon} text-lg`}></i>
                    <span className="text-[10px] font-black uppercase leading-tight">{v.label}</span>
                </button>
            ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <input
              type="text"
              inputMode="numeric"
              value={displayCapital}
              onChange={handleInputChange}
              placeholder="Ex: 5,000,000"
              className="w-full p-6 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-mono text-2xl pr-20 placeholder:text-slate-200"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
              <span className="font-black text-slate-300 text-xs tracking-widest">LAK</span>
              <span className="font-bold text-green-600/20 text-[10px] uppercase">{t.amountKip}</span>
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !capital}
            className="bg-green-600 text-white px-10 py-6 rounded-2xl font-black text-lg hover:bg-green-700 active:scale-95 transition-all disabled:bg-slate-200 disabled:text-slate-400 shadow-xl shadow-green-200 flex items-center justify-center gap-3"
          >
            {loading ? <i className="fas fa-spinner animate-spin"></i> : <><i className="fas fa-chart-line"></i> {t.btnAnalyze}</>}
          </button>
        </div>
      </div>

      {advice && advice.options && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-[32px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-lg shadow-green-900/5 border border-green-100">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1 opacity-60">{t.investInputLabel}</p>
                <p className="text-3xl font-black text-green-900 font-mono tracking-tighter">
                  {formatCurrency(advice.capital)}
                </p>
              </div>
            </div>
            <div className="h-12 w-[1px] bg-green-200/50 hidden sm:block"></div>
            <div className="text-center sm:text-right">
              <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1 opacity-60">
                {lang === 'en' ? 'OPPORTUNITIES' : (lang === 'th' ? 'โอกาสที่พบ' : 'ໂອກາດທີ່ພົບ')}
              </p>
              <p className="text-xl font-bold text-green-800">{advice.options.length} {t.option}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advice.options.map((opt, i) => {
              const isSaved = watchlist.some(item => item.name === opt.name);
              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedOption(opt)}
                  className="bg-white p-8 rounded-[32px] border border-slate-100 cursor-pointer hover:border-green-300 hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-500 group flex flex-col h-full relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <i className="fas fa-seedling text-xl"></i>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <button 
                        onClick={(e) => toggleWatchlist(e, opt)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition shadow-sm ${isSaved ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 hover:text-amber-500'}`}
                        title={isSaved ? t.removeFromWatchlist : t.addToWatchlist}
                      >
                        <i className={`fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark'}`}></i>
                      </button>
                      <span className="text-[9px] font-black px-3 py-1 bg-green-100 text-green-700 rounded-full uppercase tracking-widest">
                        {t.returnLabel}: {opt.expectedReturn}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-green-600 transition-colors leading-tight">
                    {opt.name}
                  </h3>
                  
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 leading-relaxed">
                    {opt.description}
                  </p>
                  
                  {/* Detailed Financial Summary on card */}
                  <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100 flex items-center justify-between">
                     <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.netProfit}</p>
                        <p className="text-sm font-black text-green-600 font-mono">{opt.financialBreakdown.netDailyProfit}</p>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">
                        <i className="fas fa-arrow-trend-up"></i>
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="text-left">
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-0.5">{t.timeline}</p>
                      <p className="text-sm font-bold text-slate-700">{opt.timeline}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-200 transform translate-x-3 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <i className="fas fa-arrow-right text-sm"></i>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <i className="fas fa-lightbulb text-[160px] rotate-12"></i>
            </div>
            <h4 className="font-black text-2xl mb-6 relative z-10 flex items-center gap-3 text-green-400 tracking-tight">
              <i className="fas fa-wand-magic-sparkles text-xl"></i> {t.expertAdvice}
            </h4>
            <div className="relative z-10 space-y-4">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <p className="text-slate-200 text-base italic leading-relaxed">
                  "{advice.generalAdvice}"
                </p>
              </div>
              {advice.marketSentiment && (
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs text-blue-300 flex items-center gap-3">
                  <i className="fas fa-globe-asia text-lg"></i>
                  <span>{advice.marketSentiment}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Watchlist Section */}
      {watchlist.length > 0 && (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 animate-fadeIn">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-bookmark"></i>
              </div>
              {t.watchlistTitle}
            </h2>
            <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-black">{watchlist.length}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((opt, i) => (
              <div 
                key={i}
                onClick={() => setSelectedOption(opt)}
                className="group relative bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-amber-300 hover:bg-white transition-all cursor-pointer shadow-sm hover:shadow-lg"
              >
                <button 
                  onClick={(e) => toggleWatchlist(e, opt)}
                  className="absolute top-4 right-4 text-amber-500 hover:text-red-500 transition-colors"
                  title={t.removeFromWatchlist}
                >
                  <i className="fas fa-times-circle"></i>
                </button>
                <h4 className="font-bold text-slate-900 text-sm mb-2 pr-6 group-hover:text-amber-600">{opt.name}</h4>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{opt.expectedReturn}</p>
                  <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-arrow-right text-[10px]"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedOption && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:p-0 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity" 
            onClick={() => setSelectedOption(null)}
          ></div>
          
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-xl">
                  <i className="fas fa-seedling"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">{selectedOption.name}</h3>
                  <p className="text-green-100 text-[10px] font-bold uppercase tracking-widest">{t.option}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOption(null)}
                className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
              {/* Detailed Financial Breakdown Section */}
              <div className="space-y-4">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-chart-pie text-green-500"></i> {t.realResultTitle}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-600">{t.grossRevenue}</span>
                      <span className="text-sm font-black text-slate-900 font-mono">{selectedOption.financialBreakdown.estDailyRevenue}</span>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-600">{t.operationCost}</span>
                      <span className="text-sm font-black text-red-600 font-mono">{selectedOption.financialBreakdown.estDailyCost}</span>
                   </div>
                   <div className="bg-green-600 p-5 rounded-2xl shadow-lg shadow-green-100 flex justify-between items-center">
                      <span className="text-xs font-black text-white uppercase">{t.netProfit}</span>
                      <span className="text-lg font-black text-white font-mono">{selectedOption.financialBreakdown.netDailyProfit}</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1 opacity-70">{t.returnLabel}</p>
                  <p className="text-base font-bold text-green-800">{selectedOption.expectedReturn}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 opacity-70">{t.riskLabel}</p>
                  <p className="text-base font-bold text-orange-800">{selectedOption.riskLevel}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-info-circle text-green-500"></i> {lang === 'lo' ? 'ລາຍລະອຽດ' : (lang === 'th' ? 'รายละเอียด' : 'Description')}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                  {selectedOption.description}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-list-ol text-green-500"></i> {t.startupSteps}
                </h4>
                <div className="space-y-3">
                  {selectedOption.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 text-sm text-slate-700 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-green-200 transition-colors">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-lg shadow-green-100">{idx + 1}</span>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-50/50 p-6 rounded-[24px] border border-green-100/50">
                  <h4 className="font-black text-green-800 text-[10px] mb-4 flex items-center gap-2 uppercase tracking-widest">
                    <i className="fas fa-circle-check"></i> {t.pros}
                  </h4>
                  <ul className="space-y-3">
                    {selectedOption.pros.map((p, idx) => (
                      <li key={idx} className="text-[11px] text-green-800/80 flex items-start gap-2 leading-relaxed">
                        <span className="mt-1 w-1.5 h-1.5 bg-green-400 rounded-full shrink-0"></span> 
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50/50 p-6 rounded-[24px] border border-red-100/50">
                  <h4 className="font-black text-red-800 text-[10px] mb-4 flex items-center gap-2 uppercase tracking-widest">
                    <i className="fas fa-circle-xmark"></i> {t.cons}
                  </h4>
                  <ul className="space-y-3">
                    {selectedOption.cons.map((c, idx) => (
                      <li key={idx} className="text-[11px] text-red-800/80 flex items-start gap-2 leading-relaxed">
                        <span className="mt-1 w-1.5 h-1.5 bg-red-400 rounded-full shrink-0"></span> 
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setSelectedOption(null)}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-slate-800 transition shadow-xl active:scale-95"
              >
                {lang === 'lo' ? 'ເຂົ້າໃຈແລ້ວ' : (lang === 'th' ? 'ตกลง' : 'Understood')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentGuide;
