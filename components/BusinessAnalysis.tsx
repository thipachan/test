
import React, { useState } from 'react';
import { analyzeBusiness } from '../services/geminiService';
import { BusinessAnalysis as IAnalysis, Language } from '../types';
import { locales } from '../locales';

interface BusinessAnalysisProps {
  lang: Language;
  isOnline: boolean;
}

const BusinessAnalysis: React.FC<BusinessAnalysisProps> = ({ lang, isOnline }) => {
  const t = locales[lang];
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<IAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleAnalyze = async () => {
    if (!idea.trim() || !isOnline) return;
    setLoading(true);
    try {
      const res = await analyzeBusiness(idea, lang);
      setResult(res);
      setCheckedItems({});
    } catch (e) {
      console.error(e);
      alert(lang === 'en' ? "Error analyzing. Try again." : "ເກີດຂໍ້ຜິດພາດ. ກະລຸນາລອງໃໝ່.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const lo = lang === 'lo';

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
          <i className="fas fa-magnifying-glass-chart text-[140px]"></i>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
              <i className="fas fa-brain text-xl"></i>
            </div>
            {t.featureAnalyzeTitle}
          </h2>
          <p className="text-sm text-slate-500 mb-8">{t.featureAnalyzeDesc}</p>
          
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder={t.analyzeIdeaPlaceholder}
            className="w-full p-6 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-lg h-32 mb-6"
          />
          
          <button
            onClick={handleAnalyze}
            disabled={loading || !idea || !isOnline}
            className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-purple-700 active:scale-95 transition-all disabled:bg-slate-200 disabled:text-slate-400 shadow-xl shadow-purple-200 flex items-center justify-center gap-3"
          >
            {loading ? <i className="fas fa-spinner animate-spin"></i> : <><i className="fas fa-bolt"></i> {t.btnAnalyze}</>}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-12 animate-fadeIn">
          {/* Detailed Feasibility & Summary */}
          <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <i className="fas fa-shield-halved text-[120px]"></i>
             </div>
             <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                <div className="flex flex-col items-center shrink-0">
                   <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                        <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-purple-500" strokeDasharray={465} strokeDashoffset={465 - (465 * (result.feasibilityScore || 0)) / 10} />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                         <span className="text-4xl font-black">{result.feasibilityScore}</span>
                         <span className="text-[10px] text-white/40 font-black uppercase">Overall</span>
                      </div>
                   </div>
                </div>
                
                <div className="flex-1 w-full space-y-6">
                   <h3 className="text-3xl font-black text-purple-400 uppercase tracking-tight">{result.idea}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                         <p className="text-[10px] text-white/40 uppercase mb-1 font-black">{t.startupCost}</p>
                         <p className="text-2xl font-black font-mono text-purple-200">{result.estimatedStartupCost}</p>
                      </div>
                      <div className="space-y-3">
                         {result.feasibilityMetrics?.map((m, i) => (
                           <div key={i}>
                              <div className="flex justify-between items-center mb-1">
                                 <span className="text-[10px] font-black uppercase text-white/60">{m.category}</span>
                                 <span className="text-[10px] font-black text-purple-400">{m.score}/10</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${m.score * 10}%` }}></div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Financial Scoreboard System */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                   <i className="fas fa-calculator"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-800">{lo ? 'ລະບົບການເງິນ ແລະ ງົບປະມານ' : 'Financial Scoreboard System'}</h3>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: lo ? 'ຕົ້ນທຶນເລີ່ມຕົ້ນ' : 'Initial Setup', val: result.totalExpenseSummary?.initialSetup, icon: 'fa-building-columns', color: 'blue' },
                  { label: lo ? 'ຄ່າຈ້າງ & ບໍລິຫານ/ເດືອນ' : 'Monthly Operating', val: result.totalExpenseSummary?.monthlyOperating, icon: 'fa-money-bill-transfer', color: 'indigo' },
                  { label: lo ? 'ເງິນແຮສຸກເສີນ' : 'Emergency Fund', val: result.totalExpenseSummary?.emergencyFund, icon: 'fa-kit-medical', color: 'amber' },
                  { label: lo ? 'ລວມງົບປີທີ 1' : 'Year 1 Total', val: result.totalExpenseSummary?.totalYearOne, icon: 'fa-chart-pie', color: 'purple' }
                ].map((item, idx) => (
                  <div key={idx} className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-b-4 border-b-${item.color}-500 group hover:shadow-md transition`}>
                     <div className={`w-10 h-10 bg-${item.color}-50 text-${item.color}-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                        <i className={`fas ${item.icon}`}></i>
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{item.label}</p>
                     <p className="text-lg font-black text-slate-800 font-mono leading-none">{item.val}</p>
                  </div>
                ))}
             </div>
          </section>

          {/* Launch Roadmap - SYSTEMIC PHASES */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                   <i className="fas fa-route"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-800">{lo ? 'ແຜນວຽກການເລີ່ມຕົ້ນ' : 'Business Launch Roadmap'}</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.launchTimeline?.map((phase, i) => (
                   <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-5xl font-black group-hover:scale-125 transition-transform">{i+1}</div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{phase.duration}</p>
                      <h4 className="text-lg font-black text-slate-800 mb-6">{phase.phase}</h4>
                      <ul className="space-y-3">
                         {phase.tasks?.map((task, idx) => (
                            <li key={idx} className="flex gap-3 text-xs text-slate-600 font-medium leading-relaxed">
                               <i className="fas fa-circle-check text-blue-500 mt-0.5 shrink-0"></i>
                               {task}
                            </li>
                         ))}
                      </ul>
                   </div>
                ))}
             </div>
          </section>

          {/* Equipment Procurement System */}
          <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <i className="fas fa-truck-ramp-box"></i>
                   </div>
                   <h3 className="text-xl font-black text-slate-800">{lo ? 'ລະບົບອຸປະກອນ ແລະ ການຈັດຊື້' : 'Equipment Procurement System'}</h3>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                   <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase">
                         <th className="pb-4 px-4">{lo ? 'ລາຍການອຸປະກອນ' : 'Equipment Item'}</th>
                         <th className="pb-4 px-4 text-center">{lo ? 'ຈຳນວນ' : 'Quantity'}</th>
                         <th className="pb-4 px-4 text-right">{lo ? 'ລາຄາ/ໜ່ວຍ' : 'Price/Unit'}</th>
                         <th className="pb-4 px-4 text-right">{lo ? 'ລວມ' : 'Total'}</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {result.criticalEquipment?.map((eq, i) => (
                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                           <td className="py-5 px-4">
                              <p className="text-sm font-black text-slate-800">{eq.item}</p>
                              <p className="text-[10px] text-slate-400 italic font-medium">{eq.reason}</p>
                           </td>
                           <td className="py-5 px-4 text-center">
                              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-black">{eq.quantity}</span>
                           </td>
                           <td className="py-5 px-4 text-right text-sm font-mono font-bold text-slate-600">{eq.cost}</td>
                           <td className="py-5 px-4 text-right text-sm font-mono font-black text-blue-600">{eq.cost}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </section>

          {/* HR & Staffing System */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-indigo-600 p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><i className="fas fa-users-gear text-8xl"></i></div>
                <h4 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                   <i className="fas fa-user-group"></i> {lo ? 'ລະບົບການຈັດການບຸກຄະລາກອນ' : 'Human Resource System'}
                </h4>
                <div className="space-y-8">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                         <p className="text-[10px] text-indigo-200 font-black uppercase mb-1">{lo ? 'ຈຳນວນພະນັກງານ' : 'Employee Count'}</p>
                         <p className="text-3xl font-black">{result.staffingPlan?.employeeCount}</p>
                      </div>
                      <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                         <p className="text-[10px] text-indigo-200 font-black uppercase mb-1">{lo ? 'ເງິນເດືອນ/ຄົນ' : 'Salary/Person'}</p>
                         <p className="text-xl font-black font-mono">{result.staffingPlan?.salaryPerPerson}</p>
                      </div>
                   </div>
                   <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5">
                      <p className="text-[10px] text-indigo-300 font-black uppercase mb-4">{lo ? 'ຕຳແໜ່ງ ແລະ ໜ້າທີ່' : 'Key Roles'}</p>
                      <div className="flex flex-wrap gap-2">
                        {result.staffingPlan?.roles?.map((role, i) => (
                           <span key={i} className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10">{role}</span>
                        ))}
                      </div>
                   </div>
                   <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                      <p className="text-sm font-bold text-indigo-100">{lo ? 'ລວມຄ່າຈ້າງທັງໝົດ/ເດືອນ:' : 'Total Monthly Payroll:'}</p>
                      <p className="text-3xl font-black text-yellow-400 font-mono">{result.staffingPlan?.totalMonthlySalary}</p>
                   </div>
                </div>
             </div>

             {/* Opening Day Checklist */}
             <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <i className="fas fa-clipboard-check text-green-500"></i> {lo ? 'ລາຍການກວດສອບມື້ເປີດຮ້ານ' : 'Opening Day Checklist'}
                </h3>
                <div className="space-y-4 flex-1">
                   {result.openingChecklist?.map((check, i) => (
                     <div key={i} onClick={() => toggleCheck(`check_${i}`)} className={`flex items-start gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${checkedItems[`check_${i}`] ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 mt-0.5 ${checkedItems[`check_${i}`] ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-transparent'}`}>
                           <i className="fas fa-check text-[10px]"></i>
                        </div>
                        <div>
                           <p className={`text-sm font-black ${checkedItems[`check_${i}`] ? 'text-green-800' : 'text-slate-700'}`}>{check.item}</p>
                           <p className="text-[10px] text-slate-400 font-medium italic">"{check.reason}"</p>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="mt-8 p-4 bg-slate-50 rounded-2xl text-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase">{Object.keys(checkedItems).length} / {result.openingChecklist?.length} COMPLETED</p>
                </div>
             </div>
          </section>

          {/* Location & Safety Systems */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <section className="space-y-6">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                   <i className="fas fa-map-location-dot text-blue-600"></i> {lo ? 'ລະບົບສະຖານທີ່ ແລະ ທຳເລ' : 'Market Location System'}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                   {result.locationRecommendations?.map((loc, i) => (
                     <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-300 transition-all group flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                           <i className="fas fa-location-arrow text-2xl"></i>
                        </div>
                        <div>
                           <h4 className="font-black text-lg text-slate-800 mb-1">{loc.area}</h4>
                           <p className="text-xs text-slate-500 leading-relaxed italic">"{loc.reason}"</p>
                           {loc.uri && <a href={loc.uri} target="_blank" className="text-[10px] font-black uppercase text-blue-600 mt-2 inline-block">View Map <i className="fas fa-external-link-alt ml-1"></i></a>}
                        </div>
                     </div>
                   ))}
                </div>
             </section>

             <div className="space-y-6">
                <h4 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                   <i className="fas fa-shield-halved text-green-600"></i> {lo ? 'ລະບົບຄວາມປອດໄພທຸລະກິດ' : 'Business Safety System'}
                </h4>
                <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                   <h5 className="text-xs font-black text-green-700 uppercase mb-4 tracking-widest">{lo ? 'ສິ່ງທີ່ຕ້ອງເຮັດ' : 'Standard Protocols (Do)'}</h5>
                   <ul className="space-y-3">
                      {result.doAndDont?.do?.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm font-bold text-green-900 leading-relaxed">
                           <i className="fas fa-check-circle text-green-500 mt-1 shrink-0"></i>
                           {item}
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                   <h5 className="text-xs font-black text-red-700 uppercase mb-4 tracking-widest">{lo ? 'ສິ່ງທີ່ຫ້າມເຮັດ' : 'Mistake Prevention (Don\'t)'}</h5>
                   <ul className="space-y-3">
                      {result.doAndDont?.dont?.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm font-bold text-red-900 leading-relaxed">
                           <i className="fas fa-times-circle text-red-500 mt-1 shrink-0"></i>
                           {item}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>

          {/* Failure & Loss Scenarios */}
          <section className="bg-red-50 p-8 rounded-[48px] border-2 border-red-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
               <i className="fas fa-triangle-exclamation text-[140px]"></i>
             </div>
             
             <div className="relative z-10 mb-8">
                <h3 className="text-2xl font-black text-red-600 flex items-center gap-3">
                  <i className="fas fa-skull-crossbones"></i> {lo ? 'ວິເຄາະຄວາມສ່ຽງ ແລະ ໂອກາດເຈັ່ງ' : 'Risk & Failure Management System'}
                </h3>
                <p className="text-red-900/60 text-sm mt-1">{lo ? 'ກວດສອບທຸກຢ່າງທີ່ອາດເຮັດໃຫ້ທ່ານເສຍເງິນ' : 'Critical failure points and recovery plans'}</p>
             </div>

             <div className="grid grid-cols-1 gap-4 relative z-10">
                {result.failureScenarios?.map((fail, i) => (
                  <div key={i} className="bg-white border border-red-200 rounded-[32px] p-8 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-col lg:flex-row gap-8">
                       <div className="flex-1">
                          <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">{lo ? 'ສາເຫດທີ່ອາດເກີດ' : 'Triggering Event'}</h4>
                          <p className="text-lg font-black text-slate-800 leading-tight mb-2">{fail.trigger}</p>
                          <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                             <p className="text-xs font-bold text-red-900 leading-relaxed italic"><span className="font-black">Financial Impact:</span> {fail.impact}</p>
                          </div>
                       </div>
                       <div className="flex-1 bg-green-50 p-8 rounded-[24px] border border-green-100 flex flex-col justify-center">
                          <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">{lo ? 'ວິທີປ້ອງກັນ / ແກ້ໄຂ' : 'Strategic Solution'}</h4>
                          <p className="text-sm font-black text-green-900 leading-relaxed">"{fail.solution}"</p>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </section>

          {/* Disclaimer */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 text-center">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
                Disclaimer: This AI analysis provides a systemic framework based on 2024-2025 market trends in Lao PDR. Successful implementation requires personal effort, local permit verification, and active management.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessAnalysis;
