import { z } from 'zod';

export const createStatusSchema = z.object({
  name: z.string().min(2).max(50),
  projectId: z.string().length(24),
  color: z.string().optional(),
  order: z.number().optional(),
});
