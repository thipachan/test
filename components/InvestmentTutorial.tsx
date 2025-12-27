
import React, { useState } from 'react';
import { Language } from '../types';
import { locales } from '../locales';

interface InvestmentTutorialProps {
  lang: Language;
  onClose: () => void;
}

const InvestmentTutorial: React.FC<InvestmentTutorialProps> = ({ lang, onClose }) => {
  const t = locales[lang];
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: t.marketInsights,
      desc: t.tutorialInvestStep1,
      icon: "fa-chart-line",
      color: "bg-blue-600"
    },
    {
      title: t.calculator,
      desc: t.tutorialInvestStep2,
      icon: "fa-calculator",
      color: "bg-slate-900"
    },
    {
      title: t.investTitle,
      desc: t.tutorialInvestStep3,
      icon: "fa-sack-dollar",
      color: "bg-green-600"
    },
    {
      title: t.option,
      desc: t.tutorialInvestStep4,
      icon: "fa-circle-check",
      color: "bg-amber-500"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 text-white flex items-center justify-center hover:bg-black/20 transition z-10"
        >
          <i className="fas fa-times text-xs"></i>
        </button>

        <div className={`p-10 ${steps[step].color} text-white flex flex-col items-center justify-center text-center transition-colors duration-500`}>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-inner animate-pulse">
            <i className={`fas ${steps[step].icon}`}></i>
          </div>
          <h2 className="text-xl font-black mb-3 leading-tight uppercase tracking-tight">{steps[step].title}</h2>
          <p className="text-white/80 text-xs leading-relaxed max-w-[240px] mx-auto">
            {steps[step].desc}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex justify-center gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-slate-800' : 'w-1.5 bg-slate-200'}`}
              ></div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition active:scale-95 flex items-center justify-center gap-2 ${steps[step].color}`}
            >
              {step === steps.length - 1 ? t.btnGotIt : t.btnNext}
              <i className="fas fa-arrow-right text-xs opacity-50"></i>
            </button>
            
            {step < steps.length - 1 && (
              <button 
                onClick={onClose}
                className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition"
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

export default InvestmentTutorial;
