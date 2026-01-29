# 11 — Testing Setup

## The Problem

AI Studio generates zero tests. No vitest configuration, no React Testing Library, no API mocking infrastructure.

**Before:**
```
src/
├── components/
│   └── ResumeForm.tsx
├── services/
│   └── cvService.ts
└── App.tsx

package.json (missing):
- No vitest
- No @testing-library/react
- No msw
- No test scripts
```

Production apps need comprehensive testing coverage with proper tooling.

---

## The Standard

Production React apps use:
- **Vitest 4** for fast unit/integration tests
- **React Testing Library** for component testing
- **MSW 2** for API mocking
- **Co-located tests** in `__tests__/` directories

Reference projects: DahuAdmin, Place2Work

---

## Before / After

### Step 1: Install dependencies

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
```

### Step 2: Create vitest.config.ts

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Step 3: Create test setup file

**File:** `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

### Step 4: Create MSW handlers

**File:** `src/test/mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // CV optimization endpoint
  http.post('/api/cv/optimize', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      optimizedText: `Optimized: ${body.text}`,
      score: 85,
      suggestions: ['Add metrics', 'Use action verbs'],
    });
  }),

  // Error scenario
  http.post('/api/cv/analyze', () => {
    return HttpResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }),
];
```

**File:** `src/test/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Step 5: Write component test

**File:** `src/features/cv-optimizer/__tests__/ResumeForm.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ResumeForm } from '../components/ResumeForm';

describe('ResumeForm', () => {
  it('submits form with user input', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ResumeForm onSubmit={onSubmit} />);

    const textarea = screen.getByRole('textbox', { name: /resume text/i });
    const button = screen.getByRole('button', { name: /optimize/i });

    await user.type(textarea, 'Software Engineer with 5 years experience');
    await user.click(button);

    expect(onSubmit).toHaveBeenCalledWith({
      text: 'Software Engineer with 5 years experience',
    });
  });

  it('shows validation error for empty input', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ResumeForm onSubmit={onSubmit} />);

    const button = screen.getByRole('button', { name: /optimize/i });
    await user.click(button);

    expect(screen.getByText(/resume text is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

### Step 6: Write service test

**File:** `src/features/cv-optimizer/__tests__/cvService.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { cvService } from '../services/cvService';

describe('cvService', () => {
  it('optimizes resume text successfully', async () => {
    const result = await cvService.optimize({
      text: 'Managed team of developers',
    });

    expect(result.optimizedText).toContain('Optimized:');
    expect(result.score).toBe(85);
    expect(result.suggestions).toHaveLength(2);
  });

  it('handles API errors gracefully', async () => {
    await expect(
      cvService.analyze({ text: 'Test resume' })
    ).rejects.toThrow('Analysis failed');
  });
});
```

### Step 7: Add npm scripts

**File:** `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

**After:**
```
src/
├── features/
│   └── cv-optimizer/
│       ├── components/
│       │   └── ResumeForm.tsx
│       ├── services/
│       │   └── cvService.ts
│       └── __tests__/
│           ├── ResumeForm.test.tsx
│           └── cvService.test.ts
├── test/
│   ├── setup.ts
│   └── mocks/
│       ├── handlers.ts
│       └── server.ts
└── vitest.config.ts
```

---

## Rules

1. Use Vitest 4 with jsdom environment
2. Use React Testing Library for component tests
3. Use MSW 2 for API mocking (no axios-mock-adapter)
4. Setup file imports `@testing-library/jest-dom/vitest`
5. Test files co-located in `__tests__/` directories
6. Always test user interactions with `@testing-library/user-event`
7. Use aria roles and labels for querying elements
8. Coverage config excludes test files and type declarations
