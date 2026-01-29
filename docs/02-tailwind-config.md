# 02 — Tailwind Configuration

## The Problem

AI Studio loads Tailwind via CDN and uses raw className strings without composition utilities:

```html
<!-- examples/before/index.html -->
<script src="https://cdn.tailwindcss.com"></script>
```

```tsx
// examples/before/components/ResumeForm.tsx
<button
  className={`relative w-full py-4 px-6 rounded-xl font-semibold text-white transition-all overflow-hidden flex items-center justify-center gap-3 ${
    isLoading || !text.trim()
      ? 'bg-slate-300 cursor-not-allowed'
      : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.98]'
  }`}
>
```

Issues:
- **CDN = no tree-shaking** — the entire Tailwind CSS is downloaded at runtime
- **No custom theme** — can't use `colors.dahu` or project-specific design tokens
- **No `cn()` utility** — className strings grow huge with ternaries, making them unreadable and error-prone when classes conflict
- **No PostCSS** — can't use `@apply` or plugins

## The Standard

Production projects install Tailwind as a build dependency with PostCSS and a `cn()` utility:

### Install dependencies

```bash
npm install -D tailwindcss postcss autoprefixer
npm install clsx tailwind-merge
```

### postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### tailwind.config.js

Based on DahuAdmin's config — extend with project-specific design tokens:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Add project-specific colors here
        primary: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      fontSize: {
        'h1': ['clamp(1.5rem, 4vw, 2rem)', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['clamp(1.25rem, 3vw, 1.5rem)', { lineHeight: '1.25', fontWeight: '600' }],
        'body': ['clamp(0.875rem, 1.5vw, 1rem)', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [],
};
```

### src/utils/cn.ts

From place2work — the `cn()` utility that merges Tailwind classes safely:

```ts
// place2work/frontend/src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### index.html — remove CDN

```html
<!-- REMOVE this line -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- REMOVE the import map block -->
<script type="importmap">...</script>
```

### src/index.css — add Tailwind directives

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Before / After

### Before (AI Studio)

```tsx
<button
  className={`relative w-full py-4 px-6 rounded-xl font-semibold text-white transition-all overflow-hidden flex items-center justify-center gap-3 ${
    isLoading || !text.trim()
      ? 'bg-slate-300 cursor-not-allowed'
      : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.98]'
  }`}
>
```

### After (Production)

```tsx
import { cn } from '@/utils/cn';

<button
  className={cn(
    'relative w-full py-4 px-6 rounded-xl font-semibold text-white',
    'transition-all overflow-hidden flex items-center justify-center gap-3',
    isLoading || !text.trim()
      ? 'bg-slate-300 cursor-not-allowed'
      : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.98]'
  )}
>
```

## Rules

1. **Remove CDN script** — delete `<script src="https://cdn.tailwindcss.com">` from index.html.
2. **Install build-time Tailwind** — `tailwindcss`, `postcss`, `autoprefixer` as devDependencies.
3. **Create config files** — `tailwind.config.js` and `postcss.config.js` at project root.
4. **Add Tailwind directives** — `@tailwind base/components/utilities` in CSS entry point.
5. **Create `cn()` utility** — install `clsx` + `tailwind-merge`, create `src/utils/cn.ts`.
6. **Refactor conditional classNames** — replace ternary concatenation with `cn()` calls.
7. **Extract design tokens** — move repeated colors, spacing, and font sizes to `theme.extend` in tailwind.config.js.
8. **Update content paths** — ensure `content` array in tailwind.config.js covers all source files in `src/`.
