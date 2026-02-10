import Issue from '../models/Issue.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

export const createIssue = catchAsync(async (req, res) => {
  const issue = await Issue.create({
    ...req.body,
    reporter: req.user._id,
  });

  res.json(new ApiResponse(201, issue));
});

export const getIssuesByProject = catchAsync(async (req, res) => {
  const issues = await Issue.find({ project: req.query.projectId })
    .populate('status')
    .populate('assignee')
    .populate('parent');

  res.json(new ApiResponse(200, issues));
});

export const updateIssue = catchAsync(async (req, res) => {
  const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!issue) throw new ApiError(404, 'Issue not found');

  res.json(new ApiResponse(200, issue));
});

export const deleteIssue = catchAsync(async (req, res) => {
  await Issue.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(200, 'Deleted'));
});
