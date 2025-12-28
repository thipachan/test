
import React, { useState } from 'react';
import { generateMarketingPlan } from '../services/geminiService';
import { MarketingPlan, Language } from '../types';
import { locales } from '../locales';

interface MarketingStrategyProps {
  lang: Language;
  isOnline: boolean;
}

const MarketingStrategy: React.FC<MarketingStrategyProps> = ({ lang, isOnline }) => {
  const t = locales[lang];
  const [idea, setIdea] = useState("");
  const [plan, setPlan] = useState<MarketingPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim() || !isOnline) return;
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
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <i className="fas fa-bullhorn text-[140px] rotate-12"></i>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner">
              <i className="fas fa-wand-magic-sparkles text-xl"></i>
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
            disabled={loading || !idea || !isOnline}
            className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-orange-700 active:scale-95 transition-all disabled:bg-slate-200 disabled:text-slate-400 shadow-xl shadow-orange-200 flex items-center justify-center gap-3"
          >
            {loading ? <i className="fas fa-spinner animate-spin"></i> : <><i className="fas fa-fire"></i> {t.btnGeneratePlan}</>}
          </button>
        </div>
      </div>

      {plan && (
        <div className="space-y-10 animate-fadeIn">
          {/* Lead Radar - NEW PROMINENT SECTION FOR IMMEDIATE ACTION */}
          <section className="bg-gradient-to-br from-blue-900 to-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
               <i className="fas fa-satellite-dish text-[160px] animate-pulse"></i>
             </div>
             
             <div className="relative z-10 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-blue-400 flex items-center gap-3">
                    <i className="fas fa-radar text-blue-500"></i> {t.leadRadarTitle}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">{t.leadRadarSub}</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest">{t.actionNow}</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {plan.leadRadar?.map((lead, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-blue-400/50 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(lead.platform || '').toLowerCase().includes('facebook') ? 'bg-blue-600' : 'bg-slate-700'} text-white shadow-lg`}>
                             <i className={(lead.platform || '').toLowerCase().includes('facebook') ? 'fab fa-facebook-f' : ((lead.platform || '').toLowerCase().includes('tiktok') ? 'fab fa-tiktok' : ((lead.platform || '').toLowerCase().includes('whatsapp') ? 'fab fa-whatsapp' : 'fas fa-search'))}></i>
                          </div>
                          <div>
                            <h4 className="font-black text-base group-hover:text-blue-400 transition-colors">{lead.locationName}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lead.platform}</p>
                          </div>
                       </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6 italic">"{lead.description}"</p>
                    <div className="flex items-center justify-between mt-auto">
                       <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-lg border border-blue-400/20">
                         {lead.actionType}
                       </span>
                       <a 
                         href={lead.link || `https://www.google.com/search?q=${encodeURIComponent(lead.locationName || '')}`}
                         target="_blank" 
                         rel="noreferrer"
                         className="flex items-center gap-2 text-xs font-black text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-500 transition active:scale-95 shadow-lg shadow-blue-900/40"
                       >
                         {t.btnGoToLead} <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
                       </a>
                    </div>
                  </div>
                ))}
             </div>
          </section>

          {/* Closing Tactics Masterclass */}
          <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
              <i className="fas fa-handshake text-[120px]"></i>
            </div>
            
            <div className="relative z-10 mb-8">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <i className="fas fa-money-bill-trend-up text-orange-600"></i> {t.closingTacticsTitle}
              </h3>
              <p className="text-slate-500 text-sm mt-1">{t.closingTacticsSub}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 relative z-10">
              {plan.closingTactics?.map((tactic, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden group hover:border-orange-500/50 transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-orange-200">
                        {i + 1}
                      </div>
                      <h4 className="font-black text-lg text-slate-800">{tactic.title}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.technique}</p>
                        <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-orange-500 pl-4">
                          {tactic.technique}
                        </p>
                      </div>
                      
                      <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-xl">
                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">{t.sampleScript}</p>
                        <p className="text-sm font-bold leading-relaxed font-mono">
                          "{tactic.script}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Target Audience & Content Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Target Audience */}
             <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <i className="fas fa-users text-blue-500"></i> {t.targetAudience}
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {plan.targetAudience?.map((audience, i) => (
                    <div key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100 text-xs">
                      {audience}
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t.contentIdeas}</h4>
                  <ul className="space-y-3">
                    {plan.contentIdeas?.map((idea, i) => (
                      <li key={i} className="flex gap-3 text-xs text-slate-600 font-medium">
                        <i className="fas fa-check text-green-500 mt-1"></i>
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>
             </div>

             {/* Content Checklist */}
             <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                  <i className="fas fa-list-check text-indigo-500"></i> {t.contentChecklistTitle}
                </h3>
                <p className="text-xs text-slate-500 mb-6">{t.contentChecklistSub}</p>
                
                <div className="space-y-4">
                  {plan.contentChecklist?.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        <i className="fas fa-camera"></i>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{item.item}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plan.channels?.map((channel, i) => (
              <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-100 group-hover:bg-orange-50 transition">
                    <i className={(channel.platform || '').toLowerCase().includes('tiktok') ? 'fab fa-tiktok text-xl' : ((channel.platform || '').toLowerCase().includes('facebook') ? 'fab fa-facebook text-xl text-blue-600' : ((channel.platform || '').toLowerCase().includes('whatsapp') ? 'fab fa-whatsapp text-xl text-green-500' : 'fas fa-share-nodes text-xl text-slate-400'))}></i>
                  </div>
                  <h4 className="font-black text-slate-800 text-lg leading-tight">{channel.platform}</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Strategy</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-bold">{channel.strategy}</p>
                  </div>
                  <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                    <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">{t.findCustomers}</p>
                    <p className="text-[11px] text-orange-800 font-medium italic">{channel.howToFindCustomers}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Incentives & Expert Tip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100">
               <h3 className="text-xl font-black text-amber-900 mb-6 flex items-center gap-3">
                 <i className="fas fa-gift text-amber-600"></i> {t.incentivesTitle}
               </h3>
               <div className="space-y-4">
                 {plan.incentives?.map((inc, i) => (
                   <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-amber-200">
                     <p className="font-black text-amber-900 text-sm mb-1">{inc.title}</p>
                     <p className="text-xs text-amber-700">{inc.description}</p>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-8 rounded-[40px] text-white shadow-xl shadow-orange-100 flex flex-col justify-center">
              <h4 className="font-black text-xl mb-4 flex items-center gap-3">
                <i className="fas fa-crown text-yellow-300"></i> {t.marketingSummary}
              </h4>
              <p className="text-white/90 text-lg leading-relaxed italic border-l-4 border-white/30 pl-6 py-2">
                "{plan.expertTip}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingStrategy;
