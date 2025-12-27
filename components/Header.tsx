
import React from 'react';
import { Language } from '../types';
import { locales } from '../locales';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ lang, setLang }) => {
  const t = locales[lang];
  return (
    <header className="bg-white border-b border-slate-200 py-4 px-4 shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
            <i className="fas fa-hand-holding-dollar text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.appName} <span className="text-blue-600">Pro</span></h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{t.appTagline}</p>
          </div>
        </div>
        
        <div className="flex items-center bg-slate-100 rounded-full p-1">
          {(['lo', 'th', 'en'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${lang === l ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
