import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

import {
  createSprintService,
  getSprintsService,
  getSprintDetailService,
  updateSprintService,
  startSprintService,
  endSprintService,
  deleteSprintService,
} from '../services/sprint.service.js';

/* ===================== CREATE ===================== */
export const createSprint = catchAsync(async (req, res) => {
  const sprint = await createSprintService(req.body);
  res.json(new ApiResponse(201, sprint));
});

/* ===================== GET ALL ===================== */
export const getSprints = catchAsync(async (req, res) => {
  const sprints = await getSprintsService(req.query.projectId);
  res.json(new ApiResponse(200, sprints));
});

/* ===================== GET DETAIL ===================== */
export const getSprintDetail = catchAsync(async (req, res) => {
  const sprint = await getSprintDetailService(req.params.id);
  res.json(new ApiResponse(200, sprint));
});

/* ===================== UPDATE ===================== */
export const updateSprint = catchAsync(async (req, res) => {
  const sprint = await updateSprintService(req.params.id, req.body);
  res.json(new ApiResponse(200, sprint));
});

/* ===================== START ===================== */
export const startSprint = catchAsync(async (req, res) => {
  const sprint = await startSprintService(req.params.id, req.user._id);
  res.json(new ApiResponse(200, sprint));
});

/* ===================== END ===================== */
export const endSprint = catchAsync(async (req, res) => {
  const { moveToBacklog } = req.body; // true/false

  const sprint = await endSprintService(req.params.id, moveToBacklog, req.user._id);
  res.json(new ApiResponse(200, sprint));
});

/* ===================== DELETE ===================== */
export const deleteSprint = catchAsync(async (req, res) => {
  await deleteSprintService(req.params.id);
  res.json(new ApiResponse(200, null, 'Sprint deleted'));
});
