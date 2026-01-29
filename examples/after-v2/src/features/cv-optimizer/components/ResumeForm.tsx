import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { cvFormSchema, type CVFormData } from '../schemas/cvForm';
import { CV_PLACEHOLDER, LOADING_MESSAGES } from '../constants/defaults';

interface ResumeFormProps {
  onSubmit: (text: string, additionalSkills: string) => void;
  isLoading: boolean;
}

export function ResumeForm({ onSubmit, isLoading }: ResumeFormProps) {
  const { t } = useTranslation();
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

  const onFormSubmit = (data: CVFormData) => {
    onSubmit(data.cvText, data.additionalSkills ?? '');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">{t('form.title')}</h2>
        <p className="text-slate-500 mt-1">{t('form.subtitle')}</p>
      </div>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t('form.cvLabel')}
          </label>
          <textarea
            className={cn(
              'w-full h-80 p-4 bg-slate-50 border rounded-xl transition-all resize-none font-mono text-sm',
              'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              errors.cvText ? 'border-red-300' : 'border-slate-200',
            )}
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
            className={cn(
              'w-full p-4 bg-slate-50 border rounded-xl transition-all text-sm',
              'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              errors.additionalSkills ? 'border-red-300' : 'border-slate-200',
            )}
            placeholder={t('form.skillsPlaceholder')}
            disabled={isLoading}
            {...register('additionalSkills')}
          />
          {errors.additionalSkills && (
            <p className="text-red-500 text-sm mt-1">{errors.additionalSkills.message}</p>
          )}
          <p className="mt-1.5 text-xs text-slate-400">{t('form.skillsHint')}</p>
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <p className="text-xs font-bold text-indigo-800 mb-2 uppercase tracking-wider">
            {t('form.statusTitle')}
          </p>
          <ul className="text-xs text-indigo-700 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              {t('form.statusGraduate')}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              {t('form.statusRemoveHotel')}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              {t('form.statusUpdateFlex')}
            </li>
          </ul>
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
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
                <span className="text-sm font-bold tracking-wide">
                  {t(LOADING_MESSAGES[msgIdx])}
                </span>
              </div>
              <div className="w-48 h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-700 ease-in-out"
                  style={{ width: `${((msgIdx + 1) / LOADING_MESSAGES.length) * 100}%` }}
                />
              </div>
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
