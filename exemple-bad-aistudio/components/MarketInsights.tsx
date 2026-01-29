
import React from 'react';
import { MarketInsight } from '../types';

interface MarketInsightsProps {
  insight: MarketInsight;
}

const MarketInsights: React.FC<MarketInsightsProps> = ({ insight }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-500/30 mb-4">
            ANALYSE DU MARCHÉ GRENOBLOIS
          </span>
          <h2 className="text-3xl font-bold mb-2">Opportunité Maximale</h2>
        </div>
        <div className="bg-white/10 p-3 rounded-xl border border-white/20">
          <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10m14 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
          </svg>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-blue-200/70 text-sm uppercase tracking-wider font-semibold">Poste le plus rémunérateur</p>
          <p className="text-2xl font-bold mt-1">{insight.jobTitle}</p>
          
          <div className="mt-6">
            <p className="text-blue-200/70 text-sm uppercase tracking-wider font-semibold">Fourchette Salariale</p>
            <p className="text-4xl font-extrabold mt-1 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-300">
              {insight.estimatedSalary}
            </p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <p className="text-blue-200 text-sm font-medium mb-2">Pourquoi ce profil à Grenoble ?</p>
          <p className="text-slate-300 text-sm leading-relaxed italic">
            "{insight.reasoning}"
          </p>
        </div>
      </div>

      {insight.sources && insight.sources.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-blue-300/60 mb-3 font-medium uppercase">Sources vérifiées</p>
          <div className="flex flex-wrap gap-3">
            {insight.sources.map((source, idx) => (
              <a
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 border border-white/5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketInsights;
