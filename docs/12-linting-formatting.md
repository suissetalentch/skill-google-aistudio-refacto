# 12 — Linting and Formatting

## The Problem

Google AI Studio generates React/TypeScript code with zero linting or formatting configuration. No ESLint, no Prettier, no code quality enforcement. This leads to:

- Inconsistent code style across files
- No detection of TypeScript anti-patterns (explicit `any`, unused vars)
- No automated formatting on save
- No CI/CD quality gates

**Before:** A typical AI Studio project has no configuration files:

```
ai-studio-project/
├── src/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

No `eslint.config.js`, no `.prettierrc`, no quality checks.

---

## The Standard

Production-grade React/TypeScript projects use:

1. **ESLint 9** with flat config (`eslint.config.js`)
2. **typescript-eslint** for TypeScript-specific rules
3. **Prettier** for automated formatting
4. **eslint-config-prettier** to prevent rule conflicts

This setup provides:
- Consistent code style enforced automatically
- TypeScript best practices (no `any`, type imports, no unused vars)
- Pre-commit and CI/CD integration ready

---

## Before / After

### Step 1: Install dependencies

```bash
npm install -D eslint@^9.0.0 @eslint/js typescript-eslint prettier eslint-config-prettier
```

**Key packages:**
- `eslint` — Core linter (v9+)
- `@eslint/js` — ESLint recommended rules
- `typescript-eslint` — TypeScript parser and rules
- `prettier` — Code formatter
- `eslint-config-prettier` — Disables ESLint formatting rules

---

### Step 2: Create `eslint.config.js` (ESLint 9 flat config)

```js
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', '*.config.js'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Enforce no explicit any
      '@typescript-eslint/no-explicit-any': 'error',

      // Enforce type imports for types
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],

      // Allow unused vars with _ prefix
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Disable base rule in favor of TS version
      'no-unused-vars': 'off',
    },
  },
);
```

---

### Step 3: Create `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

**Key settings:**
- `singleQuote: true` — Use `'` instead of `"`
- `trailingComma: "all"` — Cleaner diffs
- `printWidth: 100` — Max line length

---

### Step 4: Add npm scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,json}\""
  }
}
```

**Usage:**
- `npm run lint` — Check for errors
- `npm run lint:fix` — Auto-fix what's possible
- `npm run format` — Format all files
- `npm run format:check` — Verify formatting (CI)

---

### Step 5: ESLint 9 vs Legacy

**Legacy (.eslintrc.json):**
```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"]
}
```

**ESLint 9 (eslint.config.js):**
```js
import tseslint from 'typescript-eslint';
export default tseslint.config(...);
```

**Key differences:**
- Flat config uses `.js` file with imports, not JSON
- No more `extends` — use array spreading
- Better TypeScript integration with `typescript-eslint` package
- `ignores` at top level, not `.eslintignore` file

---

## Rules

1. **Use ESLint 9 flat config** (`eslint.config.js`, not `.eslintrc`)
2. **Use typescript-eslint** for TypeScript rules and parser
3. **Use eslint-config-prettier** to disable conflicting formatting rules
4. **Enforce no-explicit-any** — Force proper typing
5. **Enforce consistent-type-imports** — Use `import type` for types
6. **Add lint and format scripts** to `package.json`
7. **Prettier handles formatting**, ESLint handles logic/patterns
8. **Ignore dist/ and node_modules/** in ESLint config
9. **Allow unused vars with `_` prefix** for intentional ignores
10. **Run lint and format:check in CI/CD** before deployment
