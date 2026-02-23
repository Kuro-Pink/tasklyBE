import Label from '../models/Label.js';
import { requireRole } from '../utils/permission.js';

export const createLabel = async (projectId, name, userId) => {
  await requireRole(projectId, userId, ['Owner', 'Admin', 'Member']);

  const label = await Label.create({
    project: projectId,
    name,
  });

  return label;
};

export const getProjectLabels = async (projectId) => {
  return await Label.find({ project: projectId }).sort({ name: 1 });
};
