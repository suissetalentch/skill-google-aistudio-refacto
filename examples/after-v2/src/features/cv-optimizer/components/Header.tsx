import { useTranslation } from 'react-i18next';
import { Briefcase } from 'lucide-react';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              {t('header.title')}
            </h1>
          </div>
          <div className="text-sm text-slate-500 font-medium hidden sm:block">
            {t('header.subtitle')}
          </div>
        </div>
      </div>
    </header>
  );
}
