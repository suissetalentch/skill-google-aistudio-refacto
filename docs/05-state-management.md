# 05 — State Management

## The Problem

AI Studio puts all state in the root `App` component and drills props down:

```tsx
// examples/before/App.tsx
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
- **Boolean isLoading** — can't distinguish idle from error. Impossible states are possible (isLoading=true AND error="something")
- **No state machine** — transitions between states are implicit

## The Standard

### Decision matrix

| State type | Solution | When |
|------------|----------|------|
| Global app state (auth, theme) | **Zustand** | Shared across many components |
| Feature-scoped state | **React Context** | Shared within a feature subtree |
| Server/async state | **React Query** or local state | API data with caching needs |
| Form state | **React Hook Form** | Complex forms (see doc 09) |
| Local UI state | **useState** | Toggles, modals, single-component state |

### State machine pattern

Replace boolean flags with a discriminated union status:

```ts
type RequestStatus = 'idle' | 'pending' | 'success' | 'error';
```

This prevents impossible states:
- `idle` → no request yet
- `pending` → request in flight
- `success` → data received
- `error` → request failed

## Before / After

### Before (boolean flags)

```ts
interface CVState {
  result: AnalysisResponse | null;
  isLoading: boolean;  // ← boolean can't prevent impossible states
  error: string | null;
}
```

### After (state machine)

```ts
// src/features/cv-optimizer/types.ts
export type RequestStatus = 'idle' | 'pending' | 'success' | 'error';

// src/features/cv-optimizer/store/useCVStore.ts
import { create } from 'zustand';
import type { AnalysisResponse, RequestStatus } from '../types';

interface CVState {
  result: AnalysisResponse | null;
  status: RequestStatus;
  error: string | null;
  setResult: (result: AnalysisResponse) => void;
  setPending: () => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useCVStore = create<CVState>((set) => ({
  result: null,
  status: 'idle',
  error: null,

  setResult: (result) => set({ result, status: 'success', error: null }),
  setPending: () => set({ status: 'pending', error: null }),
  setError: (error) => set({ error, status: 'error' }),
  reset: () => set({ result: null, status: 'idle', error: null }),
}));
```

### Consumer usage

```tsx
// src/features/cv-optimizer/components/ResumeForm.tsx
import { useCVStore } from '../store/useCVStore';

export function ResumeForm({ onSubmit }: ResumeFormProps) {
  const { status } = useCVStore();
  const isPending = status === 'pending';

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <button disabled={isPending} aria-busy={isPending}>Submit</button>
    </form>
  );
}
```

**Design choice:** Read-only state (`status`, `error`, `result`) comes from the store.
The `onSubmit` callback remains a prop because `App` orchestrates the submission workflow
(calling the service, updating the store). This is an acceptable hybrid —
stores own shared state, parent owns orchestration.

## Rules

1. **Install Zustand** — `npm install zustand` for global state management.
2. **Use status union, not boolean** — `'idle' | 'pending' | 'success' | 'error'` instead of `isLoading: boolean`.
3. **One store per feature** — create `store/use<Feature>Store.ts` inside each feature folder.
4. **Keep stores flat** — avoid nested state objects. Zustand works best with flat state.
5. **Use selectors** — `const status = useCVStore(s => s.status)` to avoid unnecessary re-renders.
6. **Prop drilling limit: 2 levels** — if a prop passes through more than 2 components, extract to a store.
7. **Keep `useState` for local UI** — toggles, modals, and single-component state stay as `useState`.
8. **Derive booleans from status** — `const isPending = status === 'pending'` in the consumer, not in the store.
