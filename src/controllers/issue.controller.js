import Issue from '../models/Issue.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

/* ===================== CREATE ===================== */
export const createIssue = catchAsync(async (req, res) => {
  const { title, description, type, projectId, statusId, sprintId, assigneeId, parentId } =
    req.body;

  if (!title || !type || !projectId || !statusId) {
    throw new ApiError(400, 'Missing required fields');
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
    if (!parentIssue) throw new ApiError(404, 'Parent issue not found');

    if (parentIssue.type === 'Subtask') {
      throw new ApiError(400, 'Cannot assign subtask as parent');
    }

    if (parentIssue.project.toString() !== projectId) {
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
    reporter: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, issue, 'Issue created successfully'));
});

/* ===================== GET ===================== */
export const getIssuesByProject = catchAsync(async (req, res) => {
  const issues = await Issue.find({ project: req.query.projectId })
    .populate('status')
    .populate('assignee')
    .populate('parent');

  res.json(new ApiResponse(200, issues));
});

/* ===================== GET DETAIL ===================== */
export const getIssueDetail = catchAsync(async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findById(id)
    .populate('status')
    .populate('assignee')
    .populate('reporter')
    .populate('parent')
    .populate('sprint');

  if (!issue) throw new ApiError(404, 'Issue not found');

  // load children
  const children = await Issue.find({ parent: id }).populate('status').populate('assignee');

  res.json(
    new ApiResponse(200, {
      ...issue.toObject(),
      children,
    }),
  );
});

/* ===================== UPDATE ===================== */
export const updateIssue = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

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

  // APPLY UPDATE
  issue.title = updates.title ?? issue.title;
  issue.description = updates.description ?? issue.description;
  issue.type = newType;
  issue.project = newProject;
  issue.status = updates.statusId ?? issue.status;
  issue.sprint = updates.sprintId ?? issue.sprint;
  issue.assignee = updates.assigneeId ?? issue.assignee;
  issue.parent = newParent || null;

  await issue.save();

  res.json(new ApiResponse(200, issue, 'Issue updated'));
});

/* ===================== DELETE (CASCADE) ===================== */
export const deleteIssue = catchAsync(async (req, res) => {
  const { id } = req.params;

  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

  // xoá children
  await Issue.deleteMany({ parent: id });

  await Issue.findByIdAndDelete(id);

  res.json(new ApiResponse(200, null, 'Issue deleted with children'));
});

/* ===================== MOVE STATUS ===================== */
export const moveStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { statusId } = req.body;

  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

  issue.status = statusId;
  await issue.save();

  res.json(new ApiResponse(200, issue, 'Status moved'));
});

/* ===================== MOVE SPRINT ===================== */
export const moveSprint = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { sprintId } = req.body; // null = backlog

  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

  issue.sprint = sprintId || null;
  await issue.save();

  res.json(new ApiResponse(200, issue, 'Sprint moved'));
});

/* ===================== ASSIGN ===================== */
export const assignUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { assigneeId } = req.body;

  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

  issue.assignee = assigneeId;
  await issue.save();

  res.json(new ApiResponse(200, issue, 'User assigned'));
});

/* ===================== CHANGE PARENT ===================== */
export const changeParent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { parentId } = req.body;

  const issue = await Issue.findById(id);
  if (!issue) throw new ApiError(404, 'Issue not found');

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

  res.json(new ApiResponse(200, issue, 'Parent changed'));
});
