
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { locales } from '../locales';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  isOnline: boolean;
}

const Header: React.FC<HeaderProps> = ({ lang, setLang, isOnline }) => {
  const t = locales[lang];
  const [deviceIdentity, setDeviceIdentity] = useState<{ id: string, type: string }>({ id: '', type: '' });

  useEffect(() => {
    let deviceId = localStorage.getItem('lao_income_device_id_v1');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('lao_income_device_id_v1', deviceId);
    }

    const ua = navigator.userAgent;
    let type = 'Desktop';
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      type = 'Tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      type = 'Mobile';
    }

    setDeviceIdentity({ id: deviceId, type });
  }, []);

  const getDeviceIcon = () => {
    switch (deviceIdentity.type) {
      case 'Mobile': return 'fa-mobile-screen-button';
      case 'Tablet': return 'fa-tablet-screen-button';
      default: return 'fa-desktop';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 py-4 px-4 shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
            <i className="fas fa-hand-holding-dollar text-white text-xl"></i>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
              {t.appName} <span className="text-blue-600">Pro</span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{t.appTagline}</p>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
          {/* Mobile Profile Badge */}
          <div className="sm:hidden flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
             <i className={`fas ${getDeviceIcon()} ${isOnline ? 'text-blue-500' : 'text-slate-400'} text-[10px]`}></i>
            <span className="text-[9px] font-black text-slate-500 font-mono tracking-widest">#{deviceIdentity.id}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Desktop Profile Badge */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
            <div className={`w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm ${isOnline ? 'text-blue-500' : 'text-slate-300'}`}>
              <i className={`fas ${getDeviceIcon()} text-[10px]`}></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none">Identity</p>
                <div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-400'}`}></div>
              </div>
              <p className="text-[10px] font-black text-slate-900 font-mono tracking-widest leading-none">#{deviceIdentity.id}</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 rounded-full p-1">
            {(['lo', 'th', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${lang === l ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
