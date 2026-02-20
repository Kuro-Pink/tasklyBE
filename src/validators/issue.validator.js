import { z } from 'zod';

const objectId = z.string().length(24);

export const createIssueSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),

  type: z.enum(['Epic', 'Story', 'Task', 'Bug', 'Subtask']),
  projectId: objectId,
  statusId: objectId.optional(),

  sprintId: objectId.optional(),
  assigneeId: objectId.optional(),
  parentId: objectId.optional(),

  priority: z.enum(['Low', 'Medium', 'High']).optional(),
});
