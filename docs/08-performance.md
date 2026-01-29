# 08 — Performance

## The Problem

AI Studio loads everything at once with no code splitting and uses runtime ESM imports:

```html
<!-- exemple-bad-aistudio/index.html -->
<script type="importmap">
{
  "imports": {
    "react-dom/": "https://esm.sh/react-dom@^19.2.3/",
    "@google/genai": "https://esm.sh/@google/genai@^1.34.0",
    "react/": "https://esm.sh/react@^19.2.3/",
    "react": "https://esm.sh/react@^19.2.3"
  }
}
</script>
```

```tsx
// exemple-bad-aistudio/App.tsx — all components imported eagerly
import Header from './components/Header';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import MarketInsights from './components/MarketInsights';
```

```ts
// exemple-bad-aistudio/vite.config.ts — no chunks
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // No build optimization, no manualChunks
  };
});
```

Issues:
- **ESM.sh import maps** — loads React and dependencies from a CDN at runtime, bypassing npm and bundling entirely
- **No lazy loading** — all pages/views loaded upfront even if the user never navigates to them
- **No code splitting** — single JavaScript bundle with everything
- **No `manualChunks`** — vendor libraries not split from app code
- **No Suspense boundaries** — no loading states for lazy components

## The Standard

### Lazy loading (font-dahu pattern)

```tsx
// font-dahu/App.tsx
import { Suspense, lazy } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <Routes>
      <Route index element={
        <Suspense fallback={<PageLoader />}>
          <HomePage />
        </Suspense>
      } />
      {/* ... */}
    </Routes>
  );
}
```

### Manual chunks (DahuAdmin pattern)

```ts
// DahuAdmin/vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['lucide-react'],
          'vendor-utils': ['axios', 'date-fns', 'zod'],
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  }
});
```

## Before / After

### Step 1: Remove import maps from index.html

```html
<!-- REMOVE this entire block -->
<script type="importmap">
{
  "imports": {
    "react-dom/": "https://esm.sh/react-dom@^19.2.3/",
    "@google/genai": "https://esm.sh/@google/genai@^1.34.0",
    "react/": "https://esm.sh/react@^19.2.3/",
    "react": "https://esm.sh/react@^19.2.3"
  }
}
</script>
```

All dependencies are installed via npm and bundled by Vite.

### Step 2: Add lazy loading for views

```tsx
// BEFORE
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';

// AFTER
import { lazy, Suspense } from 'react';

const ResumeForm = lazy(() =>
  import('./features/cv-optimizer/components/ResumeForm').then(m => ({ default: m.ResumeForm }))
);
const ResumePreview = lazy(() =>
  import('./features/cv-optimizer/components/ResumePreview').then(m => ({ default: m.ResumePreview }))
);

// Wrap in Suspense
<Suspense fallback={<PageLoader />}>
  <ResumeForm />
</Suspense>
```

Note: `React.lazy` requires a default export. If using named exports, use the `.then(m => ({ default: m.Component }))` pattern.

### Step 3: Configure Vite chunks

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['lucide-react'],
          'vendor-utils': ['axios', 'clsx', 'tailwind-merge'],
          'vendor-i18n': ['i18next', 'react-i18next'],
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

## Rules

1. **Remove all import maps** — delete `<script type="importmap">` from index.html. All dependencies via npm.
2. **Remove ESM.sh references** — no `https://esm.sh/` URLs anywhere in the codebase.
3. **Lazy load views/pages** — use `React.lazy()` for any component that isn't needed on initial render.
4. **Add Suspense boundaries** — wrap lazy components in `<Suspense fallback={<Loader />}>`.
5. **Configure `manualChunks`** — split vendor libraries into separate chunks in vite.config.ts.
6. **Enable terser minification** — `drop_console` and `drop_debugger` for production.
7. **Set `target: 'es2020'`** — modern browser target for smaller bundles.
8. **Use `memo`/`useMemo`/`useCallback` sparingly** — only when profiling reveals actual performance issues.
