import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

import {
  createIssueService,
  getIssuesByProjectService,
  getIssueDetailService,
  updateIssueService,
  deleteIssueService,
  moveStatusService,
  moveSprintService,
  assignUserService,
  changeParentService,
} from '../services/issue.service.js';

/* ===================== CREATE ===================== */
export const createIssue = catchAsync(async (req, res) => {
  const issue = await createIssueService({
    ...req.body,
    reporterId: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, issue, 'Issue created successfully'));
});

/* ===================== GET ===================== */
export const getIssuesByProject = catchAsync(async (req, res) => {
  const issues = await getIssuesByProjectService(req.query.projectId);

  res.json(new ApiResponse(200, issues));
});

/* ===================== GET DETAIL ===================== */
export const getIssueDetail = catchAsync(async (req, res) => {
  const issue = await getIssueDetailService(req.params.id);

  res.json(new ApiResponse(200, issue));
});

/* ===================== UPDATE ===================== */
export const updateIssue = catchAsync(async (req, res) => {
  const issue = await updateIssueService(req.params.id, req.body);

  res.json(new ApiResponse(200, issue, 'Issue updated'));
});

/* ===================== DELETE (CASCADE) ===================== */
export const deleteIssue = catchAsync(async (req, res) => {
  await deleteIssueService(req.params.id);

  res.json(new ApiResponse(200, null, 'Issue deleted with children'));
});

/* ===================== MOVE STATUS ===================== */
export const moveStatus = catchAsync(async (req, res) => {
  const issue = await moveStatusService(req.params.id, req.body.statusId);

  res.json(new ApiResponse(200, issue, 'Status moved'));
});

/* ===================== MOVE SPRINT ===================== */
export const moveSprint = catchAsync(async (req, res) => {
  const issue = await moveSprintService(req.params.id, req.body.sprintId);

  res.json(new ApiResponse(200, issue, 'Sprint moved'));
});

/* ===================== ASSIGN ===================== */
export const assignUser = catchAsync(async (req, res) => {
  const issue = await assignUserService(req.params.id, req.body.assigneeId);

  res.json(new ApiResponse(200, issue, 'User assigned'));
});

/* ===================== CHANGE PARENT ===================== */
export const changeParent = catchAsync(async (req, res) => {
  const issue = await changeParentService(req.params.id, req.body.parentId);

  res.json(new ApiResponse(200, issue, 'Parent changed'));
});
