import { z } from 'zod';

export const cvFormSchema = z.object({
  cvText: z
    .string()
    .min(50, 'validation.cvMinLength')
    .max(10000, 'validation.cvMaxLength'),
  additionalSkills: z
    .string()
    .max(500, 'validation.skillsMaxLength')
    .optional()
    .default(''),
});

export type CVFormData = z.infer<typeof cvFormSchema>;
