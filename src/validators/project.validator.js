import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  key: z
    .string()
    .min(2)
    .max(10)
    .regex(/^[A-Z]+$/, 'Project key must be uppercase'),
  description: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
});
