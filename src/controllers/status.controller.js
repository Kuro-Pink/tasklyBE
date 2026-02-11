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
  const status = await createStatusService(req.body);
  res.json(new ApiResponse(201, status));
});

/* ===================== GET ===================== */
export const getStatuses = catchAsync(async (req, res) => {
  const statuses = await getStatusesService(req.query.projectId);
  res.json(new ApiResponse(200, statuses));
});

/* ===================== UPDATE ===================== */
export const updateStatus = catchAsync(async (req, res) => {
  const status = await updateStatusService(req.params.id, req.body);
  res.json(new ApiResponse(200, status));
});

/* ===================== REORDER ===================== */
export const reorderStatus = catchAsync(async (req, res) => {
  const { projectId, orders } = req.body;
  await reorderStatusService(projectId, orders);

  res.json(new ApiResponse(200, null, 'Reordered'));
});

/* ===================== DELETE ===================== */
export const deleteStatus = catchAsync(async (req, res) => {
  const { moveToStatusId } = req.body;

  await deleteStatusService(req.params.id, moveToStatusId);

  res.json(new ApiResponse(200, null, 'Deleted'));
});
