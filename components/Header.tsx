
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { locales } from '../locales';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ lang, setLang }) => {
  const t = locales[lang];
  const [deviceIdentity, setDeviceIdentity] = useState<{ id: string, type: string }>({ id: '', type: '' });

  useEffect(() => {
    // Generate or retrieve a persistent Device ID
    let deviceId = localStorage.getItem('lao_income_device_id_v1');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('lao_income_device_id_v1', deviceId);
    }

    // Simple device type detection
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
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.appName} <span className="text-blue-600">Pro</span></h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{t.appTagline}</p>
          </div>
          {/* Device Profile Badge for Mobile View */}
          <div className="sm:hidden flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
            <i className={`fas ${getDeviceIcon()} text-blue-500 text-[10px]`}></i>
            <span className="text-[9px] font-black text-slate-400 font-mono tracking-widest">#{deviceIdentity.id}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Device Profile Badge for Desktop View */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shadow-inner">
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-blue-500 shadow-sm">
              <i className={`fas ${getDeviceIcon()} text-[10px]`}></i>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Device Identity</p>
              <p className="text-[10px] font-black text-slate-900 font-mono tracking-widest leading-none">#{deviceIdentity.id}</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 rounded-full p-1">
            {(['lo', 'th', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${lang === l ? 'bg-white text-blue-600 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'}`}
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
