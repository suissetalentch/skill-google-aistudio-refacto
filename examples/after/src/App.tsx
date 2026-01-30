import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ArrowLeft, Printer, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Header } from './features/cv-optimizer/components';
import { useCVStore } from './features/cv-optimizer/store/useCVStore';
import { analyzeCV } from './features/cv-optimizer/services/cvService';
import type { CVFormData } from './features/cv-optimizer/schemas/cvForm';

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
  const { t } = useTranslation();

  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" aria-hidden="true" />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
}

export function App() {
  const { t } = useTranslation();
  const { result, error, status, setPending, setResult, setError, reset } = useCVStore();
  const isPending = status === 'pending';

  const handleSubmit = async (data: CVFormData) => {
    setPending();
    try {
      const response = await analyzeCV(data.cvText, data.additionalSkills ?? '');
      setResult(response);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('errors.analysisFailed');
      console.error('[App] Analysis failed:', message);
      setError(message);
    }
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {!result ? (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 w-full">
              <Suspense fallback={<PageLoader />}>
                <ResumeForm onSubmit={handleSubmit} />
              </Suspense>
            </div>
            <div className="w-full md:w-80 lg:w-96 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2">{t('sidebar.howItWorks')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t('sidebar.howItWorksDesc')}
                </p>
              </div>
              <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-indigo-200 text-xs font-bold mb-1 uppercase tracking-wider">
                  {t('sidebar.whyGrenoble')}
                </div>
                <h3 className="font-bold text-lg mb-2">{t('sidebar.whyGrenobleTitle')}</h3>
                <p className="text-indigo-50 text-xs leading-relaxed opacity-90">
                  {t('sidebar.whyGrenobleDesc')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center no-print">
              <button
                onClick={reset}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                aria-label={t('form.backButton')}
              >
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                {t('form.backButton')}
              </button>
              <button
                onClick={() => window.print()}
                className={cn(
                  'bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold',
                  'hover:bg-slate-800 transition-all flex items-center gap-2',
                )}
                aria-label={t('form.printButton')}
              >
                <Printer className="w-5 h-5" aria-hidden="true" />
                {t('form.printButton')}
              </button>
            </div>

            <div className="no-print">
              <Suspense fallback={<PageLoader />}>
                <MarketInsights insight={result.insight} />
              </Suspense>
            </div>

            <Suspense fallback={<PageLoader />}>
              <ResumePreview data={result.updatedCV} />
            </Suspense>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
