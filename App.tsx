
import React, { useState, useEffect } from 'react';
import { UserSkills, IncomePlan, Language } from './types';
import { generatePersonalizedPlan } from './services/geminiService';
import { locales } from './locales';

// Sub-components
import Header from './components/Header';
import Home from './components/Home';
import SkillForm from './components/SkillForm';
import PlanDisplay from './components/PlanDisplay';
import LocalResources from './components/LocalResources';
import DailyTracker from './components/DailyTracker';
import InvestmentGuide from './components/InvestmentGuide';
import BusinessAnalysis from './components/BusinessAnalysis';
import MarketingStrategy from './components/MarketingStrategy';
import StockInvestment from './components/StockInvestment';
import OnboardingTour from './components/OnboardingTour';

type Tab = 'home' | 'plan' | 'invest' | 'analyze' | 'marketing' | 'stock' | 'resources' | 'tracker';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('lo');
  const [skills, setSkills] = useState<UserSkills | null>(null);
  const [plan, setPlan] = useState<IncomePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const t = locales[lang];

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed_v1');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('onboarding_completed_v1', 'true');
    setShowOnboarding(false);
  };

  const handleGeneratePlan = async (userSkills: UserSkills) => {
    setLoading(true);
    setError(null);
    setRetryAction(() => () => handleGeneratePlan(userSkills));
    try {
      setSkills(userSkills);
      const generatedPlan = await generatePersonalizedPlan(userSkills, lang);
      setPlan(generatedPlan);
      setActiveTab('plan');
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-slate-600 font-bold italic text-lg">{t.loading}</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return <Home onNavigate={(tab) => setActiveTab(tab)} lang={lang} />;
      case 'plan':
        return !skills ? (
          <SkillForm onSubmit={handleGeneratePlan} isLoading={loading} lang={lang} />
        ) : (
          <PlanDisplay plan={plan!} onReset={() => setSkills(null)} lang={lang} />
        );
      case 'invest':
        return <InvestmentGuide lang={lang} />;
      case 'analyze':
        return <BusinessAnalysis lang={lang} />;
      case 'marketing':
        return <MarketingStrategy lang={lang} />;
      case 'stock':
        return <StockInvestment lang={lang} />;
      case 'resources':
        return <LocalResources lang={lang} />;
      case 'tracker':
        return <DailyTracker target={200000} lang={lang} />;
      default:
        return <Home onNavigate={setActiveTab} lang={lang} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <Header lang={lang} setLang={setLang} />
      
      {showOnboarding && <OnboardingTour lang={lang} onComplete={handleCompleteOnboarding} />}

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Guest Mode Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2 bg-blue-50 border border-blue-100 py-2 rounded-2xl animate-fadeIn">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
            {lang === 'lo' ? 'ໂໝດອອຟລາຍ: ຂໍ້ມູນຖືກບັນທຶກໄວ້ໃນເຄື່ອງນີ້ແລ້ວ' : (lang === 'th' ? 'โหมดออฟไลน์: บันทึกข้อมูลในเครื่องนี้แล้ว' : 'Guest Mode: Data saved to this device')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-[32px] flex flex-col sm:flex-row items-center gap-6 mb-8 shadow-xl shadow-red-900/5 animate-fadeIn">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
              <i className="fas fa-triangle-exclamation text-2xl"></i>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-black text-lg mb-1">{t.errorOccurred}</h4>
              <p className="text-sm text-red-600/80">{error}</p>
            </div>
            {retryAction && (
              <button 
                onClick={() => { setError(null); retryAction(); }}
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-200 active:scale-95 whitespace-nowrap"
              >
                <i className="fas fa-rotate-right mr-2"></i> {t.retry}
              </button>
            )}
          </div>
        )}

        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-2 py-3 z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar">
        <div className="max-w-5xl mx-auto flex justify-around items-center min-w-max px-4">
          {[
            { id: 'home', icon: 'fa-house', label: t.navHome },
            { id: 'plan', icon: 'fa-hand-holding-dollar', label: t.navEarn },
            { id: 'invest', icon: 'fa-chart-line', label: t.navInvest },
            { id: 'stock', icon: 'fa-chart-simple', label: t.navStock },
            { id: 'analyze', icon: 'fa-magnifying-glass-chart', label: t.navAnalyze },
            { id: 'marketing', icon: 'fa-bullhorn', label: t.navMarketing },
            { id: 'tracker', icon: 'fa-wallet', label: t.navTrack }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setError(null); setActiveTab(item.id as Tab); }}
              className={`flex flex-col items-center gap-1 min-w-[64px] transition-all duration-300 ${activeTab === item.id ? 'text-blue-600 transform scale-110' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeTab === item.id ? 'bg-blue-50' : 'bg-transparent'}`}>
                <i className={`fas ${item.icon} text-lg`}></i>
              </div>
              <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
              {activeTab === item.id && <div className="w-4 h-1 bg-blue-600 rounded-full mt-0.5 animate-pulse"></div>}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
