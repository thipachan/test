
import React, { useState } from 'react';
import { generateMarketingPlan } from '../services/geminiService';
import { MarketingPlan, Language } from '../types';
import { locales } from '../locales';

interface MarketingStrategyProps {
  lang: Language;
}

const MarketingStrategy: React.FC<MarketingStrategyProps> = ({ lang }) => {
  const t = locales[lang];
  const [idea, setIdea] = useState("");
  const [plan, setPlan] = useState<MarketingPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    try {
      const res = await generateMarketingPlan(idea, lang);
      setPlan(res);
    } catch (e) {
      console.error(e);
      alert(t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner">
            <i className="fas fa-bullhorn text-xl"></i>
          </div>
          {t.featureMarketingTitle}
        </h2>
        <p className="text-sm text-slate-500 mb-8">{t.featureMarketingDesc}</p>
        
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder={t.marketingIdeaPlaceholder}
          className="w-full p-6 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-lg h-32 mb-6"
        />
        
        <button
          onClick={handleGenerate}
          disabled={loading || !idea}
          className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-orange-700 active:scale-95 transition-all disabled:bg-slate-200 disabled:text-slate-400 shadow-xl shadow-orange-200 flex items-center justify-center gap-3"
        >
          {loading ? <i className="fas fa-spinner animate-spin"></i> : <><i className="fas fa-wand-magic-sparkles"></i> {t.btnGeneratePlan}</>}
        </button>
      </div>

      {plan && (
        <div className="space-y-8 animate-fadeIn">
          {/* Target Audience */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <i className="fas fa-users text-orange-500"></i> {t.targetAudience}
            </h3>
            <div className="flex flex-wrap gap-3">
              {plan.targetAudience.map((audience, i) => (
                <div key={i} className="px-5 py-3 bg-orange-50 text-orange-700 rounded-2xl font-bold border border-orange-100 text-sm">
                  {audience}
                </div>
              ))}
            </div>
          </div>

          {/* Marketing Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.channels.map((channel, i) => (
              <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-orange-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    <i className={channel.platform.toLowerCase().includes('tiktok') ? 'fab fa-tiktok' : (channel.platform.toLowerCase().includes('facebook') ? 'fab fa-facebook' : 'fas fa-share-nodes')}></i>
                  </div>
                  <h4 className="font-black text-slate-800 text-lg">{channel.platform}</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Strategy</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{channel.strategy}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">{t.findCustomers}</p>
                    <p className="text-sm text-slate-600 font-medium italic">{channel.howToFindCustomers}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Incentives */}
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <i className="fas fa-gift text-[120px]"></i>
            </div>
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-orange-400">
              <i className="fas fa-star"></i> {t.incentivesTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {plan.incentives.map((inc, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/15 transition">
                  <h4 className="font-black text-lg text-white mb-2">{inc.title}</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{inc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content Ideas */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <i className="fas fa-film text-blue-500"></i> {t.contentIdeas}
            </h3>
            <div className="space-y-3">
              {plan.contentIdeas.map((idea, i) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl items-center border border-slate-100 group hover:bg-blue-50 transition">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-slate-700 text-sm font-medium">{idea}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expert Tip */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 rounded-[32px] text-white shadow-xl shadow-orange-100">
            <h4 className="font-black text-xl mb-3 flex items-center gap-3">
              <i className="fas fa-wand-magic-sparkles"></i> {t.marketingSummary}
            </h4>
            <p className="text-white/90 leading-relaxed italic border-l-4 border-white/30 pl-6 py-2">
              "{plan.expertTip}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingStrategy;
