# 13 — Accessibility

## The Problem

AI Studio generates code with no accessibility support:

```tsx
// Typical AI Studio generated component
export default function JobApplicationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="container">
      <button onClick={() => navigate(-1)}>
        <ArrowLeft />
      </button>

      <label>CV Text</label>
      <textarea
        value={cvText}
        onChange={(e) => setCvText(e.target.value)}
      />

      {error && <div className="error">{error}</div>}

      <button disabled={isLoading}>
        {isLoading && <Loader2 className="animate-spin" />}
        Submit
      </button>

      <a href={docUrl} target="_blank">
        <ExternalLink /> View document
      </a>
    </div>
  );
}
```

**Issues:**
- No `aria-label` on icon-only back button
- No `aria-hidden` on decorative icons
- No `role="alert"` on error messages
- No `htmlFor` on labels, no `id` on inputs
- No `aria-invalid` or `aria-describedby` on form errors
- No `sr-only` text for screen readers
- No `aria-busy` on loading states
- Missing `rel="noopener noreferrer"` on external links

## The Standard

Production-grade accessibility from real projects (DahuAdmin, Place2Work):

```tsx
// Accessible icon-only button
<button
  onClick={handleBack}
  aria-label={t('common.backButton')}
>
  <ArrowLeft aria-hidden="true" />
</button>

// Accessible form field with error
<label htmlFor="email">{t('form.email')}</label>
<input
  id="email"
  type="email"
  {...register('email')}
  aria-invalid={errors.email ? 'true' : undefined}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <p id="email-error" role="alert" className="error">
    {errors.email.message}
  </p>
)}

// Accessible loading state
<button type="submit" disabled={isPending} aria-busy={isPending}>
  {isPending && (
    <>
      <Loader2 className="animate-spin" aria-hidden="true" />
      <span className="sr-only">{t('common.loading')}</span>
    </>
  )}
  {t('form.submit')}
</button>
```

## Before / After

### Step 1: Icon-only buttons need aria-label

```tsx
// BEFORE
<button onClick={reset}><ArrowLeft /></button>

// AFTER
<button onClick={reset} aria-label={t('form.backButton')}>
  <ArrowLeft aria-hidden="true" />
</button>
```

### Step 2: Decorative icons use aria-hidden

```tsx
// BEFORE
<Loader2 className="animate-spin" />

// AFTER
<Loader2 className="animate-spin" aria-hidden="true" />
<span className="sr-only">{t('common.loading')}</span>
```

### Step 3: Form labels use htmlFor

```tsx
// BEFORE
<label>CV Text</label>
<textarea {...register('cvText')} />

// AFTER
<label htmlFor="cvText">{t('form.cvText')}</label>
<textarea
  id="cvText"
  {...register('cvText')}
  aria-invalid={errors.cvText ? 'true' : undefined}
  aria-describedby={errors.cvText ? 'cvText-error' : undefined}
/>
{errors.cvText && (
  <p id="cvText-error" role="alert">
    {errors.cvText.message}
  </p>
)}
```

### Step 4: Error alerts use role="alert"

```tsx
// BEFORE
<div className="error">{error}</div>

// AFTER
<div role="alert" className="error">{error}</div>
```

### Step 5: External links announce destination

```tsx
// BEFORE
<a href={url} target="_blank">
  <ExternalLink /> View document
</a>

// AFTER
<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={`${title} (external link)`}
>
  <ExternalLink aria-hidden="true" />
  {title}
</a>
```

### Step 6: Loading states use aria-busy

```tsx
// BEFORE
<button disabled={isLoading}>
  {isLoading && <Loader2 className="animate-spin" />}
  Submit
</button>

// AFTER
<button disabled={isPending} aria-busy={isPending}>
  {isPending && (
    <>
      <Loader2 className="animate-spin" aria-hidden="true" />
      <span className="sr-only">{t('common.loading')}</span>
    </>
  )}
  {t('form.submit')}
</button>
```

## Rules

1. **Every icon-only button must have `aria-label`** — Describe the action, not the icon
2. **Decorative icons use `aria-hidden="true"`** — Spinners, status icons, visual embellishments
3. **Spinner/loading icons pair with `sr-only` text** — Always provide text alternative
4. **Form labels use `htmlFor` matching input `id`** — Enables click-to-focus
5. **Form errors use `role="alert"` + `aria-describedby` linking** — Connect error to field
6. **Error containers use `role="alert"`** — Announces dynamically to screen readers
7. **External links use `rel="noopener noreferrer"` and `aria-label` with "(external link)"** — Security + context
8. **Loading buttons use `aria-busy`** — Communicates processing state
9. **Sections use `aria-label` for landmark navigation** — Example: `<section aria-label="Job applications">`
10. **`sr-only` text uses `t()` for i18n** — screen reader text is user-facing and must be translated. Use `{t('common.loading')}` not `"Loading..."`.
