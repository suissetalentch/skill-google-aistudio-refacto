# 07 — Icons and Assets

## The Problem

AI Studio inlines SVG icons directly in JSX, creating bloated and unreadable components:

```tsx
// examples/before/components/Header.tsx
<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
</svg>
```

```tsx
// examples/before/App.tsx — error icon
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
```

```tsx
// examples/before/App.tsx — arrow icon
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
    d="M10 19l-7-7m0 0l7-7m-7 7h18" />
</svg>
```

Issues:
- **SVG paths are unreadable** — no one knows what `M21 13.255A23.931...` renders without opening a viewer
- **Bloated JSX** — 4+ lines per icon, repeated across components
- **No consistency** — each SVG has slightly different attributes and sizes
- **No tree-shaking** — inline SVGs are always included even if the component is lazy-loaded

## The Standard

DahuAdmin uses Lucide React — a clean icon library with tree-shakeable named imports:

```tsx
// DahuAdmin/src/components/common/ErrorBoundary.tsx
import { AlertTriangle, RefreshCw } from 'lucide-react';

<AlertTriangle className="w-8 h-8 text-red-500" />
<RefreshCw className="w-4 h-4" />
```

## Before / After

### Install

```bash
npm install lucide-react
```

### SVG to Lucide mapping

Here is the mapping for all SVGs found in the AI Studio example:

| Location | SVG path description | Lucide icon |
|----------|---------------------|-------------|
| Header.tsx | Briefcase icon | `Briefcase` |
| App.tsx | Alert circle (error) | `AlertCircle` |
| App.tsx | Arrow left | `ArrowLeft` |
| App.tsx | Printer | `Printer` |
| ResumeForm.tsx | Spinner circle | `Loader2` (with `animate-spin`) |
| ResumeForm.tsx | Arrow right | `ArrowRight` |
| ResumePreview.tsx | Mail envelope | `Mail` |
| ResumePreview.tsx | Phone | `Phone` |
| ResumePreview.tsx | Map pin | `MapPin` |
| ResumePreview.tsx | Checkmark | `Check` |
| MarketInsights.tsx | Bar chart | `BarChart3` |
| MarketInsights.tsx | External link | `ExternalLink` |

### Before (AI Studio)

```tsx
// Header.tsx
<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
</svg>
```

### After (Production)

```tsx
// Header.tsx
import { Briefcase } from 'lucide-react';

<Briefcase className="w-6 h-6 text-white" />
```

### Loading spinner

```tsx
// BEFORE
<svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  <path className="opacity-75" fill="currentColor"
    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
</svg>

// AFTER
import { Loader2 } from 'lucide-react';

<Loader2 className="h-5 w-5 text-white animate-spin" />
```

## Rules

1. **Install `lucide-react`** — `npm install lucide-react`. Tree-shakeable, consistent, well-typed.
2. **Replace every inline SVG** — find all `<svg>` elements and map them to Lucide icons.
3. **Keep className props** — Lucide icons accept `className` for sizing and colors: `<Icon className="w-5 h-5 text-red-500" />`.
4. **Use `Loader2` for spinners** — with `animate-spin` class for loading indicators.
5. **Named imports only** — `import { Briefcase, Mail } from 'lucide-react'` — never import the entire library.
6. **If no Lucide match exists** — create a dedicated SVG component in `src/components/icons/` rather than inlining.
