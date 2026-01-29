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
- **No custom theme** — can't use project-specific design tokens
- **No `cn()` utility** — className strings grow huge with ternaries
- **No build pipeline** — can't optimize or purge unused styles

## The Standard (Tailwind v4)

Tailwind v4 uses CSS-first configuration. No more `tailwind.config.js` or `postcss.config.js`.

### Install dependencies

```bash
npm install -D tailwindcss @tailwindcss/vite
npm install clsx tailwind-merge
```

### vite.config.ts — use the Vite plugin

```ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### src/index.css — CSS-first config

```css
@import "tailwindcss";

@theme {
  --color-primary-50: #eef2ff;
  --color-primary-100: #e0e7ff;
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;
  --color-primary-700: #4338ca;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

### src/utils/cn.ts

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Before / After

### Before (AI Studio)

```tsx
<button
  className={`relative w-full py-4 rounded-xl font-semibold text-white ${
    isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
  }`}
>
```

### After (Tailwind v4 + cn())

```tsx
import { cn } from '@/utils/cn';

<button
  className={cn(
    'relative w-full py-4 rounded-xl font-semibold text-white',
    isPending
      ? 'bg-slate-300 cursor-not-allowed'
      : 'bg-indigo-600 hover:bg-indigo-700'
  )}
>
```

### Migration from v3 to v4

```
DELETE: postcss.config.js
DELETE: tailwind.config.js
UPDATE: vite.config.ts → add @tailwindcss/vite plugin
UPDATE: index.css → replace @tailwind directives with @import "tailwindcss"
UPDATE: index.css → move theme.extend colors to @theme {} block
UPDATE: package.json → remove postcss, autoprefixer; add @tailwindcss/vite, tailwindcss v4
```

## Rules

1. **Remove CDN script** — delete `<script src="https://cdn.tailwindcss.com">` from index.html.
2. **Use Tailwind v4 Vite plugin** — `@tailwindcss/vite` replaces PostCSS setup entirely.
3. **Delete v3 config files** — remove `tailwind.config.js` and `postcss.config.js`.
4. **Use `@import "tailwindcss"`** — replaces the three `@tailwind` directives.
5. **Use `@theme {}` block** — custom colors and fonts go in CSS, not JavaScript config.
6. **Create `cn()` utility** — install `clsx` + `tailwind-merge`, create `src/utils/cn.ts`.
7. **Refactor conditional classNames** — replace ternary concatenation with `cn()` calls.
8. **Use `tailwind-merge` v3** — compatible with Tailwind v4.
