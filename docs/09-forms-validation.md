# 09 — Forms and Validation

## The Problem

AI Studio uses raw `useState` for form management and hardcodes default data:

```tsx
// exemple-bad-aistudio/components/ResumeForm.tsx

const DEFAULT_CV = `Abdel-Hadi BENHAMMOU
Responsable Secteur Vente
abdelhadi.ben@icloud.com | +33 6 74 86 76 03
Grenoble, FRANCE

EXPÉRIENCES:
- Pill' à l'heure (Challenge Start'up): 09/2022 - 02/2023...
- Flex Cuisine (Adjoint responsable): 12/2021 - Actuellement...
// ... real personal data hardcoded
`;

const ResumeForm: React.FC<ResumeFormProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState(DEFAULT_CV);
  const [extraSkills, setExtraSkills] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text, extraSkills);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <input value={extraSkills} onChange={(e) => setExtraSkills(e.target.value)} />
      <button type="submit" disabled={isLoading || !text.trim()}>Submit</button>
    </form>
  );
};
```

Issues:
- **Hardcoded personal data** — real names, emails, phone numbers in source code
- **No validation library** — manual `text.trim()` check is the only validation
- **No schema validation** — no type-safe validation of form structure
- **Raw `useState` + `onChange`** — doesn't scale for complex forms, no dirty/touched tracking
- **No error messages per field** — only a global disabled state

## The Standard

Two approaches from production projects:

### React Hook Form + Zod (place2work)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const cvFormSchema = z.object({
  cvText: z.string().min(50, 'CV must be at least 50 characters'),
  additionalSkills: z.string().optional(),
});

type CVFormData = z.infer<typeof cvFormSchema>;

export function ResumeForm({ onSubmit }: { onSubmit: (data: CVFormData) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CVFormData>({
    resolver: zodResolver(cvFormSchema),
    defaultValues: { cvText: '', additionalSkills: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <textarea {...register('cvText')} />
      {errors.cvText && <p className="text-red-500 text-sm">{errors.cvText.message}</p>}

      <input {...register('additionalSkills')} />

      <button type="submit" disabled={isSubmitting}>Submit</button>
    </form>
  );
}
```

## Before / After

### Step 1: Extract default data to constants

```ts
// BEFORE — hardcoded personal data in component
const DEFAULT_CV = `Abdel-Hadi BENHAMMOU
abdelhadi.ben@icloud.com | +33 6 74 86 76 03...`;

// AFTER — src/features/cv-optimizer/constants/defaults.ts
export const CV_PLACEHOLDER = `[Your full name]
[Your email] | [Your phone]
[City, Country]

EXPERIENCE:
- [Company] ([Role]): [Period]. [Description].

EDUCATION:
- [School]: [Degree] ([Year])`;
```

### Step 2: Add Zod schema

```ts
// src/features/cv-optimizer/schemas/cvForm.ts
import { z } from 'zod';

export const cvFormSchema = z.object({
  cvText: z
    .string()
    .min(50, 'CV content must be at least 50 characters')
    .max(10000, 'CV content must not exceed 10,000 characters'),
  additionalSkills: z
    .string()
    .max(500, 'Skills must not exceed 500 characters')
    .optional()
    .default(''),
});

export type CVFormData = z.infer<typeof cvFormSchema>;
```

### Step 3: Use React Hook Form

```tsx
// BEFORE
const [text, setText] = useState(DEFAULT_CV);
const [extraSkills, setExtraSkills] = useState('');
<textarea value={text} onChange={(e) => setText(e.target.value)} />

// AFTER
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cvFormSchema, type CVFormData } from '../schemas/cvForm';
import { CV_PLACEHOLDER } from '../constants/defaults';

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CVFormData>({
  resolver: zodResolver(cvFormSchema),
  defaultValues: { cvText: '', additionalSkills: '' },
});

<textarea
  {...register('cvText')}
  placeholder={CV_PLACEHOLDER}
/>
{errors.cvText && (
  <p className="text-red-500 text-sm mt-1">{errors.cvText.message}</p>
)}
```

### Install dependencies

```bash
npm install react-hook-form @hookform/resolvers zod
```

## Rules

1. **Never hardcode personal data** — use empty defaults or placeholder text. Real data goes in constants as example format only.
2. **Install Zod** — `npm install zod` for schema-first validation.
3. **Define schemas in `schemas/` or `constants/`** — separate from component files.
4. **Use `z.infer<typeof schema>`** — derive TypeScript types from Zod schemas, not the other way around.
5. **Use React Hook Form for complex forms** — `npm install react-hook-form @hookform/resolvers`. Use `zodResolver` for integration.
6. **Show per-field errors** — display `errors.fieldName.message` below each input.
7. **Use `isSubmitting` from RHF** — replace manual `isLoading` state with the form's built-in state.
8. **Keep `useState` for simple forms** — if a form has only 1-2 fields with no complex validation, `useState` is fine.
