
import React, { useState, useEffect } from 'react';
import { IncomePlan, Language, IncomeStrategy } from '../types';
import { locales } from '../locales';

interface PlanDisplayProps {
  plan: IncomePlan;
  onReset: () => void;
  lang: Language;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onReset, lang }) => {
  if (!plan) return null;

  const t = locales[lang];
  const [selectedStrategyIdx, setSelectedStrategyIdx] = useState<number | null>(null);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('laoincome_completed_strats_v1');
    if (saved) {
      try { setCompletedIndices(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const toggleComplete = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    const next = completedIndices.includes(idx)
      ? completedIndices.filter(i => i !== idx)
      : [...completedIndices, idx];
    setCompletedIndices(next);
    localStorage.setItem('laoincome_completed_strats_v1', JSON.stringify(next));
  };

  const selectedStrat = selectedStrategyIdx !== null ? plan.strategies?.[selectedStrategyIdx] : null;
  const lo = lang === 'lo';

  // Detail View Component
  if (selectedStrat) {
    return (
      <div className="space-y-8 animate-fadeIn pb-24">
        {/* Navigation Back */}
        <button 
          onClick={() => {
            setSelectedStrategyIdx(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 text-slate-500 hover:text-blue-600 font-black uppercase text-xs tracking-widest transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <i className="fas fa-arrow-left"></i>
          </div>
          {lo ? 'ກັບຄືນຫາແຜນທັງໝົດ' : 'Back to All Plans'}
        </button>

        <div className="bg-white rounded-[40px] md:rounded-[50px] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-black/5">
          {/* Header: Mission Tactical Overview */}
          <div className="px-8 md:px-12 py-12 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12 scale-125">
              <i className="fas fa-microchip text-[200px]"></i>
            </div>
            <div className="relative z-10 flex flex-col gap-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg shadow-blue-900/40 tracking-widest">Mission Alpha-01</span>
                    <span className="bg-white/10 text-blue-400 text-[9px] font-black uppercase px-4 py-1.5 rounded-full border border-white/5 tracking-widest">Operational Sector: {selectedStrat.workLocation}</span>
                  </div>
                  <h3 className="text-3xl md:text-6xl font-black tracking-tighter leading-none mb-4 text-white drop-shadow-md">{selectedStrat.title}</h3>
                  <p className="text-slate-400 text-base md:text-lg leading-relaxed font-medium italic opacity-90 max-w-3xl">
                    "{selectedStrat.description}"
                  </p>
                </div>
                <div className="shrink-0">
                    <button onClick={() => setSelectedStrategyIdx(null)} className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all group active:scale-95">
                        <i className="fas fa-times text-xl group-hover:rotate-90 transition-transform"></i>
                    </button>
                </div>
              </div>

              {/* High-Focus Summary Cards (Salary & Location Focused) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/5 border border-green-500/20 p-6 rounded-[32px] backdrop-blur-sm">
                      <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <i className="fas fa-sack-dollar"></i> {lo ? 'ລາຍໄດ້ຄາດຄະເນ' : 'Target Income'}
                      </p>
                      <p className="text-3xl font-black text-white font-mono">{selectedStrat.estimatedIncome}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 p-6 rounded-[32px] backdrop-blur-sm">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <i className="fas fa-map-pin"></i> {lo ? 'ສະຖານທີ່ເຮັດວຽກ' : 'Work Zone'}
                      </p>
                      <p className="text-2xl font-black text-white truncate">{selectedStrat.workLocation}</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/20 p-6 rounded-[32px] backdrop-blur-sm">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <i className="fas fa-clock"></i> {lo ? 'ເວລາທີ່ໃຊ້' : 'Daily Time'}
                      </p>
                      <p className="text-2xl font-black text-white">{selectedStrat.timeRequired}</p>
                  </div>
              </div>
            </div>
          </div>

          {/* Mission Intelligence Body */}
          <div className="bg-slate-50/50">
            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* COLUMN 1: RECRUITMENT & IMMEDIATE HIRES */}
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b-2 border-slate-200/60 pb-5">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                        <i className="fas fa-bolt-lightning text-lg animate-pulse"></i>
                    </div>
                    {lo ? 'ຂໍ້ມູນການສະໝັກ ແລະ ເງິນເດືອນ' : 'Applications & Salaries'}
                  </h4>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-black text-green-600 tracking-widest uppercase">Verified Hot</span>
                  </span>
                </div>

                <div className="space-y-5">
                  {selectedStrat.jobListings?.map((job, i) => (
                    <div key={i} className="bg-white border-2 border-slate-100 rounded-[35px] p-8 hover:border-blue-500 transition-all shadow-sm hover:shadow-2xl group relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:scale-125 transition-transform text-slate-900">
                          <i className={`${job.source?.toLowerCase().includes('facebook') ? 'fab fa-facebook' : 'fas fa-id-badge'} text-9xl`}></i>
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                          <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform ${job.source?.toLowerCase().includes('facebook') ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
                            <i className={job.source?.toLowerCase().includes('facebook') ? 'fab fa-facebook-f text-2xl' : 'fas fa-briefcase text-2xl'}></i>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{job.source}</p>
                            <h5 className="text-xl font-black text-slate-800 leading-tight truncate">{job.role}</h5>
                          </div>
                        </div>

                        {/* Salary & Location Highlights */}
                        <div className="grid grid-cols-1 gap-3 mb-8">
                            <div className="flex items-center gap-4 bg-green-50 p-4 rounded-2xl border border-green-100 group-hover:bg-white transition-all">
                                <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
                                    <i className="fas fa-money-bill-wave"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-0.5">{lo ? 'ລາຍໄດ້ຄາດຄະເນ' : 'Est. Salary'}</p>
                                    <p className="text-xl font-black text-green-900 font-mono leading-none">{job.salary || t.negotiable}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100 group-hover:bg-white transition-all">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
                                    <i className="fas fa-location-dot"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">{lo ? 'ສະຖານທີ່ສະໝັກ' : 'Location'}</p>
                                    <p className="text-base font-black text-blue-900 leading-tight truncate">{job.location}</p>
                                </div>
                            </div>
                        </div>

                        {/* Prep Checklist for This Job */}
                        <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Preparation for hiring</p>
                           <ul className="space-y-2">
                             <li className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                               <i className="fas fa-file-invoice text-blue-500"></i> {lo ? 'ກຽມບັດປະຈຳຕົວ (ຕົ້ນສະບັບ)' : 'ID Card (Original)'}
                             </li>
                             <li className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                               <i className="fas fa-mobile-button text-blue-500"></i> {lo ? 'ແອັບ BCEL One ພ້ອມໃຊ້' : 'BCEL One app ready'}
                             </li>
                           </ul>
                        </div>

                        <div className="flex gap-3 relative z-10">
                          <a href={`tel:${(job.contact || '').replace(/\s/g, '')}`} className="flex-1 bg-slate-900 text-white py-5 rounded-[22px] font-black text-sm flex items-center justify-center gap-4 hover:bg-green-600 transition-all shadow-xl active:scale-95">
                            <i className="fas fa-phone-volume animate-bounce"></i> {job.contact}
                          </a>
                          {job.link && (
                            <a href={job.link} target="_blank" className="w-16 h-16 bg-white border-2 border-slate-100 text-blue-600 rounded-[22px] flex items-center justify-center hover:bg-blue-50 transition-all shadow-sm">
                                <i className="fas fa-link text-xl"></i>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-indigo-900 p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-6 opacity-10"><i className="fas fa-microphone-lines text-6xl"></i></div>
                  <h5 className="text-[11px] font-black text-blue-400 uppercase mb-4 tracking-widest flex items-center gap-3">
                    <i className="fas fa-comment-dots"></i> {lo ? 'ບົດລົມໂທລະສັບເພື່ອໃຫ້ໄດ້ວຽກ' : 'Success Call Script'}
                  </h5>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-3">
                    <p className="text-[9px] font-black text-indigo-400 uppercase">Pro Opening:</p>
                    <p className="text-sm font-bold leading-relaxed italic border-l-2 border-blue-500 pl-4">
                      "ສະບາຍດີ, ຂ້ອຍໂທມາສອບຖາມວຽກ {selectedStrat.title} ທີ່ເຫັນປະກາດຜ່ານ LaoIncome Pro, ຕອນນີ້ຍັງຮັບຢູ່ບໍ່? ຂ້ອຍມີອຸປະກອນ ແລະ ພ້ອມເລີ່ມງານທັນທີ."
                    </p>
                  </div>
                </div>
              </div>

              {/* COLUMN 2: EXECUTION PROTOCOL & SKILLS */}
              <div className="space-y-12">
                <section className="space-y-8">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-4 border-b-2 border-slate-200/60 pb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                        <i className="fas fa-route"></i>
                    </div>
                    Tactical Timeline
                  </h4>
                  <div className="relative space-y-5 pl-6">
                    <div className="absolute left-[1.85rem] top-3 bottom-3 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-transparent opacity-20 rounded-full"></div>
                    
                    {selectedStrat.dailySchedule?.map((sch, i) => (
                      <div key={i} className="relative flex gap-6 items-center bg-white p-5 rounded-[30px] border border-slate-100 shadow-sm hover:border-blue-400 transition-all group/sch">
                        <div className="absolute -left-[1.1rem] w-6 h-6 rounded-full bg-white border-4 border-blue-500 z-10 group-hover/sch:scale-125 transition-transform shadow-lg"></div>
                        <div className="w-24 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-[11px] font-black shrink-0 group-hover/sch:bg-blue-600 transition-colors shadow-xl">
                          {sch.time}
                        </div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{sch.task}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-8">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-4 border-b-2 border-slate-200/60 pb-5">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
                        <i className="fas fa-graduation-cap"></i>
                    </div>
                    {lo ? 'ທັກສະທີ່ຕ້ອງຝຶກດ່ວນ' : 'Professional Mastery'}
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedStrat.masterySkills?.map((skill, i) => (
                      <div key={i} className="bg-white border border-slate-100 p-5 rounded-[28px] flex items-center gap-4 group hover:border-purple-300 transition-all shadow-sm">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                          <i className="fas fa-star-of-life text-xs"></i>
                        </div>
                        <p className="text-sm font-black text-slate-700">{skill}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-8">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-4 border-b-2 border-slate-200/60 pb-5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                        <i className="fas fa-list-check"></i>
                    </div>
                    {lo ? 'ຂັ້ນຕອນການລົງມືເຮັດ' : 'Action Steps'}
                  </h4>
                  <div className="space-y-4">
                    {selectedStrat.actionSteps?.map((step, i) => (
                      <div key={i} className="flex gap-5 p-6 bg-white rounded-[32px] border border-slate-100 hover:border-indigo-400 transition-all shadow-sm group/step">
                        <span className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 group-hover/step:bg-indigo-600 group-hover/step:text-white transition-all shadow-inner">{i+1}</span>
                        <p className="text-sm text-slate-700 font-bold leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* COLUMN 3: INTEL & FINANCIAL AUDIT */}
              <div className="space-y-10">
                <section className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 scale-150"><i className="fas fa-satellite text-9xl"></i></div>
                  <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                      <i className="fas fa-map-location-dot text-2xl"></i> Tactical Zone Intel
                  </h4>
                  <div className="bg-white/5 p-8 rounded-[35px] border border-white/10 backdrop-blur-xl mb-8">
                    <p className="text-3xl font-black text-white leading-tight mb-4">{selectedStrat.workLocation}</p>
                    <p className="text-sm text-slate-400 leading-relaxed italic border-l-4 border-blue-500 pl-8 font-medium">
                        "{selectedStrat.locationDetails}"
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                     <p className="text-[9px] font-black text-slate-500 uppercase">Target Landmarks:</p>
                     <div className="flex flex-wrap gap-2">
                        {selectedStrat.realWorldLandmarks?.map((mark, i) => (
                          <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-300">
                             <i className="fas fa-landmark mr-2 text-blue-500"></i> {mark}
                          </span>
                        ))}
                     </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {selectedStrat.platformLinks?.map((link, i) => (
                        <a key={i} href={link.uri} target="_blank" className="flex items-center gap-3 text-[10px] font-black text-white bg-blue-600 px-6 py-4 rounded-[22px] hover:bg-blue-500 transition shadow-xl border border-blue-400/30">
                            <i className="fas fa-arrow-up-right-from-square text-xs"></i> {link.title}
                        </a>
                    ))}
                  </div>
                </section>

                <section className="bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><i className="fas fa-chart-line text-[140px]"></i></div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-4">
                      <i className="fas fa-calculator text-blue-500"></i> Financial Audit
                  </h4>
                  <div className="space-y-5 relative z-10">
                    {selectedStrat.revenueBreakdown?.map((rev, i) => (
                      <div key={i} className="flex justify-between items-center pb-5 border-b border-slate-100 group/rev">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 group-hover/rev:text-blue-600 transition-colors truncate">{rev.item}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Goal: {rev.quantity} units</p>
                        </div>
                        <span className="font-mono font-black text-green-600 text-lg">+{rev.amount}</span>
                      </div>
                    ))}
                    <div className="pt-6 mt-6 flex justify-between items-end bg-slate-900 p-8 rounded-[35px] text-white shadow-2xl">
                      <div>
                        <p className="text-[10px] font-black uppercase text-blue-400 mb-2">Net Daily Goal</p>
                        <p className="text-5xl font-black font-mono text-white tracking-tighter leading-none">{selectedStrat.estimatedIncome?.split(' ')[0]}</p>
                      </div>
                      <span className="text-[11px] font-black text-blue-300 uppercase pb-1 tracking-[0.3em]">Kip/Day</span>
                    </div>
                  </div>
                </section>

                <section className="bg-amber-50 p-8 rounded-[40px] border-2 border-amber-100 shadow-inner group">
                  <h5 className="text-[11px] font-black text-amber-600 uppercase mb-4 tracking-[0.3em] flex items-center gap-3">
                      <i className="fas fa-shield-halved text-xl"></i> {lo ? 'ວິທີກວດສອບວຽກແທ້' : 'Security Check'}
                  </h5>
                  <p className="text-sm text-amber-900 leading-relaxed font-bold italic border-l-4 border-amber-500/30 pl-8">
                      "{selectedStrat.howToVerify}"
                  </p>
                </section>
              </div>
            </div>
          </div>

          {/* Sticky Dashboard Footer Navigation */}
          <div className="px-8 md:px-12 py-10 border-t-2 border-slate-100 bg-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
            <div className="absolute bottom-0 right-0 p-12 opacity-[0.02] pointer-events-none"><i className="fas fa-check-double text-[120px]"></i></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-[22px] bg-green-50 flex items-center justify-center text-green-600 border-2 border-green-100 shadow-xl animate-pulse">
                <i className="fas fa-rocket text-2xl"></i>
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-1">System Integrity</p>
                <p className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Ready for Immediate Hire</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setSelectedStrategyIdx(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full md:w-[450px] bg-slate-900 text-white py-6 rounded-[35px] font-black text-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] uppercase tracking-[0.3em] active:scale-95 transition-all hover:bg-black relative z-10 flex items-center justify-center gap-6 group"
            >
              <i className="fas fa-power-off text-green-500 group-hover:text-green-400 transition-colors"></i>
              {lo ? 'ກັບຄືນ' : 'CLOSE INTEL'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Target Progress Bar */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><i className="fas fa-bullseye text-[100px]"></i></div>
         <div className="flex justify-between items-end mb-4 relative z-10">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t.targetToday}</p>
               <h3 className="text-3xl font-black text-slate-900 font-mono">
                  {plan.dailyTarget?.toLocaleString() || '0'} <span className="text-lg text-blue-600">{t.amountKip}</span>
               </h3>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{completedIndices.length} / {plan.strategies?.length} DONE</p>
            </div>
         </div>
         <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {plan.strategies?.map((_, idx) => (
               <div 
                  key={idx} 
                  className={`h-full transition-all duration-700 border-r border-white/20 ${completedIndices.includes(idx) ? 'bg-green-500' : 'bg-slate-200'}`}
                  style={{ width: `${100 / plan.strategies.length}%` }}
               ></div>
            ))}
         </div>
      </div>

      <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
          <i className="fas fa-map-signs text-[180px]"></i>
        </div>
        <h3 className="text-xl font-black text-yellow-400 mb-8 flex items-center gap-3">
          <i className="fas fa-route"></i> {t.roadmapTitle}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
           {[
             { title: t.survivalPhase, desc: t.survivalPhaseDesc, icon: 'fa-person-running', color: 'blue' },
             { title: t.brokerPhase, desc: t.brokerPhaseDesc, icon: 'fa-handshake', color: 'indigo' },
             { title: t.growthPhase, desc: t.growthPhaseDesc, icon: 'fa-chart-line', color: 'green' }
           ].map((phase, i) => (
             <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors group/phase">
                <div className={`w-10 h-10 bg-${phase.color}-500/20 text-${phase.color}-400 rounded-xl flex items-center justify-center mb-4 group-hover/phase:scale-110 transition-transform`}>
                   <i className={`fas ${phase.icon}`}></i>
                </div>
                <p className="text-[10px] font-black text-white/40 uppercase mb-2">{t.stepLabel} {i+1}</p>
                <h4 className="font-black text-base mb-2">{phase.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed italic">"{phase.desc}"</p>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02]"><i className="fas fa-briefcase text-[120px]"></i></div>
        <div className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">{t.strategyPlan}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Select a task to see recruiters & contacts</p>
          </div>
          <button onClick={onReset} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-inner border border-slate-100">
            <i className="fas fa-rotate-right"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {plan.strategies?.map((strat, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedStrategyIdx(idx)}
              className={`group p-6 rounded-[35px] border-2 transition-all relative overflow-hidden cursor-pointer ${
                completedIndices.includes(idx) 
                ? 'bg-slate-50 border-transparent opacity-60' 
                : 'bg-white border-slate-100 hover:border-blue-400 shadow-sm hover:shadow-xl active:scale-[0.98]'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div 
                  onClick={(e) => toggleComplete(e, idx)} 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${completedIndices.includes(idx) ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-slate-50 text-slate-300 hover:text-blue-500 hover:bg-blue-50 border border-slate-100'}`}
                >
                  <i className={`fas ${completedIndices.includes(idx) ? 'fa-check' : 'fa-plus'} text-lg`}></i>
                </div>
                <div className="text-right">
                   <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 shadow-sm">SYSTEM READY</span>
                </div>
              </div>
              <h3 className={`text-lg font-black text-slate-800 mb-2 leading-tight ${completedIndices.includes(idx) ? 'line-through' : ''}`}>{strat.title}</h3>
              <div className="flex items-center gap-2 mb-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                 <i className="fas fa-map-pin text-red-500"></i> {strat.workLocation}
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t.estIncome}</p>
                <p className="text-xl font-black text-green-600 font-mono">{strat.estimatedIncome}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immediate Actions Systematic View */}
      <div className="bg-blue-600 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
           <i className="fas fa-bolt text-[160px]"></i>
        </div>
        <div className="relative z-10">
           <h3 className="text-3xl font-black mb-2">{t.startTodayTitle}</h3>
           <p className="text-blue-100 text-sm mb-8 uppercase tracking-widest font-black">{t.startTodaySubtitle}</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {plan.immediateActions?.map((action, i) => (
               <div key={i} className="flex items-center gap-6 bg-white/10 p-6 rounded-[32px] border border-white/10 backdrop-blur-sm group/action hover:bg-white/20 transition-all cursor-default shadow-lg">
                 <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center text-xl font-black group-hover/action:scale-110 transition shadow-xl shadow-blue-900/40">
                    {i+1}
                 </div>
                 <p className="text-sm font-black leading-tight">{action}</p>
               </div>
             ))}
           </div>
           
           <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 text-center backdrop-blur-md">
              <p className="text-xs font-bold text-blue-200 italic">"{plan.advice}"</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDisplay;
