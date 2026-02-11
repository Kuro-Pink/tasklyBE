import Project from '../models/Project.js';
import ApiError from '../utils/ApiError.js';
import { emitProjectCreated, emitProjectUpdated } from '../utils/socketEmitter.js';

/* ===================== CREATE ===================== */
export const createProjectService = async (data, userId) => {
  const project = await Project.create({
    ...data,
    owner: userId,
    members: [{ user: userId, role: 'Owner' }],
  });

  emitProjectCreated(project._id, project);

  return project;
};

/* ===================== GET ALL ===================== */
export const getProjectsService = async (userId) => {
  const projects = await Project.find({ 'members.user': userId });
  return projects;
};

/* ===================== GET DETAIL ===================== */
export const getProjectDetailService = async (id) => {
  const project = await Project.findById(id).populate('members.user');
  if (!project) throw new ApiError(404, 'Project not found');

  return project;
};

/* ===================== UPDATE ===================== */
export const updateProjectService = async (id, updates, userId) => {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  // chỉ owner mới được sửa
  if (project.owner.toString() !== userId.toString()) {
    throw new ApiError(403, 'Only owner can update project');
  }

  project.name = updates.name ?? project.name;
  project.description = updates.description ?? project.description;

  await project.save();
  await project.populate('members.user', 'name email avatar');
  emitProjectUpdated(project._id, project);
  return project;
};

/* ===================== DELETE ===================== */
export const deleteProjectService = async (id, userId) => {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  if (project.owner.toString() !== userId.toString()) {
    throw new ApiError(403, 'Only owner can delete project');
  }

  await Project.findByIdAndDelete(id);
  return true;
};

/* ===================== ADD MEMBER ===================== */
export const addMemberService = async (projectId, memberId, role, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  if (project.owner.toString() !== userId.toString()) {
    throw new ApiError(403, 'Only owner can add member');
  }

  const exists = project.members.find((m) => m.user.toString() === memberId);
  if (exists) throw new ApiError(400, 'Member already exists');

  project.members.push({ user: memberId, role: role || 'Member' });
  await project.save();
  await project.populate('members.user', 'name email avatar');
  emitProjectUpdated(project._id, project);

  return project;
};

/* ===================== REMOVE MEMBER ===================== */
export const removeMemberService = async (projectId, memberId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  if (project.owner.toString() !== userId.toString()) {
    throw new ApiError(403, 'Only owner can remove member');
  }

  project.members = project.members.filter((m) => m.user.toString() !== memberId);

  await project.save();
  await project.populate('members.user', 'name email avatar');
  emitProjectUpdated(project._id, project);
  return project;
};

/* ===================== CHANGE ROLE ===================== */
export const changeRoleService = async (projectId, memberId, role, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  if (project.owner.toString() !== userId.toString()) {
    throw new ApiError(403, 'Only owner can change role');
  }

  const member = project.members.find((m) => m.user.toString() === memberId);
  if (!member) throw new ApiError(404, 'Member not found');

  member.role = role;
  await project.save();
  await project.populate('members.user', 'name email avatar');
  emitProjectUpdated(project._id, project);

  return project;
};
