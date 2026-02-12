import { z } from 'zod';

const objectId = z.string().length(24);

export const createIssueSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().optional(),

    type: z.enum(['Epic', 'Story', 'Task', 'Bug', 'Subtask']),
    project: objectId,
    status: objectId,

    sprint: objectId.optional(),
    assignee: objectId.optional(),
    parent: objectId.optional(),

    priority: z.enum(['Low', 'Medium', 'High']).optional(),
  }),
});
