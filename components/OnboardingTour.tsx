
import React, { useState } from 'react';
import { Language } from '../types';
import { locales } from '../locales';

interface OnboardingTourProps {
  lang: Language;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ lang, onComplete }) => {
  const t = locales[lang];
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: t.onboardingWelcome,
      desc: t.homeDesc,
      icon: "fa-hand-holding-dollar",
      color: "bg-blue-600"
    },
    {
      title: t.onboardingStep1Title,
      desc: t.onboardingStep1Desc,
      icon: "fa-route",
      color: "bg-blue-500"
    },
    {
      title: t.onboardingStep2Title,
      desc: t.onboardingStep2Desc,
      icon: "fa-chart-line",
      color: "bg-green-500"
    },
    {
      title: t.onboardingStep3Title,
      desc: t.onboardingStep3Desc,
      icon: "fa-magnifying-glass-chart",
      color: "bg-purple-500"
    },
    {
      title: t.onboardingStep4Title,
      desc: t.onboardingStep4Desc,
      icon: "fa-wallet",
      color: "bg-orange-500"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden relative">
        <div className={`p-12 ${steps[step].color} text-white flex flex-col items-center justify-center text-center transition-colors duration-500`}>
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-5xl mb-6 animate-bounce">
            <i className={`fas ${steps[step].icon}`}></i>
          </div>
          <h2 className="text-3xl font-black mb-4 leading-tight">{steps[step].title}</h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-[280px]">
            {steps[step].desc}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-slate-800' : 'w-2 bg-slate-200'}`}
              ></div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition active:scale-95 ${steps[step].color}`}
            >
              {step === steps.length - 1 ? t.btnFinish : t.btnNext}
            </button>
            
            {step < steps.length - 1 && (
              <button
                onClick={onComplete}
                className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition"
              >
                {t.btnSkip}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
