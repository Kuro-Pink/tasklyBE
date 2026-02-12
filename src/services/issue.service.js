import Issue from '../models/Issue.js';
import ApiError from '../utils/ApiError.js';
import { requireRole } from '../utils/permission.js';
import {
  emitIssueCreated,
  emitIssueUpdated,
  emitIssueDeleted,
  emitIssueMovedStatus,
  emitIssueMovedSprint,
  emitIssueAssigned,
} from '../utils/socketEmitter.js';
import { createNotificationService } from './notification.service.js';
import { createActivityService } from './activity.service.js';

/* ===================== CREATE ===================== */
export const createIssueService = async (data, userId) => {
  const {
    title,
    description,
    type,
    projectId,
    statusId,
    sprintId,
    assigneeId,
    parentId,
    reporterId,
  } = data;

  if (!title || !type || !projectId || !statusId) {
    throw new ApiError(400, 'Missing required fields');
  }

  await requireRole(projectId, userId, ['Owner', 'Admin', 'Member']);

  let parentIssue = null;

  // Epic không có parent
  if (type === 'Epic' && parentId) {
    throw new ApiError(400, 'Epic cannot have parent');
  }

  // Subtask phải có parent
  if (type === 'Subtask' && !parentId) {
    throw new ApiError(400, 'Subtask must have parent');
  }

  if (parentId) {
    parentIssue = await Issue.findById(parentId);
    if (!parentIssue) throw new ApiError(404, 'Parent issue not found');

    if (parentIssue.type === 'Subtask') {
      throw new ApiError(400, 'Cannot assign subtask as parent');
    }

    if (parentIssue.project.toString() !== projectId.toString()) {
      throw new ApiError(400, 'Parent must be in same project');
    }

    if (parentIssue.type === 'Epic' && type === 'Subtask') {
      throw new ApiError(400, 'Subtask must belong to Story/Bug/Task');
    }
  }

  const issue = await Issue.create({
    title,
    description: description || null,
    type,
    project: projectId,
    status: statusId,
    sprint: sprintId || null,
    assignee: assigneeId || null,
    parent: parentId || null,
    reporter: reporterId,
  });
  await issue.populate('assignee', 'name avatar');

  await createActivityService({
    project: issue.project,
    issue: issue._id,
    user: userId,
    action: 'CREATE_ISSUE',
    content: `đã tạo công việc "${issue.title}"`,
  });

  emitIssueCreated(issue.project, issue);

  return issue;
};

/* ===================== GET ISSUE ===================== */
export const getIssuesService = async (query) => {
  const {
    project,
    status,
    assignee,
    priority,
    search,
    sort = '-createdAt',
    page = 1,
    limit = 20,
  } = query;

  const filter = {};

  if (project) filter.project = project;
  if (status) filter.status = status;
  if (assignee) filter.assignee = assignee;
  if (priority) filter.priority = priority;

  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const issues = await Issue.find(filter)
    .populate('assignee reporter status')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  return issues;
};

/* ===================== COUNT ISSUE ===================== */
export const countIssuesService = async (query) => {
  const filter = {};

  if (query.project) filter.project = query.project;

  return Issue.countDocuments(filter);
};

/* ===================== GET DETAIL ===================== */
export const getIssueDetailService = async (id) => {
  const issue = await Issue.findById(id)
    .populate('status')
    .populate('assignee')
    .populate('reporter')
    .populate('parent')
    .populate('sprint');

  if (!issue) throw new ApiError(404, 'Issue not found');

  const children = await Issue.find({ parent: id }).populate('status').populate('assignee');

  return {
    ...issue.toObject(),
    children,
  };
};

/* ===================== UPDATE ===================== */
export const updateIssueService = async (id, updates, userId) => {
  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

  await requireRole(issue.project, userId, ['Owner', 'Admin', 'Member']);

  const newType = updates.type || issue.type;
  const newProject = updates.projectId || issue.project.toString();
  const newParent = updates.parentId !== undefined ? updates.parentId : issue.parent;

  // ===== RULE TYPE =====
  if (newType === 'Epic' && newParent) {
    throw new ApiError(400, 'Epic cannot have parent');
  }

  if (newType === 'Subtask' && !newParent) {
    throw new ApiError(400, 'Subtask must have parent');
  }

  // ===== CHECK PARENT =====
  if (newParent) {
    const parentIssue = await Issue.findById(newParent);
    if (!parentIssue) throw new ApiError(404, 'Parent issue not found');

    if (parentIssue.type === 'Subtask') {
      throw new ApiError(400, 'Cannot assign subtask as parent');
    }

    if (parentIssue.project.toString() !== newProject) {
      throw new ApiError(400, 'Parent must be in same project');
    }

    if (parentIssue.type === 'Epic' && newType === 'Subtask') {
      throw new ApiError(400, 'Subtask must belong to Story/Bug/Task');
    }
  }

  issue.title = updates.title ?? issue.title;
  issue.description = updates.description ?? issue.description;
  issue.type = newType;
  issue.project = newProject;
  issue.status = updates.statusId ?? issue.status;
  issue.sprint = updates.sprintId ?? issue.sprint;
  issue.assignee = updates.assigneeId ?? issue.assignee;
  issue.parent = newParent || null;

  await issue.save();
  await issue.populate('assignee', 'name avatar');
  emitIssueUpdated(issue.project, issue);

  return issue;
};

/* ===================== DELETE ===================== */
export const deleteIssueService = async (id, userId) => {
  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

  await requireRole(issue.project, userId, ['Owner', 'Admin']);

  // xoá children
  await Issue.deleteMany({ parent: id });

  await Issue.findByIdAndDelete(id);
  await issue.populate('assignee', 'name avatar');

  await createActivityService({
    project: issue.project,
    user: userId,
    action: 'DELETE_ISSUE',
    content: `đã xoá công việc "${issue.title}"`,
  });

  emitIssueDeleted(issue.project, id);

  return true;
};

/* ===================== MOVE STATUS ===================== */
export const moveStatusService = async (id, statusId, userId) => {
  const issue = await Issue.findById(id);
  const status = await Status.findById(statusId);

  if (!issue) throw new ApiError(404, 'Issue not found');

  await requireRole(projectId, userId, ['Owner', 'Admin']);

  issue.status = statusId;
  await issue.save();
  await issue.populate('assignee', 'name avatar');

  await createActivityService({
    project: issue.project,
    issue: issue._id,
    user: userId,
    action: 'MOVE_STATUS',
    content: `đã chuyển trạng thái "${issue.title}" sang ${status.name}`,
  });

  emitIssueMovedStatus(issue.project, issue);

  return issue;
};

/* ===================== MOVE SPRINT ===================== */
export const moveSprintService = async (id, sprintId, userId) => {
  const issue = await Issue.findById(id);
  const sprint = sprintId ? await Sprint.findById(sprintId) : null;

  if (!issue) throw new ApiError(404, 'Issue not found');

  issue.sprint = sprintId || null;
  await issue.save();
  await issue.populate('assignee', 'name avatar');

  await createActivityService({
    project: issue.project,
    issue: issue._id,
    user: userId,
    action: 'MOVE_SPRINT',
    content: `đã chuyển công việc "${issue.title}" sang sprint ${sprint.name}`,
  });

  emitIssueMovedSprint(issue.project, issue);

  return issue;
};

/* ===================== ASSIGN USER ===================== */
export const assignUserService = async (id, assigneeId, userId) => {
  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

  await requireRole(issue.project, userId, ['Owner', 'Admin']);

  issue.assignee = assigneeId;
  await issue.save();
  await issue.populate('assignee', 'name avatar');

  // ACTIVITY
  await createActivityService({
    project: issue.project,
    issue: issue._id,
    user: userId,
    action: 'ASSIGN_ISSUE',
    content: `đã giao công việc "${issue.title}" cho ${issue.assignee.name}`,
  });

  // NOTIFICATION
  await createNotificationService({
    user: assigneeId,
    project: issue.project,
    issue: issue._id,
    type: 'ASSIGN',
    content: `Bạn được giao công việc "${issue.title}"`,
  });

  /* ===== SOCKET ===== */
  emitIssueAssigned(issue.project, issue);

  return issue;
};

/* ===================== CHANGE PARENT ===================== */
export const changeParentService = async (id, parentId, userId) => {
  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

  await requireRole(issue.project, userId, ['Owner', 'Admin', 'Member']);

  if (issue.type === 'Epic' && parentId) {
    throw new ApiError(400, 'Epic cannot have parent');
  }

  if (issue.type === 'Subtask' && !parentId) {
    throw new ApiError(400, 'Subtask must have parent');
  }

  if (parentId) {
    const parentIssue = await Issue.findById(parentId);
    if (!parentIssue) throw new ApiError(404, 'Parent issue not found');

    if (parentIssue.type === 'Subtask') {
      throw new ApiError(400, 'Cannot assign subtask as parent');
    }

    if (parentIssue.project.toString() !== issue.project.toString()) {
      throw new ApiError(400, 'Parent must be same project');
    }
  }

  issue.parent = parentId || null;
  await issue.save();

  return issue;
};
