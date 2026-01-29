# 05 — State Management

## The Problem

AI Studio puts all state in the root `App` component and drills props down:

```tsx
// exemple-bad-aistudio/App.tsx
const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcessCV = async (text: string, additionalSkills: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeAndOptimizeCV(text, additionalSkills);
      setResult(data);
    } catch (err: any) {
      setError("Une erreur est survenue...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Props drilled: onSubmit, isLoading, result, error */}
      <ResumeForm onSubmit={handleProcessCV} isLoading={loading} />
      <ResumePreview data={result.updatedCV} />
      <MarketInsights insight={result.insight} />
    </>
  );
};
```

Issues:
- **All state in App** — becomes unmanageable as the app grows
- **Prop drilling** — callbacks and state passed through multiple component layers
- **No separation** — loading, error, and data states mixed with UI logic
- **No persistence** — state lost on refresh

## The Standard

Use this decision matrix to pick the right approach:

| State type | Solution | When |
|------------|----------|------|
| Global app state (auth, theme) | **Zustand** | Shared across many components |
| Feature-scoped state | **React Context** | Shared within a feature subtree |
| Server/async state | **React Query** or local state | API data with caching needs |
| Form state | **React Hook Form** | Complex forms (see doc 09) |
| Local UI state | **useState** | Toggles, modals, single-component state |

### Zustand pattern (place2work)

```ts
// place2work/frontend/src/store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserResponse | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
```

## Before / After

### Before (AI Studio — prop drilling)

```tsx
// App.tsx — everything in one place
const App = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleProcessCV = async (text, skills) => { /* ... */ };

  return (
    <ResumeForm onSubmit={handleProcessCV} isLoading={loading} />
  );
};
```

### After (Production — Zustand store)

```ts
// src/features/cv-optimizer/store/useCVStore.ts
import { create } from 'zustand';
import type { AnalysisResponse } from '../types';

interface CVState {
  result: AnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  setResult: (result: AnalysisResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useCVStore = create<CVState>((set) => ({
  result: null,
  isLoading: false,
  error: null,

  setResult: (result) => set({ result, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ result: null, isLoading: false, error: null }),
}));
```

```tsx
// src/features/cv-optimizer/components/ResumeForm.tsx
import { useCVStore } from '../store/useCVStore';

export function ResumeForm() {
  const { isLoading, setLoading, setResult, setError } = useCVStore();

  const handleSubmit = async (text: string, skills: string) => {
    setLoading(true);
    try {
      const data = await analyzeAndOptimizeCV(text, skills);
      setResult(data);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // No props needed — reads directly from store
}
```

## Rules

1. **Install Zustand** — `npm install zustand` for global state management.
2. **One store per feature** — create `store/use<Feature>Store.ts` inside each feature folder.
3. **Keep stores flat** — avoid nested state objects. Zustand works best with flat state.
4. **Use selectors** — `const isLoading = useCVStore(s => s.isLoading)` to avoid unnecessary re-renders.
5. **Prop drilling limit: 2 levels** — if a prop passes through more than 2 components, extract to a store or context.
6. **Context for scoped state** — if state is only needed within a feature subtree, use React Context instead of Zustand.
7. **Keep `useState` for local UI** — toggles, modals, and single-component state stay as `useState`.
