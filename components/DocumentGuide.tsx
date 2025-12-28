
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { locales } from '../locales';

interface DocumentGuideProps {
  lang: Language;
}

interface DocItem {
  id: string;
  title: string;
  desc: string;
  office: string;
  phone: string;
  mapUrl: string;
  items: string[];
  type: 'required' | 'optional';
  extraTip?: string;
  timeframe?: string;
  cost?: string;
}

const DocumentGuide: React.FC<DocumentGuideProps> = ({ lang }) => {
  const t = locales[lang];
  const [activeTab, setActiveTab] = useState<'invest' | 'partnership' | 'business'>('invest');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('laoincome_doc_checklist_v2');
    if (saved) setChecklist(JSON.parse(saved));
  }, []);

  const toggleCheck = (id: string) => {
    const next = { ...checklist, [id]: !checklist[id] };
    setChecklist(next);
    localStorage.setItem('laoincome_doc_checklist_v2', JSON.stringify(next));
  };

  const investDocs: DocItem[] = [
    {
      id: 'inv_1',
      title: lang === 'lo' ? 'ການເປີດບັນຊີຊື້-ຂາຍຮຸ້ນ (LSX Account)' : 'Opening Stock Trading Account (LSX)',
      desc: lang === 'lo' ? 'ເອກະສານສຳລັບການເລີ່ມຕົ້ນລົງທຶນໃນຕະຫຼາດຫຼັກຊັບລາວ.' : 'Documents to start investing in the Lao Securities Exchange.',
      office: 'BCEL-KT Securities / Lanexang Securities',
      phone: '021 265 484',
      mapUrl: "https://www.google.com/maps/search/BCEL-KT+Securities+Vientiane",
      type: 'required',
      extraTip: lang === 'lo' ? 'ແນະນຳໃຫ້ໄປທີ່ສຳນັກງານໃຫຍ່ ຫຼື ສາຂາທີ່ໃກ້ກັບທະນາຄານຫຼັກຂອງທ່ານເພື່ອຄວາມໄວ.' : 'Go to the HQ or branch near your main bank for faster processing.',
      timeframe: '1-2 Days',
      cost: 'Free',
      items: [
        lang === 'lo' ? 'ບັດປະຈຳຕົວ ຫຼື ສຳມະໂນຄົວ (ຕົ້ນສະບັບ)' : 'ID Card or Family Book (Original)',
        lang === 'lo' ? 'ປື້ມບັນຊີທະນາຄານ (ແນະນຳ BCEL)' : 'Bank Passbook (BCEL recommended)',
        lang === 'lo' ? 'ເບີໂທລະສັບທີ່ໃຊ້ BCEL One' : 'Phone number with BCEL One'
      ]
    }
  ];

  const partnershipDocs: DocItem[] = [
    {
      id: 'part_1',
      title: lang === 'lo' ? 'ສັນຍາຮ່ວມທຶນ (Partnership Agreement)' : 'Partnership Agreement',
      desc: lang === 'lo' ? 'ເອກະສານຢັ້ງຢືນການເປັນຫຸ້ນສ່ວນລະຫວ່າງບຸກຄົນ ເພື່ອຄວາມປອດໄພທາງກົດໝາຍ.' : 'Legal document to verify partnership between individuals for legal safety.',
      office: lang === 'lo' ? 'ຫ້ອງການປົກຄອງບ້ານ (ບ່ອນດຳເນີນທຸລະກິດ)' : 'Village Administrative Office (Business Location)',
      phone: lang === 'lo' ? 'ຕິດຕໍ່ນາຍບ້ານໂດຍກົງ' : 'Contact Village Head directly',
      mapUrl: "https://www.google.com/maps/search/Village+Office+Vientiane",
      type: 'required',
      extraTip: lang === 'lo' ? 'ຕ້ອງມີພະຍານຢ່າງໜ້ອຍ 2 ຄົນ ແລະ ໃຫ້ພາກສ່ວນບ້ານເຊັນຢັ້ງຢືນຈຶ່ງຈະມີຜົນສັກສິດ.' : 'Must have at least 2 witnesses and Village authority signature to be effective.',
      timeframe: '1 Day',
      cost: '5,000 - 50,000 LAK',
      items: [
        lang === 'lo' ? 'ຮ່າງສັນຍາທີ່ມີລາຍລະອຽດການແບ່ງປັນຜົນກຳໄລ' : 'Draft agreement with profit-sharing details',
        lang === 'lo' ? 'ບັດປະຈຳຕົວຂອງຫຸ້ນສ່ວນທຸກຄົນ' : 'ID Cards of all partners',
        lang === 'lo' ? 'ໃບຢັ້ງຢືນທີ່ຢູ່ຂອງຫຸ້ນສ່ວນ' : 'Residency certificates of partners'
      ]
    }
  ];

  const businessDocs: DocItem[] = [
    {
      id: 'bus_1',
      title: t.businessRegTitle,
      desc: t.businessRegDesc,
      office: 'Department of Enterprise Registration (MOIC)',
      phone: '021 412 011',
      mapUrl: "https://www.google.com/maps/search/Department+of+Enterprise+Registration+MOIC+Vientiane",
      type: 'required',
      extraTip: t.moicExtraInfo,
      timeframe: '10-15 Working Days',
      cost: 'Varies by Capital',
      items: [
        lang === 'lo' ? 'ໃບຄຳຮ້ອງຈົດທະບຽນວິສາຫະກິດ' : 'Enterprise Registration Form',
        lang === 'lo' ? 'ລາຍຊື່ວິສາຫະກິດ 3-5 ຊື່' : 'List of 3-5 potential names',
        lang === 'lo' ? 'ແຜນວາດທີ່ຕັ້ງສຳນັກງານ' : 'Office location map',
        lang === 'lo' ? 'ສັນຍາເຊົ່າ ຫຼື ໃບຕາດິນ' : 'Lease agreement or Land title'
      ]
    },
    {
      id: 'bus_2',
      title: t.taxRegTitle,
      desc: t.taxRegDesc,
      office: lang === 'lo' ? 'ກົມສ່ວຍສາອາກອນ (ປະຈຳເມືອງ/ແຂວງ)' : 'Tax Department (District/Provincial)',
      phone: '1561 (Hotline)',
      mapUrl: "https://www.google.com/maps/search/Tax+Department+Vientiane",
      type: 'required',
      extraTip: t.taxExtraInfo,
      timeframe: '3-5 Days',
      cost: 'Stamp Fees',
      items: [
        lang === 'lo' ? 'ໃບທະບຽນວິສາຫະກິດ (ຕົ້ນສະບັບ)' : 'Enterprise Registration (Original)',
        lang === 'lo' ? 'ຕາປະທັບວິສາຫະກິດ' : 'Enterprise Stamp',
        lang === 'lo' ? 'ໃບບົດວິໄຈເສດຖະກິດ (ບາງກໍລະນີ)' : 'Economic feasibility study (In some cases)'
      ]
    }
  ];

  const categories = [
    { id: 'invest', label: t.tabInvestDocs, icon: 'fa-chart-line' },
    { id: 'partnership', label: lang === 'lo' ? 'ເປັນຫຸ້ນສ່ວນ' : 'Partnership', icon: 'fa-handshake' },
    { id: 'business', label: t.tabBusinessDocs, icon: 'fa-building' }
  ];

  const currentDocs = activeTab === 'invest' ? investDocs : (activeTab === 'partnership' ? partnershipDocs : businessDocs);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-100 shrink-0">
            <i className="fas fa-file-signature text-3xl"></i>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-black text-slate-800 mb-1">{t.docTitle}</h2>
            <p className="text-slate-500 font-medium">{t.docSub}</p>
          </div>
        </div>

        {/* Tab Selection - Improved */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100 rounded-3xl mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id as any)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-4 rounded-2xl transition-all ${activeTab === cat.id ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <i className={`fas ${cat.icon} text-sm`}></i>
              <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {currentDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-[32px] border-2 border-slate-50 hover:border-blue-100 transition-all overflow-hidden group shadow-sm">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-slate-800">{doc.title}</h3>
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${doc.type === 'required' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500'}`}>
                        {doc.type === 'required' ? t.allRequired : t.optional}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium italic">"{doc.desc}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                  {/* Submission Info */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                             <i className="fas fa-building-columns"></i>
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{t.applyAt}</p>
                             <p className="text-sm font-black text-slate-700">{doc.office}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-4">
                          <a href={doc.mapUrl} target="_blank" className="flex-1 bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black text-blue-600 hover:bg-blue-50 transition shadow-sm">
                             <i className="fas fa-location-arrow"></i> {t.btnNavigate}
                          </a>
                          <a href={`tel:${doc.phone}`} className="flex-1 bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black text-green-600 hover:bg-green-50 transition shadow-sm">
                             <i className="fas fa-phone"></i> {doc.phone}
                          </a>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
                          <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Time</p>
                          <p className="text-xs font-black text-indigo-700">{doc.timeframe}</p>
                       </div>
                       <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                          <p className="text-[9px] font-black text-amber-400 uppercase mb-1">Cost</p>
                          <p className="text-xs font-black text-amber-700">{doc.cost}</p>
                       </div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <i className="fas fa-list-check"></i> {t.docChecklist}
                    </h4>
                    <div className="space-y-2">
                      {doc.items.map((item, idx) => {
                        const checkId = `${doc.id}_${idx}`;
                        const isChecked = checklist[checkId];
                        return (
                          <div 
                            key={idx} 
                            onClick={() => toggleCheck(checkId)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group/item ${isChecked ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-transparent hover:border-blue-200'}`}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${isChecked ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-transparent'}`}>
                              <i className="fas fa-check text-[10px]"></i>
                            </div>
                            <span className={`text-xs font-bold ${isChecked ? 'text-green-700' : 'text-slate-600'}`}>{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {doc.extraTip && (
                  <div className="mt-8 bg-blue-600 p-6 rounded-3xl text-white relative overflow-hidden group-hover:scale-[1.01] transition-transform">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><i className="fas fa-wand-magic-sparkles text-5xl"></i></div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <i className="fas fa-star text-yellow-300"></i> {t.proTip}
                    </h4>
                    <p className="text-sm font-bold leading-relaxed italic">"{doc.extraTip}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer / Extra Info */}
        <div className="mt-12 p-8 bg-slate-900 rounded-[40px] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <i className="fas fa-gavel text-[120px]"></i>
          </div>
          <div className="relative z-10 space-y-4">
            <h4 className="text-xl font-black text-blue-400 flex items-center gap-3">
              <i className="fas fa-info-circle"></i> {lang === 'lo' ? 'ຂໍ້ແນະນຳເພີ່ມເຕີມ' : 'Additional Legal Guidance'}
            </h4>
            <ul className="space-y-3">
              {[
                lang === 'lo' ? 'ກວດສອບວັນໝົດອາຍຸຂອງບັດປະຈຳຕົວໃຫ້ດີກ່ອນໄປຢືນເອກະສານ.' : 'Double-check ID card expiration date before submitting.',
                lang === 'lo' ? 'ການເຮັດທຸລະກິດຮ່ວມກັນຄວນມີການເຊັນຢັ້ງຢືນທີ່ຫ້ອງການບ້ານທຸກຄັ້ງ.' : 'Business partnerships should always be verified at the Village office.',
                lang === 'lo' ? 'ເອກະສານທຸກຢ່າງຄວນມີການສຳເນົາ (Copy) ໄວ້ຢ່າງໜ້ອຍ 2 ຊຸດ.' : 'Always keep at least 2 copies of all submitted documents.'
              ].map((note, i) => (
                <li key={i} className="flex gap-4 text-xs text-slate-300 font-medium">
                  <span className="text-blue-500 font-black">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentGuide;
