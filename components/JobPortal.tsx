
import React, { useState, useEffect } from 'react';
import { JobListing, Language } from '../types';
import { locales } from '../locales';
import { searchJobsByProfession } from '../services/geminiService';

interface JobPortalProps {
  lang: Language;
  isOnline: boolean;
}

const JobPortal: React.FC<JobPortalProps> = ({ lang, isOnline }) => {
  const t = locales[lang];
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("Service & Labor");
  
  const categories = [
    { id: "Service & Labor", label: lang === 'lo' ? 'ບໍລິການ & ແຮງງານ' : 'Service & Labor', icon: 'fa-person-digging' },
    { id: "Delivery & Logistics", label: lang === 'lo' ? 'ຂົນສົ່ງ & ສົ່ງເຄື່ອງ' : 'Delivery', icon: 'fa-truck-fast' },
    { id: "Sales & Marketing", label: lang === 'lo' ? 'ຂາຍ & ການຕະຫຼາດ' : 'Sales', icon: 'fa-comments-dollar' },
    { id: "Digital & Office", label: lang === 'lo' ? 'ດິຈິຕອນ & ສຳນັກງານ' : 'Office', icon: 'fa-laptop-code' },
    { id: "Technician", label: lang === 'lo' ? 'ຊ່າງເຕັກນິກ' : 'Technician', icon: 'fa-screwdriver-wrench' }
  ];

  const fetchJobs = async (cat: string) => {
    if (!isOnline) return;
    setLoading(true);
    setJobs([]);
    try {
      const data = await searchJobsByProfession(cat, lang);
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(category);
  }, [category, isOnline]);

  const lo = lang === 'lo';

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <i className="fas fa-search-dollar text-[140px]"></i>
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <i className="fas fa-briefcase text-xl"></i>
            </div>
            {t.jobPortalTitle}
          </h2>
          <p className="text-sm text-slate-500 mb-8">{t.jobPortalSub}</p>
          
          <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs whitespace-nowrap transition-all border-2 ${category === cat.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}
              >
                <i className={`fas ${cat.icon}`}></i> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-4">
           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{t.jobLoading}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.length > 0 ? (
            jobs.map((job, i) => (
              <div key={i} className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all p-8 flex flex-col group relative overflow-hidden">
                {job.isUrgent && (
                  <div className="absolute top-0 right-0">
                     <div className="bg-red-500 text-white text-[9px] font-black uppercase px-4 py-1 rounded-bl-2xl shadow-sm">{t.urgentTag}</div>
                  </div>
                )}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                    <i className="fas fa-id-badge text-2xl"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 truncate">{job.role}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{job.company || 'Private Employer'}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                    <span className="text-[10px] font-black text-green-600 uppercase">{t.salaryLabel}</span>
                    <span className="text-sm font-black text-green-700 font-mono">{job.salary || t.negotiable}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <i className="fas fa-location-dot text-xs"></i>
                    </div>
                    <span className="text-xs font-bold truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <i className="fas fa-globe text-xs"></i>
                    </div>
                    <span className="text-[10px] font-black uppercase">{job.source}</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <a 
                    href={`tel:${(job.contact || '').replace(/\s/g, '')}`} 
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-lg active:scale-95"
                  >
                    <i className="fas fa-phone-volume"></i> {job.contact}
                  </a>
                  {job.link && (
                    <a 
                      href={job.link} 
                      target="_blank" 
                      className="w-14 h-14 bg-white border border-slate-200 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-50 transition shadow-sm"
                    >
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200 text-center">
               <i className="fas fa-folder-open text-slate-300 text-5xl mb-4"></i>
               <p className="text-slate-400 font-black uppercase tracking-widest text-sm">{t.noJobsFound}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10"><i className="fas fa-circle-info text-8xl"></i></div>
         <h4 className="font-black text-lg mb-2">{t.applicationAdviceTitle}</h4>
         <p className="text-blue-100 text-sm leading-relaxed italic">
           "{t.applicationAdviceDesc}"
         </p>
      </div>
    </div>
  );
};

export default JobPortal;
