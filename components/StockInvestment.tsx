
import React, { useState, useEffect } from 'react';
import { getStockMarketAnalysis } from '../services/geminiService';
import { StockMarketAnalysis, StockInfo, LocalVenture, Language } from '../types';
import { locales } from '../locales';

interface StockInvestmentProps {
  lang: Language;
}

const StockInvestment: React.FC<StockInvestmentProps> = ({ lang }) => {
  const t = locales[lang];
  const [analysis, setAnalysis] = useState<StockMarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockInfo | null>(null);
  const [selectedVenture, setSelectedVenture] = useState<LocalVenture | null>(null);
  const [activeTab, setActiveTab] = useState<'stocks' | 'ventures'>('stocks');
  const [ventureWatchlist, setVentureWatchlist] = useState<LocalVenture[]>([]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const data = await getStockMarketAnalysis(lang);
      setAnalysis(data);
    } catch (e) {
      console.error(e);
      alert(t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    // Load Venture Watchlist
    const saved = localStorage.getItem('lao_income_venture_watchlist_v1');
    if (saved) setVentureWatchlist(JSON.parse(saved));
  }, [lang]);

  const toggleVentureWatchlist = (e: React.MouseEvent, venture: LocalVenture) => {
    e.stopPropagation();
    const isSaved = ventureWatchlist.some(item => item.title === venture.title);
    let next: LocalVenture[];
    if (isSaved) {
      next = ventureWatchlist.filter(item => item.title !== venture.title);
    } else {
      next = [venture, ...ventureWatchlist];
    }
    setVentureWatchlist(next);
    localStorage.setItem('lao_income_venture_watchlist_v1', JSON.stringify(next));
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600 bg-green-50';
    if (score <= 7) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getFeasibilityColor = (score: number) => {
    if (score >= 7) return 'text-blue-600 bg-blue-50';
    if (score >= 4) return 'text-slate-600 bg-slate-50';
    return 'text-slate-400 bg-slate-100';
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
              <i className="fas fa-chart-line text-2xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">{t.stockMarketAnalysis}</h2>
              <p className="text-sm text-slate-500">{t.featureStockDesc}</p>
            </div>
          </div>
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? <i className="fas fa-spinner animate-spin"></i> : <><i className="fas fa-sync-alt mr-2"></i> {t.btnUpdateMarket}</>}
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition ${activeTab === 'stocks' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t.tabPublicStocks}
          </button>
          <button
            onClick={() => setActiveTab('ventures')}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition ${activeTab === 'ventures' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t.tabLocalVentures}
          </button>
        </div>

        {analysis ? (
          <div className="space-y-8">
            {/* Market Sentiment Overview */}
            <div className="p-6 bg-slate-900 text-white rounded-[32px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                <i className="fas fa-globe-asia text-[100px]"></i>
              </div>
              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-2">{t.currentMarketSentiment}</p>
              <h3 className="text-xl font-bold mb-4">{analysis.marketStatus}</h3>
              <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-indigo-500 pl-4">
                {analysis.generalRiskAdvice}
              </p>
            </div>

            {activeTab === 'stocks' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.topStocks.map((stock, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedStock(stock)}
                    className="bg-white p-6 rounded-3xl border border-slate-100 cursor-pointer hover:border-indigo-300 hover:shadow-xl transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-indigo-600 text-sm tracking-widest uppercase">{stock.ticker}</h4>
                        <h5 className="font-bold text-slate-800 leading-tight">{stock.companyName}</h5>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900 font-mono">{stock.currentPrice}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.ticker}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className={`p-3 rounded-2xl text-center ${getRiskColor(stock.riskScore)}`}>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{t.riskScale}</p>
                        <p className="text-sm font-black">{stock.riskScore}/10</p>
                      </div>
                      <div className={`p-3 rounded-2xl text-center ${getFeasibilityColor(stock.feasibilityScore)}`}>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{t.feasibilityScale}</p>
                        <p className="text-sm font-black">{stock.feasibilityScore}/10</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.dividendYield}</p>
                        <p className="text-sm font-bold text-green-600">{stock.dividendYield}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                        <i className="fas fa-arrow-right text-xs"></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.localVentures.map((venture, i) => {
                  const isSaved = ventureWatchlist.some(item => item.title === venture.title);
                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedVenture(venture)}
                      className="bg-white p-6 rounded-3xl border border-slate-100 cursor-pointer hover:border-indigo-300 hover:shadow-xl transition-all group flex flex-col relative"
                    >
                      <button 
                        onClick={(e) => toggleVentureWatchlist(e, venture)}
                        className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition shadow-sm z-10 ${isSaved ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-300 hover:text-indigo-500'}`}
                        title={isSaved ? t.removeFromWatchlist : t.addToWatchlist}
                      >
                        <i className="fas fa-bookmark"></i>
                      </button>

                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-slate-800 text-lg leading-tight flex-1 pr-12">{venture.title}</h4>
                      </div>

                      <div className="mb-4">
                        <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          {venture.riskLevel}
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.minCapital}</p>
                              <p className="text-sm font-black text-slate-900">{venture.minCapital}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[8px] font-black text-green-600 uppercase tracking-widest">{t.profitRate}</p>
                              <p className="text-sm font-black text-green-600">{venture.profitRate}</p>
                           </div>
                        </div>
                        
                        <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100/50">
                          <p className="text-[8px] font-black text-red-600 uppercase tracking-widest mb-1">{t.potentialLoss}</p>
                          <p className="text-[11px] text-red-800 line-clamp-2 italic">"{venture.potentialLoss}"</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 italic">{venture.duration}</span>
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                          <i className="fas fa-plus text-xs"></i>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* General Advice */}
            <div className="bg-indigo-50/50 p-8 rounded-[40px] border border-indigo-100/50">
              <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-3">
                <i className="fas fa-building-columns"></i> {t.investmentHowTo}
              </h3>
              <div className="space-y-4">
                {analysis.investmentMethod.map((step, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl items-center border border-indigo-100 group">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-slate-700 text-sm font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-widest pt-4">
              Last Updated: {analysis.lastUpdated}
            </p>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto">
              <i className="fas fa-chart-line text-2xl animate-pulse"></i>
            </div>
            <p className="text-slate-400 font-bold italic">{t.loading}</p>
          </div>
        )}
      </div>

      {/* Venture Watchlist Section */}
      {ventureWatchlist.length > 0 && (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 animate-fadeIn">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-bookmark"></i>
              </div>
              {t.watchlistTitle}
            </h2>
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">{ventureWatchlist.length}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ventureWatchlist.map((venture, i) => (
              <div 
                key={i}
                onClick={() => setSelectedVenture(venture)}
                className="group relative bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-white transition-all cursor-pointer shadow-sm hover:shadow-lg"
              >
                <button 
                  onClick={(e) => toggleVentureWatchlist(e, venture)}
                  className="absolute top-4 right-4 text-indigo-500 hover:text-red-500 transition-colors"
                  title={t.removeFromWatchlist}
                >
                  <i className="fas fa-times-circle"></i>
                </button>
                <h4 className="font-bold text-slate-900 text-sm mb-2 pr-6 group-hover:text-indigo-600">{venture.title}</h4>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">{venture.profitRate}</p>
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-arrow-right text-[10px]"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Detail Modal */}
      {selectedStock && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:p-0 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setSelectedStock(null)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-xl">
                  <i className="fas fa-building"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">{selectedStock.ticker}</h3>
                  <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">{selectedStock.companyName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStock(null)} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
              <p className="text-sm text-slate-600 italic bg-slate-50 p-6 rounded-[24px] border border-slate-100">"{selectedStock.analysis}"</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Returns</p>
                  <p className="text-base font-bold text-green-800">{selectedStock.expectedReturn}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Dividend</p>
                  <p className="text-base font-bold text-blue-800">{selectedStock.dividendYield}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-50/50 p-6 rounded-[24px] border border-green-100/50">
                  <h4 className="font-black text-green-800 text-[10px] mb-4 uppercase tracking-widest">Pros</h4>
                  <ul className="space-y-2 text-[11px] text-green-800/80">{selectedStock.pros.map((p, idx) => <li key={idx}>• {p}</li>)}</ul>
                </div>
                <div className="bg-red-50/50 p-6 rounded-[24px] border border-red-100/50">
                  <h4 className="font-black text-red-800 text-[10px] mb-4 uppercase tracking-widest">Cons</h4>
                  <ul className="space-y-2 text-[11px] text-red-800/80">{selectedStock.cons.map((c, idx) => <li key={idx}>• {c}</li>)}</ul>
                </div>
              </div>
            </div>
            <div className="p-8 border-t bg-slate-50"><button onClick={() => setSelectedStock(null)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl">{t.btnGotIt}</button></div>
          </div>
        </div>
      )}

      {/* Venture Detail Modal */}
      {selectedVenture && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:p-0 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setSelectedVenture(null)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-600 to-indigo-600 p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-xl">
                  <i className="fas fa-handshake"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">{selectedVenture.title}</h3>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{t.tabLocalVentures}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => toggleVentureWatchlist(e, selectedVenture)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition ${ventureWatchlist.some(v => v.title === selectedVenture.title) ? 'bg-white text-indigo-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <i className="fas fa-bookmark"></i>
                </button>
                <button onClick={() => setSelectedVenture(null)} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"><i className="fas fa-times"></i></button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t.minCapital}</span>
                  <span className="text-lg font-black text-slate-900">{selectedVenture.minCapital}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200/50">
                  <span className="text-xs font-bold text-green-600 uppercase">{t.profitRate}</span>
                  <span className="text-lg font-black text-green-600">{selectedVenture.profitRate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-red-600 uppercase">{t.potentialLoss}</span>
                  <span className="text-xs font-bold text-red-800 text-right max-w-[200px]">{selectedVenture.potentialLoss}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-info-circle text-indigo-500"></i> {t.ventureDetails}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed italic">{selectedVenture.description}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-list-check text-green-500"></i> {t.investmentHowTo}
                </h4>
                <div className="space-y-3">
                  {selectedVenture.howToStart.map((step, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-2xl items-center border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-white text-indigo-600 flex items-center justify-center text-xs font-black shadow-sm shrink-0">{idx + 1}</div>
                      <p className="text-slate-700 text-sm font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-slate-50">
              <button onClick={() => setSelectedVenture(null)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-transform">{t.btnGotIt}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockInvestment;
