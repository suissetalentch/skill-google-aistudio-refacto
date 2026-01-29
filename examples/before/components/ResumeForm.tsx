
import React, { useState, useEffect } from 'react';

interface ResumeFormProps {
  onSubmit: (text: string, additionalSkills: string) => void;
  isLoading: boolean;
}

const DEFAULT_CV = `Abdel-Hadi BENHAMMOU
Responsable Secteur Vente
abdelhadi.ben@icloud.com | +33 6 74 86 76 03
Grenoble, FRANCE

EXPÉRIENCES:
- Pill' à l'heure (Challenge Start'up): 09/2022 - 02/2023. Création start-up livraison médicaments.
- Rush-Rallly (Associatif): 05/2022 - 05/2023. Création rallye privé Europe.
- Flex Cuisine (Adjoint responsable): 12/2021 - Actuellement. Pilotage stratégique, management équipe.
- UMB Network: 09/2020-09/2021. Assistant directeur commercial.
- SSP Province: 09/2018-11/2019. Assistant Manager.
- ENEDIS: 09/2016 - 08/2018. Assistant Service.
- Ministère des armées: 11/2016 - 07/2017.

FORMATION:
- MBWay: Master 2 Management, Commerce et Entrepreneuriat (Diplôme Obtenu)
- PPA Business School: Master 1 Stratégies Communication Marketing
- Groupe Alternance: Bachelor Management
- Maestris Sup: BTS Assistant Manager`;

const LOADING_MESSAGES = [
  "Analyse de votre profil Master 2...",
  "Suppression de l'expérience Hotel Meylan...",
  "Actualisation de votre poste chez Flex...",
  "Scrutage du marché de l'emploi à Grenoble...",
  "Optimisation pour les algorithmes ATS...",
  "Calcul de votre potentiel salarial cadre...",
  "Génération du design premium...",
  "Finalisation de votre stratégie de carrière..."
];

const ResumeForm: React.FC<ResumeFormProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState(DEFAULT_CV);
  const [extraSkills, setExtraSkills] = useState('');
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (isLoading) {
      interval = window.setInterval(() => {
        setMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1800);
    } else {
      setMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text, extraSkills);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Optimiseur de Carrière - Grenoble</h2>
        <p className="text-slate-500 mt-1">Vos données ont été actualisées (Master 2 Obtenu). Cliquez sur "Optimiser".</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Contenu principal du CV
          </label>
          <textarea
            className="w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono text-sm"
            placeholder="Collez votre CV ici..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Compétences Additionnelles (optionnel)
          </label>
          <input
            type="text"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            placeholder="Ex: Permis B, Photoshop, Management Agile, SQL..."
            value={extraSkills}
            onChange={(e) => setExtraSkills(e.target.value)}
            disabled={isLoading}
          />
          <p className="mt-1.5 text-xs text-slate-400">Séparez les compétences par des virgules.</p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <p className="text-xs font-bold text-indigo-800 mb-2 uppercase tracking-wider">Statut & Demandes :</p>
          <ul className="text-xs text-indigo-700 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Profil Jeune Diplômé Master 2 (Cadre Isère)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              Suppression auto de "Comfort Hotel Meylan"
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              Expérience "Flex" mise à jour à ce jour
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className={`relative w-full py-4 px-6 rounded-xl font-semibold text-white transition-all overflow-hidden flex items-center justify-center gap-3 ${
            isLoading || !text.trim()
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-1 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm font-bold tracking-wide">
                  {LOADING_MESSAGES[msgIdx]}
                </span>
              </div>
              <div className="w-48 h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-700 ease-in-out" 
                  style={{ width: `${((msgIdx + 1) / LOADING_MESSAGES.length) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <>
              Optimiser mon profil Graduate & Voir les salaires
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ResumeForm;
