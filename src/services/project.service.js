import Project from '../models/Project.js';
import User from '../models/User.js';
import Status from '../models/Status.js';
import ApiError from '../utils/ApiError.js';
import { requireRole } from '../utils/permission.js';
import { emitProjectCreated, emitProjectUpdated } from '../utils/socketEmitter.js';
import { createNotificationService } from './notification.service.js';
import { createActivityService } from './activity.service.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import ProjectInvitation from '../models/ProjectInvitation.js';
import ProjectJoinRequest from '../models/ProjectJoinRequest.js';
import { sendInvitationEmail } from './mail.service.js';

/* ===================== CREATE ===================== */
export const createProjectService = async (data, userId) => {
  const inviteCode = crypto.randomBytes(4).toString('hex');

  const project = await Project.create({
    ...data,
    owner: userId,
    members: [{ user: userId, role: 'Owner' }],
    inviteCode,
  });

  // ===== DEFAULT STATUSES =====
  await Status.insertMany([
    { name: 'Phải làm', order: 0, project: project._id },
    { name: 'Đang làm', order: 1, project: project._id },
    { name: 'Kiểm tra', order: 2, project: project._id },
    { name: 'Hoàn thành', order: 3, project: project._id },
  ]);

  emitProjectCreated(project._id, project);

  return project;
};

/* ===================== GET ALL ===================== */
export const getProjectsService = async (userId) => {
  const projects = await Project.find({ 'members.user': userId }).populate(
    'members.user',
    'name email phone avatar',
  );
  return projects;
};

/* ===================== GET DETAIL ===================== */
export const getProjectDetailService = async (id) => {
  const project = await Project.findById(id).populate('members.user', 'name email phone avatar');
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

  const memberUser = await User.findById(memberId);
  if (!memberUser) throw new ApiError(404, 'User not found');

  await requireRole(projectId, userId, ['Owner', 'Admin']);

  const exists = project.members.find((m) => m.user.toString() === memberId.toString());
  if (exists) throw new ApiError(400, 'Member already exists');

  project.members.push({ user: memberId, role: role || 'Member' });
  await project.save();
  await project.populate('members.user', 'name email avatar');

  // ACTIVITY
  await createActivityService({
    project: project._id,
    user: userId,
    action: 'ADD_MEMBER',
    content: `đã thêm thành viên ${memberUser.name} vào dự án`,
  });

  // NOTIFICATION
  await createNotificationService({
    user: memberId,
    project: project._id,
    type: 'PROJECT_ADDED',
    message: `Bạn đã được thêm vào dự án "${project.name}"`,
  });

  /* ===== SOCKET ===== */
  emitProjectUpdated(project._id, project);

  return project;
};

/* ===================== REMOVE MEMBER ===================== */
export const removeMemberService = async (projectId, memberId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const memberUser = await User.findById(memberId);
  if (!memberUser) throw new ApiError(404, 'User not found');

  await requireRole(projectId, userId, ['Owner', 'Admin']);

  project.members = project.members.filter((m) => m.user.toString() !== memberId);

  await project.save();
  await project.populate('members.user', 'name email avatar');

  // ACTIVITY
  await createActivityService({
    project: project._id,
    user: userId,
    action: 'REMOVE_MEMBER',
    content: `đã xoá thành viên ${memberUser.name} khỏi dự án`,
  });

  // NOTIFICATION
  await createNotificationService({
    user: memberId,
    project: project._id,
    type: 'PROJECT_REMOVED',
    message: `Bạn đã bị xoá khỏi dự án "${project.name}"`,
  });

  /* ===== SOCKET ===== */
  emitProjectUpdated(project._id, project);
  return project;
};

/* ===================== CHANGE ROLE ===================== */
export const changeRoleService = async (projectId, memberId, role, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const memberUser = await User.findById(memberId);
  if (!memberUser) throw new ApiError(404, 'User not found');

  await requireRole(projectId, userId, ['Owner']);

  const member = project.members.find((m) => m.user.toString() === memberId.toString());
  if (!member) throw new ApiError(404, 'Member not found');

  member.role = role;
  await project.save();
  await project.populate('members.user', 'name email avatar');

  // ACTIVITY
  await createActivityService({
    project: project._id,
    user: userId,
    action: 'CHANGE_ROLE',
    content: `đã đổi vai trò của ${memberUser.name} thành ${role}`,
  });

  // NOTIFICATION
  await createNotificationService({
    user: memberId,
    project: project._id,
    type: 'ROLE_CHANGED',
    message: `Vai trò của bạn trong dự án đã được thay đổi thành ${role}`,
  });

  /* ===== SOCKET ===== */
  emitProjectUpdated(project._id, project);

  return project;
};

export const inviteByEmailService = async (projectId, email, role, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  await requireRole(projectId, userId, ['Owner', 'Admin']);

  const token = jwt.sign(
    {
      projectId,
      email,
    },
    process.env.INVITE_SECRET,
    { expiresIn: '7d' },
  );

  const invitation = await ProjectInvitation.create({
    project: projectId,
    email,
    role,
    token,
    invitedBy: userId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  await sendInvitationEmail(email, project.name, token);

  return { token };
};

export const acceptInvitationService = async (token, user) => {
  const decoded = jwt.verify(token, process.env.INVITE_SECRET);

  const invitation = await ProjectInvitation.findOne({
    token,
    status: 'Pending',
  });

  if (!invitation) throw new ApiError(400, 'Invalid invitation');

  if (invitation.expiresAt < new Date()) throw new ApiError(400, 'Invitation expired');

  if (user.email !== invitation.email) throw new ApiError(403, 'Email does not match invitation');

  const project = await Project.findById(invitation.project);

  const userId = user._id.toString();

  const exists = project.members.some((m) => {
    if (!m?.user) return false;
    return m.user.toString() === userId;
  });
  if (!exists) {
    project.members.push({ user: user._id, role: invitation.role });
    await project.save();
  }

  invitation.status = 'Accepted';
  await invitation.save();

  await project.populate('members.user', 'name email phone avatar');

  await createActivityService({
    project: project._id,
    user: user._id,
    action: 'ACCEPT_INVITATION',
    content: `đã tham gia dự án`,
  });

  emitProjectUpdated(project._id, project);

  return project;
};

export const joinByCodeService = async (inviteCode, userId) => {
  const project = await Project.findOne({ inviteCode });
  if (!project) throw new ApiError(404, 'Invalid invite code');

  const isMember = project.members.find((m) => m.user.toString() === userId.toString());

  if (isMember) throw new ApiError(400, 'Already a member');

  // check existing request
  const existing = await ProjectJoinRequest.findOne({
    project: project._id,
    user: userId,
    status: 'Pending',
  });

  if (existing) throw new ApiError(400, 'Request already submitted');

  const request = await ProjectJoinRequest.create({
    project: project._id,
    user: userId,
  });

  return request;
};

export const getJoinRequestsService = async (projectId, userId, status = 'Pending') => {
  await requireRole(projectId, userId, ['Owner', 'Admin']);

  const requests = await ProjectJoinRequest.find({
    project: projectId,
    status,
  })
    .populate('user', 'name email phone avatar')
    .sort({ createdAt: -1 });

  return requests;
};

export const approveJoinRequestService = async (requestId, ownerId) => {
  const request = await ProjectJoinRequest.findById(requestId);
  if (!request) throw new ApiError(404, 'Request not found');
  if (!request.user) {
    throw new ApiError(400, 'Invalid user in request');
  }

  if (request.status !== 'Pending') throw new ApiError(400, 'Request already processed');

  await requireRole(request.project, ownerId, ['Owner', 'Admin']);

  const project = await Project.findById(request.project);
  if (!project) throw new ApiError(404, 'Project not found');

  const requestUserId = request.user.toString();

  const alreadyMember = project.members.find((m) => {
    if (!m.user) return false;
    return m.user.toString() === requestUserId;
  });
  if (!alreadyMember) {
    project.members.push({ user: request.user, role: 'Member' });
    await project.save();
  }

  request.status = 'Approved';
  await request.save();
  await project.populate('members.user', 'name email phone avatar');

  // ===== ACTIVITY =====
  await createActivityService({
    project: project._id,
    user: ownerId,
    action: 'APPROVE_JOIN_REQUEST',
    content: `đã duyệt yêu cầu tham gia dự án`,
  });

  // ===== NOTIFICATION =====
  await createNotificationService({
    user: request.user,
    project: project._id,
    type: 'JOIN_APPROVED',
    message: `Yêu cầu tham gia dự án "${project.name}" đã được chấp thuận`,
  });

  // ===== SOCKET =====
  emitProjectUpdated(project._id, project);

  return project;
};

export const rejectJoinRequestService = async (requestId, ownerId) => {
  const request = await ProjectJoinRequest.findById(requestId);
  if (!request) throw new ApiError(404, 'Request not found');

  if (request.status !== 'Pending') throw new ApiError(400, 'Request already processed');

  await requireRole(request.project, ownerId, ['Owner', 'Admin']);

  request.status = 'Rejected';
  await request.save();

  const project = await Project.findById(request.project);
  await project.populate('members.user', 'name email phone avatar');

  // ===== ACTIVITY =====
  await createActivityService({
    project: project._id,
    user: ownerId,
    action: 'REJECT_JOIN_REQUEST',
    content: `đã từ chối yêu cầu tham gia dự án`,
  });

  // ===== NOTIFICATION =====
  await createNotificationService({
    user: request.user,
    project: project._id,
    type: 'JOIN_REJECTED',
    message: `Yêu cầu tham gia dự án "${project.name}" đã bị từ chối`,
  });

  emitProjectUpdated(project._id, project);

  return project;
};
