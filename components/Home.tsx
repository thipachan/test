
import React from 'react';
import { Language } from '../types';
import { locales } from '../locales';

interface HomeProps {
  onNavigate: (tab: any) => void;
  lang: Language;
}

const Home: React.FC<HomeProps> = ({ onNavigate, lang }) => {
  const t = locales[lang];
  const features = [
    {
      id: 'plan',
      title: t.featureEarnTitle,
      desc: t.featureEarnDesc,
      icon: 'fa-hand-holding-dollar',
      color: 'bg-blue-500'
    },
    {
      id: 'invest',
      title: t.featureInvestTitle,
      desc: t.featureInvestDesc,
      icon: 'fa-chart-line',
      color: 'bg-green-500'
    },
    {
      id: 'stock',
      title: t.featureStockTitle,
      desc: t.featureStockDesc,
      icon: 'fa-chart-simple',
      color: 'bg-indigo-600'
    },
    {
      id: 'marketing',
      title: t.featureMarketingTitle,
      desc: t.featureMarketingDesc,
      icon: 'fa-bullhorn',
      color: 'bg-orange-500'
    },
    {
      id: 'analyze',
      title: t.featureAnalyzeTitle,
      desc: t.featureAnalyzeDesc,
      icon: 'fa-magnifying-glass-chart',
      color: 'bg-purple-500'
    },
    {
      id: 'tracker',
      title: t.featureTrackTitle,
      desc: t.featureTrackDesc,
      icon: 'fa-list-check',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center py-10">
        <h2 className="text-3xl font-black text-slate-900 mb-4">{t.homeTitle}</h2>
        <p className="text-slate-500 max-w-lg mx-auto">{t.homeDesc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <button
            key={f.id}
            onClick={() => onNavigate(f.id)}
            className="flex items-start p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition text-left group"
          >
            <div className={`${f.color} w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shrink-0 group-hover:scale-110 transition`}>
              <i className={`fas ${f.icon}`}></i>
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">{t.proverbTitle}</h3>
          <p className="text-slate-300 italic">{t.proverbContent}</p>
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-10">
          <i className="fas fa-laos text-[160px]"></i>
        </div>
      </div>
    </div>
  );
};

export default Home;
