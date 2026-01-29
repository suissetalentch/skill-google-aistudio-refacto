import { z } from 'zod';

export const cvFormSchema = z.object({
  cvText: z
    .string()
    .min(50, 'Le CV doit contenir au moins 50 caractères')
    .max(10000, 'Le CV ne doit pas dépasser 10 000 caractères'),
  additionalSkills: z
    .string()
    .max(500, 'Les compétences ne doivent pas dépasser 500 caractères'),
});

export type CVFormData = z.infer<typeof cvFormSchema>;
