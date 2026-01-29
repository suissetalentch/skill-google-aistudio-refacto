import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Check } from 'lucide-react';
import type { CVData } from '../types';

interface ResumePreviewProps {
  data: CVData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[1100px] print:shadow-none print:border-none print:m-0">
      <aside className="w-full md:w-[35%] bg-[#1a1f2c] p-8 md:p-12 text-white flex flex-col gap-10">
        <div className="text-center md:text-left">
          <div className="inline-block p-1 border-b-4 border-indigo-500 mb-6">
            <h1 className="text-3xl font-black leading-tight tracking-tighter uppercase break-words">
              {data.fullName}
            </h1>
          </div>
          <p className="text-indigo-400 font-bold text-xs tracking-[0.25em] uppercase mt-2">
            {data.experiences[0]?.role || t('resume.defaultRole')}
          </p>
        </div>

        <section aria-label={t('resume.contact')}>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
            <span className="h-px bg-slate-700 flex-grow" />
            {t('resume.contact')}
          </h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-2.5 rounded-xl">
                <Mail className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-slate-300 font-medium truncate">{data.email}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-2.5 rounded-xl">
                <Phone className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-slate-300 font-medium">{data.phone}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-2.5 rounded-xl">
                <MapPin className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-slate-300 font-medium italic">{data.location || t('resume.defaultLocation')}</span>
            </div>
          </div>
        </section>

        <section aria-label={t('resume.skills')}>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
            <span className="h-px bg-slate-700 flex-grow" />
            {t('resume.skills')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="bg-slate-800 text-indigo-200 text-[10px] font-black px-3 py-2 rounded-lg border border-slate-700/50">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {data.additionalSkills && data.additionalSkills.length > 0 && (
          <section aria-label={t('resume.extras')}>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
              <span className="h-px bg-slate-700 flex-grow" />
              {t('resume.extras')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.additionalSkills.map((skill, idx) => (
                <span key={idx} className="bg-indigo-900/20 text-slate-300 text-[10px] font-medium px-3 py-2 rounded-lg border border-indigo-500/10">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mt-auto pt-6 border-t border-slate-800">
          <p className="text-[10px] text-slate-500 italic text-center leading-relaxed">
            {t('resume.footer')}
          </p>
        </section>
      </aside>

      <main className="flex-1 p-10 md:p-16 bg-white">
        <section className="mb-16">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.5em] mb-8 flex items-center gap-6">
            <span className="bg-indigo-500 w-8 h-1" />
            {t('resume.summary')}
          </h2>
          <p className="text-slate-700 text-[15px] leading-relaxed font-medium text-justify italic pl-8 border-l-2 border-indigo-500">
            {data.summary}
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.5em] mb-12 flex items-center gap-6">
            <span className="bg-indigo-500 w-8 h-1" />
            {t('resume.experience')}
          </h2>
          <div className="space-y-12">
            {data.experiences.map((exp, idx) => (
              <article key={idx}>
                <div className="flex justify-between items-baseline flex-wrap gap-y-2 mb-6">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">{exp.role}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-indigo-600 font-black text-[11px] uppercase tracking-widest">{exp.company}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase">{exp.location || t('resume.defaultCity')}</span>
                    </div>
                  </div>
                  <span className="inline-block bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full">{exp.period}</span>
                </div>
                <div className="space-y-4 pl-2 border-l border-slate-100 ml-1">
                  {exp.description.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 text-slate-600">
                      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <p className="text-[14px] leading-relaxed font-medium pt-0.5">{item}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.5em] mb-12 flex items-center gap-6">
            <span className="bg-indigo-500 w-8 h-1" />
            {t('resume.education')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {data.education.map((edu, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="mb-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">{edu.year}</div>
                <h4 className="font-black text-slate-900 text-sm leading-tight mb-2">{edu.degree}</h4>
                <p className="text-slate-500 text-xs font-semibold italic">{edu.school}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
