
import React, { useState } from 'react';
import { IncomePlan, Language } from '../types';
import { locales } from '../locales';

interface PlanDisplayProps {
  plan: IncomePlan;
  onReset: () => void;
  lang: Language;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onReset, lang }) => {
  const t = locales[lang];
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [selectedStrategyIdx, setSelectedStrategyIdx] = useState<number | null>(null);

  // Helper to format currency values according to Lao conventions
  const formatKip = (value: string | number) => {
    if (typeof value === 'string') {
      const num = parseInt(value.replace(/[^0-9]/g, ''));
      if (!isNaN(num) && num.toString() === value.replace(/[^0-9]/g, '')) {
        return `${num.toLocaleString()} ${t.amountKip}`;
      }
      return value;
    }
    return `${value.toLocaleString()} ${t.amountKip}`;
  };

  const getDifficultyInfo = (diff: string) => {
    const d = diff.toLowerCase();
    if (d.includes('low') || d.includes('ງ່າຍ') || d.includes('ง่าย')) {
      return { 
        color: 'bg-green-100 text-green-700 hover:bg-green-200', 
        label: t.low, 
        desc: t.lowDesc 
      };
    }
    if (d.includes('medium') || d.includes('ປານກາງ') || d.includes('ปานกลาง')) {
      return { 
        color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200', 
        label: t.medium, 
        desc: t.mediumDesc 
      };
    }
    return { 
      color: 'bg-red-100 text-red-700 hover:bg-red-200', 
      label: t.high, 
      desc: t.highDesc 
    };
  };

  const selectedStrat = selectedStrategyIdx !== null ? plan.strategies[selectedStrategyIdx] : null;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.strategyPlan}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">
                {t.targetToday}: <span className="text-green-600 font-mono">{formatKip(plan.dailyTarget)}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
          >
            <i className="fas fa-rotate-right"></i> {t.reset}
          </button>
        </div>

        {/* Strategies Cards Grid - Simplified View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.strategies.map((strat, idx) => {
            const diffInfo = getDifficultyInfo(strat.difficulty);
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedStrategyIdx(idx)}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-6 cursor-pointer hover:border-blue-300 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-sm font-black text-blue-600 shadow-sm">
                    {idx + 1}
                  </span>
                  <div className="relative">
                    <div 
                      onMouseEnter={(e) => { e.stopPropagation(); setActiveTooltip(idx); }}
                      onMouseLeave={(e) => { e.stopPropagation(); setActiveTooltip(null); }}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm transition-colors ${diffInfo.color}`}
                    >
                      {diffInfo.label}
                    </div>
                    {activeTooltip === idx && (
                      <div className="absolute right-0 bottom-full mb-2 w-40 bg-slate-800 text-white text-[9px] p-2 rounded-lg shadow-xl z-20 animate-fadeIn pointer-events-none">
                        {diffInfo.desc}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition leading-tight line-clamp-2">
                  {strat.title}
                </h3>

                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.estIncome}</p>
                    <p className="text-lg font-black text-green-600 font-mono tracking-tighter">
                      {formatKip(strat.estimatedIncome)}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 shadow-lg shadow-blue-200">
                    <i className="fas fa-arrow-right text-xs"></i>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for Detailed Strategy */}
      {selectedStrat && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:p-0 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedStrategyIdx(null)}
          ></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-black text-white">
                  {selectedStrategyIdx! + 1}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">{selectedStrat.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedStrategyIdx(null)}
                className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getDifficultyInfo(selectedStrat.difficulty).color}`}>
                  {t.difficulty}: {getDifficultyInfo(selectedStrat.difficulty).label}
                </span>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.estIncome}</p>
                  <p className="text-xl font-black text-green-600 font-mono">{formatKip(selectedStrat.estimatedIncome)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{locales[lang].featureEarnDesc}</h4>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                  "{selectedStrat.description}"
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-list-check text-blue-500"></i> {t.actionStepsTitle}
                </h4>
                <div className="space-y-2">
                  {selectedStrat.actionSteps.map((step, sIdx) => (
                    <div key={sIdx} className="flex gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <i className="fas fa-check-circle text-blue-500 mt-0.5 text-xs"></i>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setSelectedStrategyIdx(null)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                {lang === 'lo' ? 'ເຂົ້າໃຈແລ້ວ' : (lang === 'th' ? 'เข้าใจแล้ว' : 'Got it!')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Immediate Actions "Start Today" Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <i className="fas fa-bolt text-[200px] rotate-12"></i>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              <i className="fas fa-rocket"></i>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{t.startTodayTitle}</h3>
              <p className="text-blue-100 text-sm opacity-80">{t.startTodaySubtitle}</p>
            </div>
          </div>

          <div className="space-y-3">
            {plan.immediateActions.map((action, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/10 hover:bg-white/15 backdrop-blur-sm p-5 rounded-2xl border border-white/10 transition group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center text-sm font-black group-hover:scale-110 transition">
                  {i + 1}
                </div>
                <p className="font-bold flex-1">{action}</p>
                <i className="fas fa-arrow-right text-white/30 group-hover:translate-x-1 group-hover:text-white transition"></i>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expert Advice & Caution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-3xl p-8 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-3 text-blue-400">
            <i className="fas fa-lightbulb"></i> {t.extraAdvice}
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-blue-500 pl-4">
            {plan.advice}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4 text-amber-700">
            <i className="fas fa-triangle-exclamation text-xl"></i>
            <h4 className="font-bold">{t.caution}</h4>
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            {t.cautionText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanDisplay;
