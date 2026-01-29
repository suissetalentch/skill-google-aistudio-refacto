# 10 — Code Quality

## The Problem

AI Studio produces code with no error boundaries, unsafe parsing, and AI Studio artifacts:

```tsx
// exemple-bad-aistudio/App.tsx — no ErrorBoundary
const App: React.FC = () => {
  // If any child throws, the entire app crashes with a white screen
  return (
    <div>
      <Header />
      <ResumeForm onSubmit={handleProcessCV} isLoading={loading} />
      {result && <ResumePreview data={result.updatedCV} />}
    </div>
  );
};
```

```ts
// exemple-bad-aistudio/services/geminiService.ts — unsafe JSON.parse
const rawJson = response.text;
const data = JSON.parse(rawJson);  // Crashes if AI returns malformed JSON

const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
  ?.filter((chunk: any) => chunk.web)    // any type
  ?.map((chunk: any) => ({               // any type again
    title: chunk.web.title,
    uri: chunk.web.uri
  })) || [];
```

```json
// exemple-bad-aistudio/metadata.json — AI Studio artifact
{
  "name": "Grenoble Career Optimizer",
  "description": "A premium CV optimizer...",
  "requestFramePermissions": ["geolocation"]
}
```

Issues:
- **No ErrorBoundary** — any unhandled error crashes the entire application to a white screen
- **Unsafe `JSON.parse`** — AI responses can be malformed, causing uncaught exceptions
- **`any` type in filters/maps** — defeats TypeScript's purpose
- **`metadata.json`** — AI Studio artifact that has no use in production
- **No structured logging** — bare `console.error(err)` with no context

## The Standard

### ErrorBoundary (DahuAdmin pattern)

```tsx
// DahuAdmin/src/components/common/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div role="alert" className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl p-6 text-center shadow-lg">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-6">
              The application encountered an unexpected error. Please try again.
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Before / After

### Step 1: Add ErrorBoundary

```tsx
// BEFORE — src/main.tsx
import { App } from './App';
createRoot(document.getElementById('root')!).render(<App />);

// AFTER — src/main.tsx
import { App } from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
```

### Step 2: Safe JSON parsing

```ts
// BEFORE
const data = JSON.parse(rawJson);

// AFTER
function safeJsonParse<T>(json: string): T {
  try {
    return JSON.parse(json) as T;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    throw new Error(`Failed to parse response: ${message}`);
  }
}

const data = safeJsonParse<AnalysisResponse>(rawJson);
```

### Step 3: Type narrowing instead of `any`

```ts
// BEFORE
const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
  ?.filter((chunk: any) => chunk.web)
  ?.map((chunk: any) => ({
    title: chunk.web.title,
    uri: chunk.web.uri
  })) || [];

// AFTER
interface GroundingChunk {
  web?: { title: string; uri: string };
}

const chunks: GroundingChunk[] =
  response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

const sources = chunks
  .filter((chunk): chunk is GroundingChunk & { web: { title: string; uri: string } } =>
    chunk.web !== undefined
  )
  .map((chunk) => ({
    title: chunk.web.title,
    uri: chunk.web.uri,
  }));
```

### Step 4: Delete metadata.json

```bash
# This file is an AI Studio project descriptor — not needed in production
rm metadata.json
```

### Step 5: Structured error logging

```ts
// BEFORE
console.error(err);

// AFTER
console.error('[CVOptimizer] Analysis failed:', {
  error: error instanceof Error ? error.message : 'Unknown error',
  context: { cvLength: text.length, hasSkills: !!additionalSkills },
});
```

## Rules

1. **Add an ErrorBoundary** — wrap `<App />` in `<ErrorBoundary>` in main.tsx. Use the DahuAdmin pattern with retry and fallback support.
2. **Wrap all `JSON.parse` calls** — use a `safeJsonParse<T>()` utility that catches and re-throws with context.
3. **Eliminate `any` type** — define interfaces for external API responses. Use type guards for narrowing.
4. **Delete `metadata.json`** — this AI Studio artifact has no production purpose.
5. **Structured logging** — prefix console output with `[ComponentName]` and include relevant context.
6. **Optional: Add feature-level ErrorBoundaries** — wrap individual features so one failure doesn't bring down the entire app.
7. **Clean up unused imports** — AI Studio often leaves unused imports. Remove them.
