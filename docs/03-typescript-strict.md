# 03 — TypeScript Strict Mode

## The Problem

AI Studio generates TypeScript code with legacy React patterns and loose type safety:

```tsx
// examples/before/components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return <header>...</header>;
};

export default Header;
```

```tsx
// examples/before/App.tsx
import React, { useState } from 'react';

const App: React.FC = () => {
  // ...
  } catch (err: any) {
    console.error(err);
    setError("Une erreur est survenue lors de l'analyse.");
  }
};

export default App;
```

```json
// examples/before/tsconfig.json — no strict mode
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx"
    // Note: "strict" field is absent — defaults to false
  }
}
```

Issues:
- **`React.FC`** — deprecated pattern that adds implicit `children` prop and doesn't support generics well
- **`import React`** — unnecessary since React 17 with `jsx: "react-jsx"` compiler option
- **`catch (err: any)`** — disables type safety in error handling
- **`export default`** — prevents tree-shaking and makes refactoring harder
- **No `strict: true`** — misses null checks, implicit any, and other safety checks

## The Standard

DahuAdmin's tsconfig.json:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "types": ["vite/client"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Before / After

### Component declaration

```tsx
// BEFORE
import React from 'react';

const Header: React.FC = () => {
  return <header>...</header>;
};

export default Header;

// AFTER
export function Header() {
  return <header>...</header>;
}
```

### Component with props

```tsx
// BEFORE
import React from 'react';

interface ResumeFormProps {
  onSubmit: (text: string, additionalSkills: string) => void;
  isLoading: boolean;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ onSubmit, isLoading }) => {
  // ...
};

export default ResumeForm;

// AFTER
interface ResumeFormProps {
  onSubmit: (text: string, additionalSkills: string) => void;
  isLoading: boolean;
}

export function ResumeForm({ onSubmit, isLoading }: ResumeFormProps) {
  // ...
}
```

### Error handling

```tsx
// BEFORE
} catch (err: any) {
  console.error(err);
  setError("Une erreur est survenue lors de l'analyse.");
}

// AFTER
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('[CVOptimizer] Analysis failed:', message);
  setError(message);
}
```

### Imports

```tsx
// BEFORE
import React, { useState, useEffect } from 'react';

// AFTER
import { useState, useEffect } from 'react';
```

## Rules

1. **Enable `strict: true`** in tsconfig.json — this activates `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and more.
2. **Remove `React.FC`** — use plain function declarations: `export function Component(props: Props)`.
3. **Remove `import React`** — with `jsx: "react-jsx"`, React is auto-imported by the compiler. Only import specific hooks like `{ useState, useEffect }`.
4. **Type errors as `unknown`** — never use `catch (err: any)`. Use `error: unknown` and narrow with `instanceof Error`.
5. **Named exports only** — replace `export default Component` with `export function Component`.
6. **Add `jsx: "react-jsx"`** in tsconfig if missing — this eliminates the need for `import React`.
7. **Set `moduleResolution: "bundler"`** — modern Vite projects should use bundler resolution.
8. **Add `"include": ["src"]`** — scope TypeScript to the source directory only.
