
import React from 'react';
import { Language } from '../types';
import { locales } from '../locales';

interface LocalResourcesProps {
  lang: Language;
}

const LocalResources: React.FC<LocalResourcesProps> = ({ lang }) => {
  const t = locales[lang];

  const resources = [
    {
      name: "Foodpanda Laos",
      type: "Delivery",
      link: "https://www.foodpanda.la/",
      icon: "fa-person-biking",
      desc: t.fpDesc
    },
    {
      name: "Loca Laos",
      type: "Taxi/Delivery",
      link: "https://loca.la/",
      icon: "fa-car",
      desc: t.locaDesc
    },
    {
      name: lang === 'en' ? "Job Search Laos (Facebook)" : "ຊອກຫາວຽກໃນລາວ (Facebook)",
      type: "Social Media",
      link: "https://www.facebook.com/groups/jobslaos",
      icon: "fa-facebook",
      desc: t.fbDesc
    },
    {
      name: "108Jobs",
      type: "Job Board",
      link: "https://108.jobs/",
      icon: "fa-briefcase",
      desc: t.jobs108Desc
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">{t.resourceTitle}</h2>
        <p className="text-sm text-slate-500">{t.resourceSub}</p>
      </div>
      <div className="divide-y divide-slate-50">
        {resources.map((res, i) => (
          <a 
            key={i} 
            href={res.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center p-6 hover:bg-slate-50 transition group"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition shrink-0">
              <i className={`fas ${res.icon} text-xl`}></i>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-slate-900">{res.name}</h3>
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase font-bold">{res.type}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{res.desc}</p>
            </div>
            <i className="fas fa-chevron-right text-slate-300 ml-4 group-hover:text-blue-500 group-hover:translate-x-1 transition"></i>
          </a>
        ))}
      </div>
    </div>
  );
};

export default LocalResources;
