import Project from '../models/Project.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

export const createProject = catchAsync(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'Owner' }],
  });

  res.json(new ApiResponse(201, project));
});

export const getProjects = catchAsync(async (req, res) => {
  const projects = await Project.find({ 'members.user': req.user._id });
  res.json(new ApiResponse(200, projects));
});
