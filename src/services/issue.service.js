import Issue from '../models/Issue.js';
import Status from '../models/Status.js';
import Sprint from '../models/Sprint.js';
import Counter from '../models/Counter.js';
import Label from '../models/Label.js';
import Project from '../models/Project.js';
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
import mongoose from 'mongoose';

const populateIssueFull = async (issue) => {
  return issue.populate([
    { path: 'project' },
    { path: 'status' },
    { path: 'sprint' },
    { path: 'labels' },
    { path: 'assignee', select: 'name avatar' },
    { path: 'reporter', select: 'name avatar' },
    { path: 'parent', select: '_id title type number' },
  ]);
};

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

  if (!title || !type || !projectId) {
    throw new ApiError(400, 'Missing required fields');
  }

  await requireRole(projectId, userId, ['Owner', 'Admin', 'Member']);

  let finalStatusId = statusId;

  if (!finalStatusId) {
    const firstStatus = await Status.findOne({ project: projectId }).sort('order');

    if (!firstStatus) {
      throw new ApiError(400, 'Project has no status');
    }

    finalStatusId = firstStatus._id;
  }

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
    console.log('parentIssue', parentIssue);
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

  // ===== AUTO NUMBER =====

  const counter = await Counter.findOneAndUpdate(
    { project: projectId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  const nextNumber = counter.seq;

  const issue = await Issue.create({
    title,
    description: description || null,
    type,
    project: projectId,
    status: finalStatusId,
    sprint: sprintId || null,
    assignee: assigneeId || null,
    parent: parentId || null,
    reporter: reporterId,
    number: nextNumber,
  });
  await issue.populate([
    { path: 'project' },
    { path: 'status' },
    { path: 'sprint' },
    { path: 'assignee', select: 'name avatar' },
    { path: 'reporter', select: 'name avatar' },
    { path: 'parent', select: '_id title type number' },
  ]);

  await createActivityService({
    project: issue.project,
    issue: issue._id,
    user: userId,
    action: 'CREATE_ISSUE',
    content: `đã tạo công việc "${issue.title}"`,
  });

  /* ===== RECALC EPIC AFTER CREATE ===== */
  if (issue.parent) {
    const parentIssue = await Issue.findById(issue.parent);
    if (parentIssue?.type === 'Epic') {
      await recalculateEpicTimeline(parentIssue._id);
    }
  }

  emitIssueCreated(issue.project, issue);
  console.log('🚀 EMIT ISSUE_CREATED TO:', projectId);

  return issue;
};

/* ===================== GET ISSUE ===================== */
export const getIssuesService = async (query) => {
  const {
    project,
    status,
    assignee,
    priority,
    label,
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
  if (label) filter.labels = label;
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const issues = await Issue.find(filter)
    .populate([
      { path: 'project' },
      { path: 'status' },
      { path: 'sprint' },
      { path: 'labels' },
      { path: 'assignee', select: 'name avatar' },
      { path: 'reporter', select: 'name avatar' },
      { path: 'parent', select: '_id title type number' },
    ])
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
    .populate('sprint')
    .populate('labels');

  if (!issue) throw new ApiError(404, 'Issue not found');

  const children = await Issue.find({ parent: id }).populate('status').populate('assignee');

  return {
    ...issue.toObject(),
    children,
  };
};

/* ===================== RECALC EPIC TIMELINE ===================== */
const recalculateEpicTimeline = async (epicId) => {
  if (!epicId) return;

  const children = await Issue.find({
    parent: epicId,
    startDate: { $ne: null },
    dueDate: { $ne: null },
  });

  if (!children.length) {
    await Issue.findByIdAndUpdate(epicId, {
      startDate: null,
      dueDate: null,
    });
    return;
  }

  const startDates = children.map((c) => new Date(c.startDate));
  const dueDates = children.map((c) => new Date(c.dueDate));

  const minStart = new Date(Math.min(...startDates));
  const maxDue = new Date(Math.max(...dueDates));

  await Issue.findByIdAndUpdate(epicId, {
    startDate: minStart,
    dueDate: maxDue,
  });
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
  issue.priority = updates.priority ?? issue.priority;
  if (
    updates.startDate &&
    updates.dueDate &&
    new Date(updates.startDate) > new Date(updates.dueDate)
  ) {
    throw new ApiError(400, 'Start date cannot be after due date');
  }
  issue.labels = updates.labels ?? issue.labels;
  if (updates.startDate !== undefined) {
    issue.startDate = updates.startDate ? new Date(updates.startDate) : null;
  }

  if (updates.dueDate !== undefined) {
    issue.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
  }

  await issue.save();

  await issue.populate([
    { path: 'status' },
    { path: 'project' },
    { path: 'project' },
    { path: 'assignee', select: 'name avatar' },
  ]);
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
  await issue.populate([
    { path: 'status' },
    { path: 'project' },
    { path: 'assignee', select: 'name avatar' },
  ]);
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

  if (status.order === 0 || status.order === 1) {
    await requireRole(issue.project, userId, ['Owner', 'Admin', 'Member']);
  } else {
    await requireRole(issue.project, userId, ['Owner', 'Admin']);
  }

  issue.status = statusId;
  await issue.save();
  await populateIssueFull(issue);

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
  const sprint = await Sprint.findById(sprintId);

  if (!issue) throw new ApiError(404, 'Issue not found');

  await requireRole(issue.project, userId, ['Owner', 'Admin']);

  issue.sprint = sprintId || null;
  await issue.save();
  await populateIssueFull(issue);

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

  issue.assignee = assigneeId || null;
  await issue.save();
  await issue.populate([
    { path: 'status' },
    { path: 'project' },
    { path: 'assignee', select: 'name avatar' },
  ]);

  // ACTIVITY
  await createActivityService({
    project: issue.project,
    issue: issue._id,
    user: userId,
    action: 'ASSIGN_ISSUE',
    content: `đã giao công việc "${issue.title}" cho ${issue.assignee.name}`,
  });

  // NOTIFICATION
  if (assigneeId && assigneeId.toString() !== userId.toString()) {
    await createNotificationService({
      user: assigneeId,
      project: issue.project,
      issue: issue._id,
      type: 'ASSIGN',
      message: `Bạn được giao công việc "${issue.title}"`,
    });
  }

  /* ===== SOCKET ===== */
  emitIssueAssigned(issue.project, issue);

  return issue;
};

export const checkWorkloadService = async (issueId, assigneeId, userId) => {
  const issue = await Issue.findById(issueId);
  if (!issue) throw new ApiError(404, 'Issue not found');

  await requireRole(issue.project, userId, ['Owner', 'Admin']);

  if (!assigneeId) {
    return {
      workloadWarning: false,
      suggestedUsers: [],
    };
  }

  const THRESHOLD = 5;

  const activeCount = await Issue.countDocuments({
    assignee: assigneeId,
    project: issue.project,
  });

  if (activeCount <= THRESHOLD) {
    return {
      workloadWarning: false,
      suggestedUsers: [],
    };
  }

  // ===== Lấy members trong project =====
  const project = await Project.findById(issue.project).populate('members.user', '_id name avatar');

  const memberIds = project.members.map((m) => m.user._id.toString());

  // ===== Tính workload cho từng member =====
  const workload = await Issue.aggregate([
    {
      $match: {
        project: issue.project,
        assignee: {
          $in: memberIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      },
    },
    {
      $group: {
        _id: '$assignee',
        count: { $sum: 1 },
      },
    },
  ]);

  const workloadMap = {};
  workload.forEach((w) => {
    workloadMap[w._id.toString()] = w.count;
  });

  const memberWorkload = memberIds
    .filter((id) => id !== assigneeId.toString())
    .map((id) => ({
      userId: id,
      count: workloadMap[id] || 0,
    }))
    .sort((a, b) => a.count - b.count)
    .slice(0, 3);

  const suggestedUsers = memberWorkload.map((m) => m.userId);

  return {
    workloadWarning: true,
    suggestedUsers,
  };
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

  await recalculateEpicTimeline(parentId);

  issue.parent = parentId || null;
  await issue.save();

  await populateIssueFull(issue);

  return issue;
};

export const addLabelService = async (issueId, labelId, userId) => {
  const issue = await Issue.findById(issueId);

  if (!issue) throw new Error('Issue not found');

  if (!issue.labels.includes(labelId)) {
    issue.labels.push(labelId);
    await issue.save();
  }

  await populateIssueFull(issue);

  emitIssueUpdated(issue.project.toString(), issue);

  return issue;
};

export const removeLabelService = async (issueId, labelId) => {
  const issue = await Issue.findById(issueId);

  issue.labels = issue.labels.filter((id) => id.toString() !== labelId);

  await issue.save();
  await populateIssueFull(issue);

  emitIssueUpdated(issue.project.toString(), issue);

  return issue;
};

export const setFlagService = async (issueId, flag) => {
  const issue = await Issue.findById(issueId);

  issue.flag = flag;
  await issue.save();
  await populateIssueFull(issue);

  emitIssueUpdated(issue.project.toString(), issue);

  return issue;
};

export const clearFlagService = async (issueId) => {
  const issue = await Issue.findById(issueId);

  issue.flag = null;
  await issue.save();
  await populateIssueFull(issue);

  emitIssueUpdated(issue.project.toString(), issue);

  return issue;
};
