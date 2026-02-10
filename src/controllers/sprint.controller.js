import Sprint from '../models/Sprint.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

export const createSprint = catchAsync(async (req, res) => {
  const sprint = await Sprint.create({ ...req.body, project: req.body.projectId });
  res.json(new ApiResponse(201, sprint));
});

export const getSprints = catchAsync(async (req, res) => {
  const sprints = await Sprint.find({ project: req.query.projectId });
  res.json(new ApiResponse(200, sprints));
});

export const startSprint = catchAsync(async (req, res) => {
  const sprint = await Sprint.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });

  res.json(new ApiResponse(200, sprint));
});

export const endSprint = catchAsync(async (req, res) => {
  const sprint = await Sprint.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

  res.json(new ApiResponse(200, sprint));
});

export const deleteSprint = catchAsync(async (req, res) => {
  await Sprint.findByIdAndDelete(req.params.id);

  res.json(new ApiResponse(200, 'Deleted'));
});
