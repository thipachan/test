
import React, { useState } from 'react';
import { UserSkills, Language } from '../types';
import { locales } from '../locales';

interface SkillFormProps {
  onSubmit: (skills: UserSkills) => void;
  isLoading: boolean;
  lang: Language;
}

const SkillForm: React.FC<SkillFormProps> = ({ onSubmit, isLoading, lang }) => {
  const t = locales[lang];
  const [formData, setFormData] = useState<UserSkills>({
    hasBike: false,
    hasCar: false,
    hasTuktuk: false,
    hasSmartphone: true,
    physicalStrength: false,
    languages: [],
    education: t.educationSecondary
  });

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
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">{t.startZero}</h2>
        <p className="text-blue-100 text-sm">{t.answerQuestions}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <i className="fas fa-toolbox text-blue-500"></i> {t.assets}
            </h3>
            
            <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${formData.hasBike ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <i className="fas fa-motorcycle text-xl text-slate-600"></i>
                <span className="font-medium">{t.bike}</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-blue-600"
                checked={formData.hasBike}
                onChange={() => setFormData(p => ({...p, hasBike: !p.hasBike}))}
              />
            </label>

            <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${formData.hasTuktuk ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <i className="fas fa-shuttle-van text-xl text-slate-600"></i>
                <span className="font-medium">{t.tuktuk}</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-blue-600"
                checked={formData.hasTuktuk}
                onChange={() => setFormData(p => ({...p, hasTuktuk: !p.hasTuktuk}))}
              />
            </label>

            <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${formData.hasCar ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <i className="fas fa-car text-xl text-slate-600"></i>
                <span className="font-medium">{t.car}</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-blue-600"
                checked={formData.hasCar}
                onChange={() => setFormData(p => ({...p, hasCar: !p.hasCar}))}
              />
            </label>

            <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${formData.hasSmartphone ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <i className="fas fa-mobile-screen-button text-xl text-slate-600"></i>
                <span className="font-medium">{t.smartphone}</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-blue-600"
                checked={formData.hasSmartphone}
                onChange={() => setFormData(p => ({...p, hasSmartphone: !p.hasSmartphone}))}
              />
            </label>

            <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${formData.physicalStrength ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <i className="fas fa-person-digging text-xl text-slate-600"></i>
                <span className="font-medium">{t.strong}</span>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-blue-600"
                checked={formData.physicalStrength}
                onChange={() => setFormData(p => ({...p, physicalStrength: !p.physicalStrength}))}
              />
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <i className="fas fa-language text-blue-500"></i> {t.knownLanguages}
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Lao', 'Thai', 'English', 'Chinese'].map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLanguage(l)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${formData.languages.includes(l) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}
                >
                  {l}
                </button>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-slate-800 pt-2">{t.educationLevel}</h3>
            <select 
              className="w-full p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.education}
              onChange={(e) => setFormData(p => ({...p, education: e.target.value}))}
            >
              <option value={t.educationPrimary}>{t.educationPrimary}</option>
              <option value={t.educationSecondary}>{t.educationSecondary}</option>
              <option value={t.educationVocational}>{t.educationVocational}</option>
              <option value={t.educationBachelor}>{t.educationBachelor}</option>
            </select>
          </div>
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition transform active:scale-[0.98] flex items-center justify-center gap-2 ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
        >
          {isLoading ? t.loading : t.btnViewPlan}
        </button>
      </form>
    </div>
  );
};

export default SkillForm;
