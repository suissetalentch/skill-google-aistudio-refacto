import { useTranslation } from 'react-i18next';
import { BarChart3, ExternalLink } from 'lucide-react';
import type { MarketInsight } from '../types';

interface MarketInsightsProps {
  insight: MarketInsight;
}

export function MarketInsights({ insight }: MarketInsightsProps) {
  const { t } = useTranslation();

  return (
    <section aria-label={t('market.title')} className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-500/30 mb-4">
            {t('market.badge')}
          </span>
          <h2 className="text-3xl font-bold mb-2">{t('market.title')}</h2>
        </div>
        <div className="bg-white/10 p-3 rounded-xl border border-white/20">
          <BarChart3 className="w-8 h-8 text-blue-300" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-blue-200/70 text-sm uppercase tracking-wider font-semibold">
            {t('market.bestJob')}
          </p>
          <p className="text-2xl font-bold mt-1">{insight.jobTitle}</p>
          <div className="mt-6">
            <p className="text-blue-200/70 text-sm uppercase tracking-wider font-semibold">
              {t('market.salary')}
            </p>
            <p className="text-4xl font-extrabold mt-1 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-300">
              {insight.estimatedSalary}
            </p>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <p className="text-blue-200 text-sm font-medium mb-2">{t('market.reasoning')}</p>
          <p className="text-slate-300 text-sm leading-relaxed italic">
            &ldquo;{insight.reasoning}&rdquo;
          </p>
        </div>
      </div>

      {insight.sources.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-blue-300/60 mb-3 font-medium uppercase">
            {t('market.sources')}
          </p>
          <div className="flex flex-wrap gap-3">
            {insight.sources.map((source, idx) => (
              <a
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${source.title} (${t('market.externalLink')})`}
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 border border-white/5"
              >
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                {source.title.length > 30
                  ? `${source.title.substring(0, 30)}...`
                  : source.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
