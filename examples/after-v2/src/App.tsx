import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ArrowLeft, Printer } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Header } from './features/cv-optimizer/components';
import { analyzeAndOptimizeCV } from './features/cv-optimizer/services/cvService';
import { useCVStore } from './features/cv-optimizer/store/useCVStore';

const ResumeForm = lazy(() =>
  import('./features/cv-optimizer/components/ResumeForm').then((m) => ({
    default: m.ResumeForm,
  })),
);
const ResumePreview = lazy(() =>
  import('./features/cv-optimizer/components/ResumePreview').then((m) => ({
    default: m.ResumePreview,
  })),
);
const MarketInsights = lazy(() =>
  import('./features/cv-optimizer/components/MarketInsights').then((m) => ({
    default: m.MarketInsights,
  })),
);

function PageLoader() {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function App() {
  const { t } = useTranslation();
  const { result, isLoading, error, setResult, setLoading, setError, reset } = useCVStore();

  const handleProcessCV = async (text: string, additionalSkills: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeAndOptimizeCV(text, additionalSkills);
      setResult(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[CVOptimizer] Analysis failed:', message);
      setError(t('errors.analysisFailed'));
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
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!result ? (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 w-full">
              <Suspense fallback={<PageLoader />}>
                <ResumeForm onSubmit={handleProcessCV} isLoading={isLoading} />
              </Suspense>
            </div>
            <div className="w-full md:w-80 lg:w-96 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2">{t('results.howItWorks')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t('results.howItWorksDescription')}
                </p>
              </div>
              <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-indigo-200 text-xs font-bold mb-1 uppercase tracking-wider">
                  {t('results.whyGrenobleTag')}
                </div>
                <h3 className="font-bold text-lg mb-2">{t('results.whyGrenobleTitle')}</h3>
                <p className="text-indigo-50 text-xs leading-relaxed opacity-90">
                  {t('results.whyGrenobleDescription')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center no-print">
              <button
                onClick={() => reset()}
                className={cn(
                  'flex items-center gap-2 text-slate-500 font-medium transition-colors',
                  'hover:text-indigo-600',
                )}
              >
                <ArrowLeft className="w-5 h-5" />
                {t('results.editSource')}
              </button>
              <button
                onClick={handlePrint}
                className={cn(
                  'bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold transition-all',
                  'hover:bg-slate-800 flex items-center gap-2',
                )}
              >
                <Printer className="w-5 h-5" />
                {t('results.print')}
              </button>
            </div>

            <div className="no-print">
              <Suspense fallback={<PageLoader />}>
                <MarketInsights insight={result.insight} />
              </Suspense>
            </div>

            <div id="cv-preview">
              <Suspense fallback={<PageLoader />}>
                <ResumePreview data={result.updatedCV} />
              </Suspense>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
}
