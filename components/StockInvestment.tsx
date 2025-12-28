
import React, { useState, useEffect } from 'react';
import { getStockMarketAnalysis } from '../services/geminiService';
import { StockMarketAnalysis, StockInfo, LocalVenture, Language, ProjectionData } from '../types';
import { locales } from '../locales';

interface StockInvestmentProps {
  lang: Language;
  isOnline: boolean;
}

const StockInvestment: React.FC<StockInvestmentProps> = ({ lang, isOnline }) => {
  const t = locales[lang];
  const [analysis, setAnalysis] = useState<StockMarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockInfo | null>(null);
  const [selectedVenture, setSelectedVenture] = useState<LocalVenture | null>(null);
  const [activeTab, setActiveTab] = useState<'stocks' | 'ventures'>('stocks');

  const fetchAnalysis = async () => {
    if (!isOnline) return;
    setLoading(true);
    try {
      const data = await getStockMarketAnalysis(lang);
      setAnalysis(data);
      localStorage.setItem('lao_income_stock_cache', JSON.stringify(data));
    } catch (e) {
      console.error(e);
      alert(t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('lao_income_stock_cache');
    if (cached) {
      try { setAnalysis(JSON.parse(cached)); } catch(e) {}
    }
    if (isOnline && !cached) fetchAnalysis();
  }, [lang, isOnline]);

  const renderProjection = (proj: ProjectionData, title: string) => (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
      <div className="flex justify-between items-center">
        <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{title} ({proj.timeframe})</h5>
        <span className="text-[9px] font-black text-slate-400">{proj.riskLevel} Risk</span>
      </div>
      <div>
        <div className="flex justify-between items-end mb-1">
          <p className="text-[9px] font-black text-slate-400 uppercase">Success Chance</p>
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
          <p className="text-[8px] font-black text-red-400 uppercase">Potential Loss</p>
          <p className="text-sm font-black text-red-600">{proj.potentialLoss}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Market Sentiment Summary */}
      {analysis && (
        <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
            <i className="fas fa-chart-line text-[100px]"></i>
          </div>
          <h3 className="text-xl font-black text-blue-400 mb-2 flex items-center gap-2">
            <i className="fas fa-globe-asia"></i> {t.currentMarketSentiment}
          </h3>
          <p className="text-sm font-bold mb-4 leading-relaxed">{analysis.marketStatus}</p>
          <p className="text-xs text-slate-400 border-l-2 border-blue-500 pl-4 italic">
            "{analysis.generalRiskAdvice}"
          </p>
        </div>
      )}

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800">{t.stockMarketAnalysis}</h2>
          {isOnline && (
            <button onClick={fetchAnalysis} disabled={loading} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition">
              {loading ? <i className="fas fa-spinner animate-spin"></i> : <><i className="fas fa-sync-alt"></i> {t.btnUpdateMarket}</>}
            </button>
          )}
        </div>

        {/* Improved Tab Selection */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'stocks' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
          >
            <i className="fas fa-landmark-flag mr-2"></i> {t.tabPublicStocks} (10)
          </button>
          <button
            onClick={() => setActiveTab('ventures')}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'ventures' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
          >
            <i className="fas fa-shop mr-2"></i> {t.tabLocalVentures} (10)
          </button>
        </div>

        {analysis ? (
          <div className="animate-fadeIn">
            {activeTab === 'stocks' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.topStocks?.slice(0, 10).map((stock, i) => (
                  <div key={i} onClick={() => setSelectedStock(stock)} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-400 hover:shadow-lg transition cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-black text-blue-600 text-xs uppercase tracking-widest">{stock.ticker}</h4>
                       <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${stock.riskScore > 7 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {stock.riskScore}/10 Risk
                       </span>
                    </div>
                    <h3 className="font-black text-slate-800 mb-1 leading-tight">{stock.companyName}</h3>
                    <p className="text-[10px] text-slate-400 mb-4">{stock.headquarters || 'Vientiane, Laos'}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">Price</p>
                        <p className="text-base font-black font-mono text-slate-900">{stock.currentPrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-green-600 uppercase">Yield</p>
                        <p className="text-sm font-black text-green-600">{stock.dividendYield}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.localVentures?.slice(0, 10).map((venture, i) => (
                  <div key={i} onClick={() => setSelectedVenture(venture)} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-400 hover:shadow-lg transition cursor-pointer group">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs">
                        {i + 1}
                      </div>
                      <h3 className="font-black text-slate-800 leading-tight">{venture.title}</h3>
                    </div>
                    <div className="flex flex-col gap-1 mb-4">
                       <span className="text-[9px] font-black uppercase text-blue-500 flex items-center gap-1">
                         <i className="fas fa-map-pin"></i> {venture.physicalHub}
                       </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{t.minCapital}</p>
                          <p className="text-xs font-black text-slate-800">{venture.minCapital}</p>
                       </div>
                       <div className="p-3 bg-green-50 rounded-xl">
                          <p className="text-[8px] font-black text-green-600 uppercase mb-1">{t.profitRate}</p>
                          <p className="text-xs font-black text-green-700">{venture.profitRate}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* General Investment Steps for Laos */}
            <div className="mt-12 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
               <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                 <i className="fas fa-info-circle text-blue-600"></i> {t.investmentHowTo}
               </h3>
               <div className="space-y-3">
                  {analysis.investmentMethod?.map((step, i) => (
                    <div key={i} className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</div>
                      <p className="text-xs font-bold text-slate-600 leading-relaxed">{step}</p>
                    </div>
                  ))}
               </div>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-8 font-bold uppercase tracking-widest">
              Last Analysis: {analysis.lastUpdated || 'Current Market Cycle'}
            </p>
          </div>
        ) : (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto">
              <i className="fas fa-chart-line text-2xl animate-pulse"></i>
            </div>
            <p className="text-slate-400 font-bold italic">{isOnline ? t.loading : 'Connect to internet to load analysis'}</p>
          </div>
        )}
      </div>

      {/* Stock Detailed Modal */}
      {selectedStock && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{selectedStock.companyName}</h3>
                <p className="text-xs opacity-80">{selectedStock.ticker} - LSX Market</p>
              </div>
              <button onClick={() => setSelectedStock(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 scrollbar-hide">
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">{t.dividendYield}</p>
                    <p className="text-lg font-black text-green-600 font-mono">{selectedStock.dividendYield}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">{t.expectedReturn}</p>
                    <p className="text-lg font-black text-blue-600 font-mono">{selectedStock.expectedReturn}</p>
                 </div>
              </div>
              
              {/* Timeline Projections Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                   <i className="fas fa-hourglass-start text-blue-500"></i> {lang === 'lo' ? 'ການຄາດຄະເນໄລຍະເວລາ' : 'Timeline Projections'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {renderProjection(selectedStock.shortTermProjection, lang === 'lo' ? 'ໄລຍະສັ້ນ' : 'Short Term')}
                  {renderProjection(selectedStock.longTermProjection, lang === 'lo' ? 'ໄລຍະຍາວ' : 'Long Term')}
                </div>
              </div>

              {/* Registration & Ease Section */}
              <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-4">
                 <div>
                   <p className="text-[10px] text-blue-400 font-black uppercase mb-2">Registration Information</p>
                   <p className="text-sm font-mono mb-2">No: {selectedStock.registrationNo}</p>
                   <div className="flex justify-between items-start gap-4">
                      <p className="text-xs text-slate-400 flex-1"><i className="fas fa-map-pin mr-1"></i> {selectedStock.headquarters}</p>
                      <div className="flex flex-col gap-2">
                         <a href={selectedStock.headquartersUri} target="_blank" className="text-[9px] font-black uppercase text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-lg border border-blue-400/20 text-center">
                           <i className="fas fa-location-arrow mr-1"></i> {t.btnNavigate}
                         </a>
                         <a href={`tel:${selectedStock.contactPhone}`} className="text-[9px] font-black uppercase text-green-400 bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-400/20 text-center">
                           <i className="fas fa-phone mr-1"></i> {selectedStock.contactPhone}
                         </a>
                      </div>
                   </div>
                 </div>
                 <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] text-yellow-400 font-black uppercase mb-1">{t.investmentEase}</p>
                    <p className="text-xs text-slate-300 italic">"{selectedStock.investmentEase}"</p>
                 </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                   <i className="fas fa-magnifying-glass-chart text-blue-500"></i> AI ANALYSIS
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-blue-500 pl-4 bg-blue-50/30 p-4 rounded-r-xl">
                   "{selectedStock.analysis}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <h5 className="text-[10px] font-black text-green-600 uppercase">Pros</h5>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                       {selectedStock.pros?.map((p, i) => <li key={i} className="flex gap-2"><span>•</span> {p}</li>)}
                    </ul>
                 </div>
                 <div className="space-y-2">
                    <h5 className="text-[10px] font-black text-red-600 uppercase">Risks</h5>
                    <ul className="text-[11px] text-slate-600 space-y-1">
                       {selectedStock.cons?.map((p, i) => <li key={i} className="flex gap-2"><span>•</span> {p}</li>)}
                    </ul>
                 </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-2">
               <a 
                 href={selectedStock.officialListingUrl} 
                 target="_blank" 
                 className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-center shadow-lg active:scale-95 transition"
               >
                 {t.viewOfficialListing}
               </a>
               <button onClick={() => setSelectedStock(null)} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition">{t.btnGotIt}</button>
            </div>
          </div>
        </div>
      )}

      {/* Venture Detailed Modal */}
      {selectedVenture && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedVenture.title}</h3>
              <button onClick={() => setSelectedVenture(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8 scrollbar-hide">
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">{t.minCapital}</p>
                    <p className="text-base font-black">{selectedVenture.minCapital}</p>
                 </div>
                 <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-[10px] text-green-600 uppercase font-black mb-1">{t.profitRate}</p>
                    <p className="text-base font-black text-green-700">{selectedVenture.profitRate}</p>
                 </div>
              </div>

              {/* Timeline Projections Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                   <i className="fas fa-hourglass-start text-blue-500"></i> {lang === 'lo' ? 'ການຄາດຄະເນໄລຍະເວລາ' : 'Timeline Projections'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {renderProjection(selectedVenture.shortTermProjection, lang === 'lo' ? 'ໄລຍະສັ້ນ' : 'Short Term')}
                  {renderProjection(selectedVenture.longTermProjection, lang === 'lo' ? 'ໄລຍະຍາວ' : 'Long Term')}
                </div>
              </div>

              {/* Physical Hub & Partnership Section */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-blue-600 uppercase mb-2 flex items-center gap-2">
                    <i className="fas fa-location-dot"></i> {t.physicalHubLabel}
                  </h4>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-black text-blue-900">{selectedVenture.physicalHub}</p>
                    {selectedVenture.locationUri && (
                      <a href={selectedVenture.locationUri} target="_blank" className="text-[10px] font-black uppercase text-blue-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                        <i className="fas fa-map"></i> {t.btnNavigate}
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-100/50">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase mb-2 flex items-center gap-2">
                    <i className="fas fa-handshake"></i> {t.partnershipModelLabel}
                  </h4>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                    "{selectedVenture.partnershipModel}"
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                  <i className="fas fa-info-circle text-blue-500"></i> {lang === 'lo' ? 'ລາຍລະອຽດທຸລະກິດ' : 'Business Details'}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">"{selectedVenture.description}"</p>
              </div>

              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                <h4 className="text-[10px] font-black text-amber-600 uppercase mb-2 flex items-center gap-2">
                  <i className="fas fa-shield-check"></i> {t.legalTipsLabel}
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed font-bold">"{selectedVenture.legalTips}"</p>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-black text-slate-400 uppercase">{t.startupSteps}</h4>
                 <div className="space-y-2">
                    {selectedVenture.howToStart?.map((step, i) => (
                      <div key={i} className="flex gap-4 text-xs text-slate-700 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                        <p className="font-bold">{step}</p>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                <h4 className="text-[10px] font-black text-red-600 uppercase mb-1">Potential Risks</h4>
                <p className="text-xs text-red-800 leading-relaxed font-bold">"{selectedVenture.potentialLoss}"</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100">
               <button onClick={() => setSelectedVenture(null)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition">{t.btnGotIt}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockInvestment;
