import Project from '../models/Project.js';
import ApiError from '../utils/ApiError.js';
import { requireRole } from '../utils/permission.js';
import { emitProjectCreated, emitProjectUpdated } from '../utils/socketEmitter.js';
import { createNotificationService } from './notification.service.js';
import { createActivityService } from './activity.service.js';

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
  await requireRole(id, userId, ['Owner', 'Admin']);

  project.name = updates.name ?? project.name;
  project.description = updates.description ?? project.description;

  await project.save();
  await project.populate('members.user', 'name email avatar');

  await createActivityService({
    project: project._id,
    user: userId,
    action: 'UPDATE_PROJECT',
    content: `đã cập nhật thông tin dự án`,
  });

  emitProjectUpdated(project._id, project);
  return project;
};

/* ===================== DELETE ===================== */
export const deleteProjectService = async (id, userId) => {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  await requireRole(id, userId, ['Owner']);

  await Project.findByIdAndDelete(id);
  return true;
};

/* ===================== ADD MEMBER ===================== */
export const addMemberService = async (projectId, memberId, role, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  await requireRole(projectId, userId, ['Owner', 'Admin']);

  const exists = project.members.find((m) => m.user.toString() === memberId);
  if (exists) throw new ApiError(400, 'Member already exists');

  project.members.push({ user: memberId, role: role || 'Member' });
  await project.save();
  await project.populate('members.user', 'name email avatar');

  await createActivityService({
    project: project._id,
    user: userId,
    action: 'ADD_MEMBER',
    content: `đã thêm thành viên ${member.name} vào dự án`,
  });

  /* ===== SOCKET ===== */
  emitProjectUpdated(project._id, project);

  return project;
};

/* ===================== REMOVE MEMBER ===================== */
export const removeMemberService = async (projectId, memberId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  await requireRole(projectId, userId, ['Owner', 'Admin']);

  project.members = project.members.filter((m) => m.user.toString() !== memberId);

  await project.save();
  await project.populate('members.user', 'name email avatar');

  await createActivityService({
    project: project._id,
    user: userId,
    action: 'REMOVE_MEMBER',
    content: `đã xoá thành viên ${member.name} khỏi dự án`,
  });

  /* ===== SOCKET ===== */
  emitProjectUpdated(project._id, project);
  return project;
};

/* ===================== CHANGE ROLE ===================== */
export const changeRoleService = async (projectId, memberId, role, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  await requireRole(projectId, userId, ['Owner']);

  const member = project.members.find((m) => m.user.toString() === memberId);
  if (!member) throw new ApiError(404, 'Member not found');

  member.role = role;
  await project.save();
  await project.populate('members.user', 'name email avatar');

  // ACTIVITY
  await createActivityService({
    project: project._id,
    user: userId,
    action: 'CHANGE_ROLE',
    content: `đã đổi vai trò của ${member.name} thành ${role}`,
  });

  // NOTIFICATION
  await createNotificationService({
    user: memberId,
    project: project._id,
    type: 'ROLE_CHANGED',
    content: `Vai trò của bạn trong dự án đã được thay đổi thành ${role}`,
  });

  /* ===== SOCKET ===== */
  emitProjectUpdated(project._id, project);

  return project;
};
