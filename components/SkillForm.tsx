
import React, { useState } from 'react';
import { UserSkills, Language } from '../types';
import { locales } from '../locales';

interface SkillFormProps {
  onSubmit: (skills: UserSkills) => void;
  isLoading: boolean;
  lang: Language;
  isOnline: boolean;
}

const SkillForm: React.FC<SkillFormProps> = ({ onSubmit, isLoading, lang, isOnline }) => {
  const t = locales[lang];
  const [formData, setFormData] = useState<UserSkills>({
    hasBike: false,
    hasCar: false,
    hasTuktuk: false,
    hasSmartphone: true,
    hasLaptop: false,
    hasLicense: false,
    physicalStrength: false,
    whatsappSkill: false,
    tiktokSkill: false,
    bcelOneSkill: false,
    contentCreationSkill: false,
    marketplaceSkill: false,
    aiSkill: false,
    cookingSkill: false,
    accountingSkill: false,
    salesSkill: false,
    deliverySkill: false,
    languages: [],
    education: t.educationSecondary
  });

  const handleZeroCapital = () => {
    const zeroSkills: UserSkills = {
      ...formData,
      hasBike: false,
      hasCar: false,
      hasTuktuk: false,
      hasLaptop: false,
      hasLicense: false,
      physicalStrength: true, // Assume ready to work
      hasSmartphone: true // Most people have at least a basic smartphone
    };
    setFormData(zeroSkills);
    onSubmit(zeroSkills);
  };

  const toggleLanguage = (l: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(l) 
        ? prev.languages.filter(item => item !== l)
        : [...prev.languages, l]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden animate-fadeIn">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <i className="fas fa-hand-holding-dollar text-[120px]"></i>
        </div>
        <h2 className="text-3xl font-black mb-2 relative z-10">{t.startZero}</h2>
        <p className="text-blue-100 text-sm relative z-10">{t.answerQuestions}</p>
        
        {/* Quick Start Zero Capital Button */}
        <button 
          type="button"
          onClick={handleZeroCapital}
          className="mt-6 bg-yellow-400 hover:bg-yellow-300 text-slate-900 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 flex items-center gap-3 relative z-10"
        >
          <i className="fas fa-bolt"></i> {t.zeroCapitalHelp}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-10 space-y-12">
        <div className="space-y-12">
          {/* Physical Assets & Equipment */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-toolbox"></i>
              </div>
              {t.assets}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'hasBike', label: t.bike, icon: 'fa-motorcycle' },
                { id: 'hasTuktuk', label: t.tuktuk, icon: 'fa-shuttle-van' },
                { id: 'hasCar', label: t.car, icon: 'fa-car' },
                { id: 'hasSmartphone', label: t.smartphone, icon: 'fa-mobile-screen-button' },
                { id: 'hasLaptop', label: t.laptop, icon: 'fa-laptop' },
                { id: 'hasLicense', label: t.license, icon: 'fa-id-card' },
                { id: 'physicalStrength', label: t.strong, icon: 'fa-person-digging' }
              ].map(asset => (
                <label 
                  key={asset.id}
                  className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData[asset.id as keyof UserSkills] ? 'bg-blue-50 border-blue-500 ring-4 ring-blue-500/5' : 'border-slate-50 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <i className={`fas ${asset.icon} text-xl ${formData[asset.id as keyof UserSkills] ? 'text-blue-600' : 'text-slate-300'}`}></i>
                    <span className={`text-sm font-bold ${formData[asset.id as keyof UserSkills] ? 'text-blue-900' : 'text-slate-500'}`}>{asset.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData[asset.id as keyof UserSkills] ? 'bg-blue-600 border-blue-600' : 'border-slate-200'}`}>
                    {formData[asset.id as keyof UserSkills] && <i className="fas fa-check text-white text-[8px]"></i>}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={formData[asset.id as keyof UserSkills] as boolean}
                    onChange={() => setFormData(p => ({...p, [asset.id]: !p[asset.id as keyof UserSkills]}))}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Digital Skills */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-microchip"></i>
              </div>
              Digital {lang === 'lo' ? 'ທັກສະ' : 'Skills'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'whatsappSkill', label: t.whatsappSkill, icon: 'fab fa-whatsapp', color: 'text-green-500' },
                { id: 'tiktokSkill', label: t.tiktokSkill, icon: 'fab fa-tiktok', color: 'text-slate-800' },
                { id: 'bcelOneSkill', label: t.bcelOneSkill, icon: 'fas fa-money-bill-transfer', color: 'text-blue-500' },
                { id: 'contentCreationSkill', label: t.contentCreationSkill, icon: 'fas fa-clapperboard', color: 'text-red-500' },
                { id: 'marketplaceSkill', label: t.marketplaceSkill, icon: 'fas fa-store', color: 'text-indigo-500' },
                { id: 'aiSkill', label: t.aiSkill, icon: 'fas fa-brain', color: 'text-purple-500' }
              ].map(skill => (
                <label 
                  key={skill.id}
                  className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData[skill.id as keyof UserSkills] ? 'bg-indigo-50 border-indigo-500 ring-4 ring-indigo-500/5' : 'border-slate-50 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <i className={`${skill.icon} text-xl ${formData[skill.id as keyof UserSkills] ? skill.color : 'text-slate-300'}`}></i>
                    <span className={`text-[11px] font-black leading-tight ${formData[skill.id as keyof UserSkills] ? 'text-indigo-900' : 'text-slate-500'}`}>{skill.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData[skill.id as keyof UserSkills] ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
                    {formData[skill.id as keyof UserSkills] && <i className="fas fa-check text-white text-[8px]"></i>}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={formData[skill.id as keyof UserSkills] as boolean}
                    onChange={() => setFormData(p => ({...p, [skill.id]: !p[skill.id as keyof UserSkills]}))}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Professional / Job Skills */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-briefcase"></i>
              </div>
              {t.professionalSkills}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'cookingSkill', label: t.cookingSkill, icon: 'fas fa-utensils', color: 'text-orange-500' },
                { id: 'accountingSkill', label: t.accountingSkill, icon: 'fas fa-calculator', color: 'text-blue-400' },
                { id: 'salesSkill', label: t.salesSkill, icon: 'fas fa-comments-dollar', color: 'text-emerald-500' },
                { id: 'deliverySkill', label: t.deliverySkill, icon: 'fas fa-map-location-dot', color: 'text-red-400' }
              ].map(skill => (
                <label 
                  key={skill.id}
                  className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData[skill.id as keyof UserSkills] ? 'bg-green-50 border-green-500 ring-4 ring-green-500/5' : 'border-slate-50 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <i className={`${skill.icon} text-xl ${formData[skill.id as keyof UserSkills] ? skill.color : 'text-slate-300'}`}></i>
                    <span className={`text-[11px] font-black leading-tight ${formData[skill.id as keyof UserSkills] ? 'text-green-900' : 'text-slate-500'}`}>{skill.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData[skill.id as keyof UserSkills] ? 'bg-green-600 border-green-600' : 'border-slate-200'}`}>
                    {formData[skill.id as keyof UserSkills] && <i className="fas fa-check text-white text-[8px]"></i>}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={formData[skill.id as keyof UserSkills] as boolean}
                    onChange={() => setFormData(p => ({...p, [skill.id]: !p[skill.id as keyof UserSkills]}))}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Languages & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-language"></i> {t.knownLanguages}
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Lao', 'Thai', 'English', 'Chinese', 'Vietnamese'].map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleLanguage(l)}
                    className={`px-5 py-3 rounded-xl text-xs font-black transition-all ${formData.languages.includes(l) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-slate-50 border border-slate-200 text-slate-500 hover:border-blue-400'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-graduation-cap"></i> {t.educationLevel}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[t.educationPrimary, t.educationSecondary, t.educationVocational, t.educationBachelor].map(edu => (
                  <button
                    key={edu}
                    type="button"
                    onClick={() => setFormData(p => ({...p, education: edu}))}
                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.education === edu ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'}`}
                  >
                    {edu}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          disabled={isLoading || !isOnline}
          type="submit"
          className={`w-full py-6 rounded-3xl font-black text-xl shadow-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 ${isLoading || !isOnline ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
        >
          {isLoading ? <i className="fas fa-spinner animate-spin"></i> : <><i className="fas fa-wand-magic-sparkles"></i> {t.btnViewPlan}</>}
        </button>
      </form>
    </div>
  );
};

export default SkillForm;
