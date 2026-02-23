import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as labelService from '../services/label.service.js';

/* ================= CREATE LABEL ================= */
export const createLabel = catchAsync(async (req, res) => {
  const { projectId, name } = req.body;

  const label = await labelService.createLabel(projectId, name, req.user._id);

  res.json(new ApiResponse(201, label, 'Label created successfully'));
});

/* ================= GET PROJECT LABELS ================= */
export const getLabels = catchAsync(async (req, res) => {
  const { projectId } = req.params;

  const labels = await labelService.getProjectLabels(projectId);

  res.json(new ApiResponse(200, labels, 'Labels fetched successfully'));
});
