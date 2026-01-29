
import React from 'react';
import { CVData } from '../types';

interface ResumePreviewProps {
  data: CVData;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  return (
    <div className="bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[1100px] print:shadow-none print:border-none print:m-0">
      
      {/* SIDEBAR - Identity & Skills (Left Column) */}
      <aside className="w-full md:w-[35%] bg-[#1a1f2c] p-8 md:p-12 text-white flex flex-col gap-10">
        
        {/* Profile Header */}
        <div className="text-center md:text-left">
          <div className="inline-block p-1 border-b-4 border-indigo-500 mb-6">
            <h1 className="text-3xl font-black leading-tight tracking-tighter uppercase break-words">
              {data.fullName}
            </h1>
          </div>
          <p className="text-indigo-400 font-bold text-xs tracking-[0.25em] uppercase mt-2">
            {data.experiences[0]?.role || 'Manager de Business Unit'}
          </p>
        </div>

        {/* Contact Information */}
        <section aria-label="Contact Information">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
            <span className="h-px bg-slate-700 flex-grow"></span>
            Contact
          </h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 group">
              <div className="bg-slate-800 p-2.5 rounded-xl group-hover:bg-indigo-600 transition-colors">
                <svg className="w-4 h-4 text-indigo-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <span className="text-slate-300 font-medium truncate">{data.email}</span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="bg-slate-800 p-2.5 rounded-xl group-hover:bg-indigo-600 transition-colors">
                <svg className="w-4 h-4 text-indigo-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <span className="text-slate-300 font-medium">{data.phone}</span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="bg-slate-800 p-2.5 rounded-xl group-hover:bg-indigo-600 transition-colors">
                <svg className="w-4 h-4 text-indigo-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <span className="text-slate-300 font-medium italic">Grenoble, France</span>
            </div>
          </div>
        </section>

        {/* Hard Skills */}
        <section aria-label="Core Skills">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
            <span className="h-px bg-slate-700 flex-grow"></span>
            Expertises
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="bg-slate-800 text-indigo-200 text-[10px] font-black px-3 py-2 rounded-lg border border-slate-700/50 hover:border-indigo-500 transition-all cursor-default">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Additional Atouts */}
        {data.additionalSkills && data.additionalSkills.length > 0 && (
          <section aria-label="Soft Skills & Extras">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
              <span className="h-px bg-slate-700 flex-grow"></span>
              Atouts
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

        {/* Footer info for sidebar */}
        <section className="mt-auto pt-6 border-t border-slate-800">
          <p className="text-[10px] text-slate-500 italic text-center leading-relaxed">
            Profil Master 2 Management<br/>Optimisé pour recrutement Isère
          </p>
        </section>
      </aside>

      {/* MAIN CONTENT - Experience & Education (Right Column) */}
      <main className="flex-1 p-10 md:p-16 bg-white relative">
        
        {/* Subtle decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

        {/* Strategic Summary */}
        <section className="mb-16 relative">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.5em] mb-8 flex items-center gap-6">
            <span className="bg-indigo-500 w-8 h-1"></span>
            Résumé Stratégique
          </h2>
          <div className="relative pl-8">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-transparent rounded-full"></div>
            <p className="text-slate-700 text-[15px] leading-relaxed font-medium text-justify italic">
              {data.summary}
            </p>
          </div>
        </section>

        {/* Professional Experience */}
        <section className="mb-16">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.5em] mb-12 flex items-center gap-6">
            <span className="bg-indigo-500 w-8 h-1"></span>
            Expériences Professionnelles
          </h2>
          
          <div className="space-y-12">
            {data.experiences.map((exp, idx) => (
              <article key={idx} className="relative group">
                <div className="flex justify-between items-baseline flex-wrap gap-y-2 mb-6">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 text-xl tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                      {exp.role}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-indigo-600 font-black text-[11px] uppercase tracking-widest">{exp.company}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase">{exp.location || 'Grenoble'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-sm">
                      {exp.period}
                    </span>
                  </div>
                </div>
                
                {/* Enhanced Description List */}
                <div className="space-y-4 pl-2 border-l border-slate-100 ml-1">
                  {exp.description.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 text-slate-600 group/item">
                      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover/item:bg-indigo-500 group-hover/item:border-indigo-500 transition-all duration-300">
                        <svg 
                          className="w-3.5 h-3.5 text-indigo-600 group-hover/item:text-white transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-[14px] leading-relaxed font-medium pt-0.5 group-hover/item:text-slate-900 transition-colors">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section>
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.5em] mb-12 flex items-center gap-6">
            <span className="bg-indigo-500 w-8 h-1"></span>
            Formation Académique
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {data.education.map((edu, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
                <div className="mb-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                  {edu.year}
                </div>
                <h4 className="font-black text-slate-900 text-sm leading-tight mb-2 group-hover:text-indigo-700">
                  {edu.degree}
                </h4>
                <p className="text-slate-500 text-xs font-semibold italic">
                  {edu.school}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default ResumePreview;
