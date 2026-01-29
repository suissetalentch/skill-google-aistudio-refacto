# 01 — Project Structure

## The Problem

AI Studio generates a flat file structure with everything at the root level:

```
# AI Studio output (examples/before/)
App.tsx
index.html
index.tsx
types.ts
vite.config.ts
metadata.json
components/
  Header.tsx
  ResumeForm.tsx
  ResumePreview.tsx
  MarketInsights.tsx
services/
  geminiService.ts
```

Issues:
- No `src/` directory — source files mixed with config files
- No feature grouping — components dumped in a flat `components/` folder
- `export default` everywhere — no barrel exports
- Types in a single `types.ts` file at the root
- Services not colocated with features

## The Standard

Production projects use a feature-based structure inside `src/`:

```
# Production structure (DahuAdmin / place2work pattern)
src/
├── components/
│   └── common/                # Shared components (ErrorBoundary, etc.)
│       └── ErrorBoundary.tsx
├── features/
│   └── cv-optimizer/          # Feature folder
│       ├── components/
│       │   ├── ResumeForm.tsx
│       │   ├── ResumePreview.tsx
│       │   ├── MarketInsights.tsx
│       │   └── index.ts
│       ├── services/
│       │   └── geminiService.ts
│       ├── constants/
│       │   └── defaults.ts
│       ├── types.ts
│       └── index.ts
├── config/
│   └── env.ts                 # Environment configuration
├── i18n/                      # i18n config + locale files
│   ├── config.ts
│   └── locales/fr/common.json
├── utils/
│   └── cn.ts                  # Tailwind className utility
├── App.tsx
└── main.tsx
```

## Before / After

### Before (AI Studio)

```tsx
// components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return <header>...</header>;
};

export default Header;
```

```tsx
// App.tsx (at root)
import Header from './components/Header';
import ResumeForm from './components/ResumeForm';
```

### After (Production)

```tsx
// src/features/cv-optimizer/components/Header.tsx
export function Header() {
  return <header>...</header>;
}
```

```tsx
// src/features/cv-optimizer/components/index.ts
export { Header } from './Header';
export { ResumeForm } from './ResumeForm';
export { ResumePreview } from './ResumePreview';
export { MarketInsights } from './MarketInsights';
```

```tsx
// src/App.tsx
import { Header, ResumeForm } from './features/cv-optimizer/components';
```

## Rules

1. **All source code inside `src/`** — config files (vite.config.ts, tsconfig.json, postcss.config.js, tailwind.config.js) stay at root.
2. **Feature folders for domain logic** — group related components, services, types, and constants under `src/features/<name>/`.
3. **Named exports only** — replace every `export default X` with `export function X` or `export const X`.
4. **Barrel exports** — each folder with multiple exports gets an `index.ts` that re-exports everything.
5. **Shared components in `src/components/common/`** — cross-cutting concerns (ErrorBoundary, Layout) go here, not in feature folders.
6. **Move `types.ts`** — split into feature-specific types (`src/features/<name>/types.ts`).
7. **Move `services/`** — colocate services with their feature, or place shared services in `src/services/`.
8. **Delete `metadata.json`** — this is an AI Studio artifact with no production use.
