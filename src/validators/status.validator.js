import { z } from 'zod';

export const createStatusSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    color: z.string().optional(),
    order: z.number().optional(),
  }),
});
