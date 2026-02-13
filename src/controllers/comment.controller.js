import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  createCommentService,
  getCommentsByIssueService,
  deleteCommentService,
} from '../services/comment.service.js';

/* CREATE */
export const createComment = catchAsync(async (req, res) => {
  const { issueId, content } = req.body;

  const comment = await createCommentService(issueId, content, req.user._id);

  res.json(new ApiResponse(201, comment));
});

/* GET */
export const getComments = catchAsync(async (req, res) => {
  const comments = await getCommentsByIssueService(req.params.issueId);

  res.json(new ApiResponse(200, comments));
});

/* DELETE */
export const deleteComment = catchAsync(async (req, res) => {
  await deleteCommentService(req.params.id, req.user._id);

  res.json(new ApiResponse(200, null, 'Deleted'));
});
