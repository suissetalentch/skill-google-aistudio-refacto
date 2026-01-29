# 14 — Troubleshooting

## Overview

Common errors and fixes organized by refactoring phase (P0–P3). Each entry includes the error symptom, root cause, and actionable fix.

---

## P0 — Project Structure

### Error: Module not found after moving files

**Symptom:**
```
Error: Cannot find module '../components/Button'
```

**Cause:** Import paths not updated after restructuring to features/ directory.

**Fix:** Update all imports to use the @ alias:
```bash
# Find broken relative imports
grep -r "from '\.\." src/

# Replace with @ alias
# Before: import { Button } from '../../../components/Button'
# After:  import { Button } from '@/components/Button'
```

### Error: Vite alias not resolving

**Symptom:**
```
Failed to resolve import "@/lib/api" from "src/features/..."
```

**Cause:** Missing or mismatched alias configuration.

**Fix:** Ensure both files have matching alias config:

**vite.config.ts:**
```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Error: Feature index barrel not exporting correctly

**Symptom:**
```
Error: 'UserProfile' is not exported from '@/features/user'
```

**Cause:** Missing export in feature's index.ts.

**Fix:** Check `src/features/user/index.ts` includes:
```ts
export { UserProfile } from './components/UserProfile'
```

---

## P1 — TypeScript / Tailwind / State

### Error: `Cannot find module 'tailwindcss'`

**Symptom:**
```
[vite] Internal server error: Cannot find module 'tailwindcss'
```

**Cause:** Tailwind v4 uses `@tailwindcss/vite` plugin, not PostCSS.

**Fix:**
1. Remove `postcss.config.js` and `tailwind.config.js`
2. Add to vite.config.ts:
```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```
3. Update CSS: `@import "tailwindcss"`

### Error: `@tailwind directives not working`

**Symptom:** Styles not applied, console warnings about unknown directives.

**Cause:** Tailwind v4 replaces `@tailwind` directives with `@import`.

**Fix:** In main CSS file:
```css
/* Remove these: */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Replace with: */
@import "tailwindcss";

/* Custom theme: */
@theme {
  --color-primary: oklch(0.5 0.2 250);
}
```

### Error: TypeScript strict mode errors after enabling

**Symptom:**
```
error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
error TS7006: Parameter 'event' implicitly has an 'any' type.
```

**Cause:** Implicit any, null checks, unsafe operations.

**Fix:** Address each error type:
- Add `| null | undefined` to types
- Narrow with `if (value != null)` or `instanceof`
- Add explicit types: `(event: React.ChangeEvent<HTMLInputElement>)`
- Use optional chaining: `user?.name`

### Error: `Property 'isLoading' does not exist`

**Symptom:**
```
Property 'isLoading' does not exist on type 'AuthState'
```

**Cause:** Store migrated to state machine with `status` field.

**Fix:** Replace boolean flags with status checks:
```ts
// Before
const { isLoading, isError } = useAuthStore()

// After
const { status } = useAuthStore()
const isPending = status === 'pending'
const isError = status === 'error'
```

---

## P2 — API / Services / Forms

### Error: `axios is not defined`

**Symptom:**
```
ReferenceError: axios is not defined
```

**Cause:** axios removed in favor of native fetch.

**Fix:** Replace with fetch:
```ts
// Before
const response = await axios.post('/api/users', data)

// After
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
if (!response.ok) throw new Error('Request failed')
const json = await response.json()
```

### Error: `AbortSignal.any is not a function`

**Symptom:**
```
TypeError: AbortSignal.any is not a function
```

**Cause:** `AbortSignal.any()` requires ES2024+ / modern browsers.

**Fix:** Option 1 (simplify):
```ts
// Use single AbortController instead
const controller = new AbortController()
return fetch(url, { signal: controller.signal })
```

Option 2 (polyfill): Add `abort-controller-x` or set tsconfig target to ES2024.

### Error: Zod validation errors after v4 upgrade

**Symptom:** Custom error handling broken after upgrading to Zod v4.

**Cause:** Zod v4 changed error formatting API.

**Fix:** Basic schema API is compatible. For custom errors:
```ts
// Check error structure
try {
  schema.parse(data)
} catch (error) {
  // v4: error.issues is still available
  const issues = error.issues
}
```

### Error: `@hookform/resolvers` not found at runtime

**Symptom:**
```
Module not found: Can't resolve '@hookform/resolvers/zod'
```

**Cause:** Package in devDependencies instead of dependencies.

**Fix:** Move to dependencies:
```bash
npm uninstall @hookform/resolvers
npm install @hookform/resolvers
```

---

## P3 — i18n / Polish

### Error: `t()` returns key string instead of translation

**Symptom:** UI shows "auth.login.title" instead of "Connexion".

**Cause:** Missing key in translation JSON or namespace not loaded.

**Fix:**
1. Check `src/i18n/locales/fr/common.json` for the key
2. Verify namespace matches:
```ts
const { t } = useTranslation('common')
t('auth.login.title') // key must exist in common.json
```

### Error: ErrorBoundary can't use useTranslation

**Symptom:**
```
Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

**Cause:** Class components can't use hooks.

**Fix:** Use `withTranslation()` HOC:
```tsx
import { WithTranslation, withTranslation } from 'react-i18next'

class ErrorBoundary extends Component<WithTranslation> {
  render() {
    const { t } = this.props
    return <div>{t('error.message')}</div>
  }
}

export default withTranslation()(ErrorBoundary)
```

---

## General

### Error: Build fails with chunk errors

**Symptom:**
```
[vite]: Rollup failed to resolve import "react" from "vite.config.ts"
```

**Cause:** `manualChunks` references packages not in dependencies.

**Fix:** Ensure every package listed in `manualChunks` exists in package.json:
```ts
manualChunks: {
  vendor: ['react', 'react-dom'], // both must be in dependencies
}
```

### Git rollback

```bash
git diff HEAD~1        # See what changed
git reset --soft HEAD~1 # Revert last commit (keep changes staged)
```

## Rules

1. **Always run `tsc --noEmit`** after TypeScript changes
2. **Always run `npm run build`** after dependency changes
3. **Keep git commits granular** — one concern per commit
4. **Check both vite.config.ts and tsconfig.json** when fixing alias issues
5. **When migrating Tailwind v4**, delete ALL v3 config files first
