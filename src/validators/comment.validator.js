import { z } from 'zod';

const objectId = z.string().length(24);

export const createCommentSchema = z.object({
  issueId: objectId,
  content: z.string().min(1).max(1000),
});
