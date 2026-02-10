import Status from '../models/Status.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

export const createStatus = catchAsync(async (req, res) => {
  const { name, projectId } = req.body;

  const status = await Status.create({
    name,
    project: projectId,
  });

  res.json(new ApiResponse(201, status));
});

export const getStatuses = catchAsync(async (req, res) => {
  const statuses = await Status.find({ project: req.query.projectId });
  res.json(new ApiResponse(200, statuses));
});
