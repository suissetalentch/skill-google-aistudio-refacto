# 04 — i18n Setup

## The Problem

AI Studio hardcodes all user-facing strings in French directly in JSX:

```tsx
// examples/before/components/Header.tsx
<h1 className="text-xl font-bold">
  Grenoble Career Scout
</h1>
<div className="text-sm text-slate-500">
  Optimisez votre CV pour le marché alpin
</div>
```

```tsx
// examples/before/App.tsx
<h3 className="font-bold text-slate-800 mb-2">Comment ça marche ?</h3>
<p className="text-slate-600 text-sm">
  Notre IA analyse votre profil actuel...
</p>
```

```tsx
// examples/before/components/ResumeForm.tsx
<h2 className="text-2xl font-bold">Optimiseur de Carrière - Grenoble</h2>
<p>Vos données ont été actualisées (Master 2 Obtenu). Cliquez sur "Optimiser".</p>
<label>Contenu principal du CV</label>
<label>Compétences Additionnelles (optionnel)</label>
const LOADING_MESSAGES = [
  "Analyse de votre profil Master 2...",
  "Suppression de l'expérience Hotel Meylan...",
  // ...
];
```

Issues:
- **Zero i18n** — impossible to add another language without rewriting every component
- **Hardcoded French** — strings buried inside JSX, not extractable
- **No namespace separation** — all text mixed together

## The Standard

Two production patterns exist in the codebase:

### Pattern A: localStorage-based (place2work)

```ts
// place2work/frontend/src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonFR from './locales/fr/common.json';
import commonEN from './locales/en/common.json';
// ... more namespaces

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: commonFR },
      en: { common: commonEN },
    },
    lng: localStorage.getItem('i18nextLng') || 'fr',
    fallbackLng: 'fr',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
```

### Pattern B: Path-based routing (font-dahu)

```ts
// font-dahu/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ... imports

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'it', 'de'],
    detection: {
      order: ['path', 'navigator'],
      lookupFromPathIndex: 0,
    },
    interpolation: { escapeValue: false },
  });
```

**Choose Pattern A** for apps (SPAs with auth). **Choose Pattern B** for public sites (SEO-important, multi-language URLs).

## Before / After

### Install dependencies

```bash
npm install i18next react-i18next
```

### Create translation files

```
src/
├── i18n/
│   ├── config.ts
│   └── locales/
│       └── fr/
│           └── common.json
```

### Before (AI Studio)

```tsx
// components/Header.tsx
<h1>Grenoble Career Scout</h1>
<div>Optimisez votre CV pour le marché alpin</div>
```

```tsx
// components/ResumeForm.tsx
<h2>Optimiseur de Carrière - Grenoble</h2>
<label>Contenu principal du CV</label>
<button>Optimiser mon profil Graduate & Voir les salaires</button>
```

### After (Production)

```json
// src/i18n/locales/fr/common.json
{
  "header": {
    "title": "Grenoble Career Scout",
    "subtitle": "Optimisez votre CV pour le marché alpin"
  },
  "form": {
    "title": "Optimiseur de Carrière - Grenoble",
    "cvLabel": "Contenu principal du CV",
    "submitButton": "Optimiser mon profil Graduate & Voir les salaires",
    "skillsLabel": "Compétences Additionnelles (optionnel)",
    "skillsHint": "Séparez les compétences par des virgules."
  },
  "loading": {
    "analyzingProfile": "Analyse de votre profil Master 2...",
    "optimizingAts": "Optimisation pour les algorithmes ATS...",
    "generatingDesign": "Génération du design premium...",
    "finalizing": "Finalisation de votre stratégie de carrière..."
  },
  "errors": {
    "analysisFailed": "Une erreur est survenue lors de l'analyse. Veuillez réessayer."
  }
}
```

```tsx
// src/features/cv-optimizer/components/Header.tsx
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t } = useTranslation();

  return (
    <header>
      <h1>{t('header.title')}</h1>
      <div>{t('header.subtitle')}</div>
    </header>
  );
}
```

## Zod + i18n Pattern

Zod validation messages should use i18n keys instead of hardcoded strings.
The component resolves the key with `t()` at render time.

### Schema (keys only)

```ts
// src/features/cv-optimizer/schemas/cvForm.ts
export const cvFormSchema = z.object({
  cvText: z
    .string()
    .min(50, 'validation.cvMinLength')   // i18n key, NOT hardcoded text
    .max(10000, 'validation.cvMaxLength'),
});
```

### Component (resolve with `t()`)

```tsx
// In the form component
const { t } = useTranslation();

{errors.cvText && (
  <p role="alert" className="text-red-500 text-sm mt-1">
    {t(errors.cvText.message ?? '')}
  </p>
)}
```

### Translation file

```json
{
  "validation": {
    "cvMinLength": "Le CV doit contenir au moins 50 caractères",
    "cvMaxLength": "Le CV ne doit pas dépasser 10 000 caractères"
  }
}
```

This pattern keeps schemas framework-agnostic (no dependency on `t()` at
definition time) while ensuring all user-facing text goes through i18n.

## Rules

1. **Install i18next + react-i18next** — these are the standard i18n libraries for React.
2. **Create `src/i18n/config.ts`** — initialize i18next with resources, fallback language, and namespaces.
3. **Import config in main.tsx** — `import './i18n/config'` before rendering the app.
4. **Structure translations** — `src/i18n/locales/{lang}/{namespace}.json`. Start with `fr/common.json`.
5. **Extract all hardcoded strings** — every user-facing string in JSX becomes a `t('key')` call.
6. **Use `useTranslation()` hook** — import from `react-i18next` in every component with text.
7. **Namespace by domain** — for larger apps, split into `common`, `forms`, `errors`, etc.
8. **Don't translate dynamic data** — API responses, user input, and computed values stay as-is.
9. **Handle arrays** — loading messages and lists should use indexed keys (`loading.step1`, `loading.step2`).
10. **Zod messages use i18n keys** — pass translation keys as Zod error messages, resolve with `t()` at render time. See "Zod + i18n Pattern" above.
