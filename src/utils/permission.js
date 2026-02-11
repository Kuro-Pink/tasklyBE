import Project from '../models/Project.js';
import ApiError from './ApiError.js';

export const getUserRoleInProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const member = project.members.find((m) => m.user.toString() === userId.toString());

  if (!member) throw new ApiError(403, 'You are not in this project');

  return member.role;
};

export const requireRole = async (projectId, userId, roles = []) => {
  const role = await getUserRoleInProject(projectId, userId);

  if (!roles.includes(role)) {
    throw new ApiError(403, 'Permission denied');
  }

  return role;
};
