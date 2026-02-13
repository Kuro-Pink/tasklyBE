import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

import {
  createStatusService,
  getStatusesService,
  updateStatusService,
  reorderStatusService,
  deleteStatusService,
} from '../services/status.service.js';

/* ===================== CREATE ===================== */
export const createStatus = catchAsync(async (req, res) => {
  const status = await createStatusService(req.body, req.user._id);

  res.json(new ApiResponse(201, status));
});

/* ===================== GET ===================== */
export const getStatuses = catchAsync(async (req, res) => {
  const { projectId } = req.query;

  if (!projectId) {
    return res.json(new ApiResponse(400, null, 'projectId required'));
  }

  const statuses = await getStatusesService(projectId);

  res.json(new ApiResponse(200, statuses));
});

/* ===================== UPDATE ===================== */
export const updateStatus = catchAsync(async (req, res) => {
  const status = await updateStatusService(req.params.id, req.body, req.user._id);

  res.json(new ApiResponse(200, status));
});

/* ===================== REORDER ===================== */
export const reorderStatus = catchAsync(async (req, res) => {
  const { projectId, orders } = req.body;

  if (!projectId || !orders) {
    return res.json(new ApiResponse(400, null, 'Invalid payload'));
  }

  await reorderStatusService(projectId, orders, req.user._id);

  res.json(new ApiResponse(200, null, 'Reordered'));
});

/* ===================== DELETE ===================== */
export const deleteStatus = catchAsync(async (req, res) => {
  const { moveToStatusId } = req.body;

  await deleteStatusService(req.params.id, moveToStatusId, req.user._id);

  res.json(new ApiResponse(200, null, 'Deleted'));
});
