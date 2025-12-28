
import React, { useState, useEffect } from 'react';
import { UserSkills, IncomePlan, Language, Tab, IncomeStrategy } from './types';
import { locales } from './locales';

// Sub-components
import Header from './components/Header';
import Home from './components/Home';
import SkillForm from './components/SkillForm';
import PlanDisplay from './components/PlanDisplay';
import DailyTracker from './components/DailyTracker';
import InvestmentGuide from './components/InvestmentGuide';
import BusinessAnalysis from './components/BusinessAnalysis';
import MarketingStrategy from './components/MarketingStrategy';
import StockInvestment from './components/StockInvestment';
import OnboardingTour from './components/OnboardingTour';
import DocumentGuide from './components/DocumentGuide';
import JobPortal from './components/JobPortal';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('lo');
  const [skills, setSkills] = useState<UserSkills | null>(null);
  const [plan, setPlan] = useState<IncomePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const t = locales[lang];

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed_v1');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('onboarding_completed_v1', 'true');
    setShowOnboarding(false);
  };

  const handleGeneratePlan = async (userSkills: UserSkills) => {
    setLoading(true);
    setError(null);
    setSkills(userSkills);

    try {
      let selectedPlan: IncomePlan;
      if (isOnline) {
        const { generatePersonalizedPlan } = await import('./services/geminiService');
        selectedPlan = await generatePersonalizedPlan(userSkills, lang);
      } else {
        // Fallback or alert logic could go here
        alert("Connect to internet for AI plan");
        return;
      }
      
      setPlan(selectedPlan);
      setActiveTab('plan');
    } catch (err: any) {
      console.error("Plan Generation Error:", err);
      setError(t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 mx-auto"></div>
          <p className="text-slate-600 font-black text-lg uppercase tracking-widest">{t.loading}</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return <Home onNavigate={(tab) => setActiveTab(tab)} lang={lang} />;
      case 'plan':
        return (!skills || !plan) ? (
          <SkillForm onSubmit={handleGeneratePlan} isLoading={loading} lang={lang} isOnline={isOnline} />
        ) : (
          <PlanDisplay plan={plan} onReset={() => { setSkills(null); setPlan(null); }} lang={lang} />
        );
      case 'invest':
        return <InvestmentGuide lang={lang} isOnline={isOnline} />;
      case 'analyze':
        return <BusinessAnalysis lang={lang} isOnline={isOnline} />;
      case 'marketing':
        return <MarketingStrategy lang={lang} isOnline={isOnline} />;
      case 'stock':
        return <StockInvestment lang={lang} isOnline={isOnline} />;
      case 'docs':
        return <DocumentGuide lang={lang} />;
      case 'jobs':
        return <JobPortal lang={lang} isOnline={isOnline} />;
      case 'tracker':
        return <DailyTracker target={200000} lang={lang} />;
      default:
        return <Home onNavigate={setActiveTab} lang={lang} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50 flex flex-col">
      <Header lang={lang} setLang={setLang} isOnline={isOnline} />
      
      {showOnboarding && <OnboardingTour lang={lang} onComplete={handleCompleteOnboarding} />}

      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-2 pt-3 pb-safe z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar safe-area-bottom">
        <div className="max-w-5xl mx-auto flex justify-around items-center min-w-max px-4">
          {[
            { id: 'home', icon: 'fa-house', label: t.navHome },
            { id: 'jobs', icon: 'fa-briefcase', label: t.navJobs },
            { id: 'plan', icon: 'fa-hand-holding-dollar', label: t.navEarn },
            { id: 'invest', icon: 'fa-chart-line', label: t.navInvest },
            { id: 'stock', icon: 'fa-chart-simple', label: t.navStock },
            { id: 'docs', icon: 'fa-file-contract', label: t.navDocs },
            { id: 'analyze', icon: 'fa-magnifying-glass-chart', label: t.navAnalyze },
            { id: 'marketing', icon: 'fa-bullhorn', label: t.navMarketing },
            { id: 'tracker', icon: 'fa-wallet', label: t.navTrack }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center gap-1 min-w-[64px] transition-all duration-300 ${activeTab === item.id ? 'text-blue-600 transform scale-110' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeTab === item.id ? 'bg-blue-50' : 'bg-transparent'}`}>
                <i className={`fas ${item.icon} text-lg`}></i>
              </div>
              <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
