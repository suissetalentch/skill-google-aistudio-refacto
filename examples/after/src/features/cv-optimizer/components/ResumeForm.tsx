import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { cvFormSchema, type CVFormData } from '../schemas/cvForm';
import { CV_PLACEHOLDER, LOADING_STEPS, LOADING_INTERVAL_MS } from '../constants/defaults';
import { useCVStore } from '../store/useCVStore';

interface ResumeFormProps {
  onSubmit: (data: CVFormData) => void;
}

export function ResumeForm({ onSubmit }: ResumeFormProps) {
  const { t } = useTranslation();
  const { isLoading } = useCVStore();
  const [msgIdx, setMsgIdx] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CVFormData>({
    resolver: zodResolver(cvFormSchema),
    defaultValues: { cvText: '', additionalSkills: '' },
  });

  useEffect(() => {
    if (!isLoading) {
      setMsgIdx(0);
      return;
    }
    const interval = window.setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % LOADING_STEPS.length);
    }, LOADING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">{t('form.title')}</h2>
        <p className="text-slate-500 mt-1">{t('form.description')}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t('form.cvLabel')}
          </label>
          <textarea
            className="w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono text-sm"
            placeholder={CV_PLACEHOLDER}
            disabled={isLoading}
            {...register('cvText')}
          />
          {errors.cvText && (
            <p className="text-red-500 text-sm mt-1">{errors.cvText.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t('form.skillsLabel')}
          </label>
          <input
            type="text"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            placeholder={t('form.skillsPlaceholder')}
            disabled={isLoading}
            {...register('additionalSkills')}
          />
          <p className="mt-1.5 text-xs text-slate-400">{t('form.skillsHint')}</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'relative w-full py-4 px-6 rounded-xl font-semibold text-white',
            'transition-all overflow-hidden flex items-center justify-center gap-3',
            isLoading
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.98]',
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-white animate-spin" />
              <span className="text-sm font-bold tracking-wide">
                {t(LOADING_STEPS[msgIdx])}
              </span>
            </div>
          ) : (
            <>
              {t('form.submitButton')}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
