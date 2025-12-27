
import React, { useState } from 'react';
import { analyzeBusiness } from '../services/geminiService';
import { BusinessAnalysis as IAnalysis, Language } from '../types';
import { locales } from '../locales';

interface BusinessAnalysisProps {
  lang: Language;
}

const BusinessAnalysis: React.FC<BusinessAnalysisProps> = ({ lang }) => {
  const t = locales[lang];
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<IAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    try {
      const res = await analyzeBusiness(idea, lang);
      setResult(res);
    } catch (e) {
      console.error(e);
      alert(lang === 'en' ? "Error analyzing. Try again." : "ເກີດຂໍ້ຜິດພາດ. ກະລຸນາລອງໃໝ່.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t.featureAnalyzeTitle}</h2>
        <p className="text-sm text-slate-500 mb-4">{t.featureAnalyzeDesc}</p>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder={t.analyzeIdeaPlaceholder}
          className="w-full p-4 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500 h-32 mb-4"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !idea}
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition disabled:bg-slate-300"
        >
          {loading ? t.loading : t.btnAnalyze}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fas fa-gauge-high text-purple-500"></i> {t.feasibilityScore}
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{width: `${result.feasibilityScore * 10}%`}}></div>
                </div>
                <span className="text-xl font-black text-purple-600">{result.feasibilityScore}/10</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="text-[10px] font-bold text-blue-600 uppercase mb-2">{t.strengths}</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  {result.swot.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <h4 className="text-[10px] font-bold text-red-600 uppercase mb-2">{t.weaknesses}</h4>
                <ul className="text-xs text-red-800 space-y-1">
                  {result.swot.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-2">{t.startupCost}</h4>
              <p className="text-2xl font-black text-slate-900 font-mono">{result.estimatedStartupCost}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-2">{t.actionSteps}</h4>
              <div className="space-y-2">
                {result.actionSteps.map((step, i) => (
                  <div key={i} className="flex gap-3 text-sm text-slate-600">
                    <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessAnalysis;
