import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

import {
  createIssueService,
  getIssuesService,
  countIssuesService,
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
  const issue = await createIssueService(
    {
      ...req.body,
      reporterId: req.user._id,
    },
    req.user._id,
  );

  res.status(201).json(new ApiResponse(201, issue, 'Issue created successfully'));
});

/* ===================== GET ===================== */
export const getIssues = catchAsync(async (req, res) => {
  const result = await getIssuesService(req.query);

  res.json(new ApiResponse(200, result));
});

/* ===================== COUNT ===================== */

export const countIssues = catchAsync(async (req, res) => {
  const count = await countIssuesService(req.query);

  res.json(new ApiResponse(200, { count }));
});

/* ===================== GET DETAIL ===================== */
export const getIssueDetail = catchAsync(async (req, res) => {
  const issue = await getIssueDetailService(req.params.id);

  res.json(new ApiResponse(200, issue));
});

/* ===================== UPDATE ===================== */
export const updateIssue = catchAsync(async (req, res) => {
  const issue = await updateIssueService(req.params.id, req.body, req.user._id);

  res.json(new ApiResponse(200, issue, 'Issue updated'));
});

/* ===================== DELETE (CASCADE) ===================== */
export const deleteIssue = catchAsync(async (req, res) => {
  await deleteIssueService(req.params.id, req.user._id);

  res.json(new ApiResponse(200, null, 'Issue deleted with children'));
});

/* ===================== MOVE STATUS ===================== */
export const moveStatus = catchAsync(async (req, res) => {
  const issue = await moveStatusService(req.params.id, req.body.statusId, req.user._id);

  res.json(new ApiResponse(200, issue, 'Status moved'));
});

/* ===================== MOVE SPRINT ===================== */
export const moveSprint = catchAsync(async (req, res) => {
  const issue = await moveSprintService(req.params.id, req.body.sprintId, req.user._id);

  res.json(new ApiResponse(200, issue, 'Sprint moved'));
});

/* ===================== ASSIGN ===================== */
export const assignUser = catchAsync(async (req, res) => {
  const issue = await assignUserService(req.params.id, req.body.assigneeId, req.user._id);

  res.json(new ApiResponse(200, issue, 'User assigned'));
});

/* ===================== CHANGE PARENT ===================== */
export const changeParent = catchAsync(async (req, res) => {
  const issue = await changeParentService(req.params.id, req.body.parentId, req.user._id);

  res.json(new ApiResponse(200, issue, 'Parent changed'));
});
