
import React, { useState } from 'react';
import Header from './components/Header';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import MarketInsights from './components/MarketInsights';
import { analyzeAndOptimizeCV } from './services/geminiService';
import { AnalysisResponse } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcessCV = async (text: string, additionalSkills: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeAndOptimizeCV(text, additionalSkills);
      setResult(data);
      // Smooth scroll to top when result arrives
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError("Une erreur est survenue lors de l'analyse. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {!result ? (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 w-full">
              <ResumeForm onSubmit={handleProcessCV} isLoading={loading} />
            </div>
            <div className="w-full md:w-80 lg:w-96 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2">Comment ça marche ?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Notre IA analyse votre profil actuel, applique les modifications demandées (Flex / Comfort Hotel), 
                  et scrute le marché de l'emploi à <strong>Grenoble</strong> en temps réel pour vous suggérer le poste le plus lucratif.
                </p>
              </div>
              <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-indigo-200 text-xs font-bold mb-1 uppercase tracking-wider">Pourquoi Grenoble ?</div>
                <h3 className="font-bold text-lg mb-2">La Silicon Valley Française</h3>
                <p className="text-indigo-50 text-xs leading-relaxed opacity-90">
                  Avec le CEA, Schneider Electric et STMicroelectronics, la cuvette grenobloise offre des salaires premium pour les profils qualifiés.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center no-print">
              <button
                onClick={() => setResult(null)}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Modifier mon CV source
              </button>
              <button
                onClick={handlePrint}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Imprimer mon CV
              </button>
            </div>
            
            <div className="no-print">
              <MarketInsights insight={result.insight} />
            </div>
            
            <div id="cv-preview">
              <ResumePreview data={result.updatedCV} />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Grenoble Career Scout. Propulsé par Gemini AI pour des opportunités alpines.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
