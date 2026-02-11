import Comment from '../models/Comment.js';
import ApiError from '../utils/ApiError.js';
import { emitCommentCreated, emitCommentDeleted } from '../utils/socketEmitter.js';

/* ===================== CREATE ===================== */
export const createCommentService = async (issueId, content, userId) => {
  if (!content) throw new ApiError(400, 'Content required');

  const comment = await Comment.create({
    content,
    issue: issueId,
    author: userId,
  });

  await comment.populate('author', 'name email avatar');

  emitCommentCreated(issueId, comment);

  return comment;
};

/* ===================== GET BY ISSUE ===================== */
export const getCommentsByIssueService = async (issueId) => {
  return Comment.find({ issue: issueId })
    .populate('author', 'name email avatar')
    .sort({ createdAt: 1 });
};

/* ===================== DELETE ===================== */
export const deleteCommentService = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  if (comment.author.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not allowed');
  }

  await Comment.findByIdAndDelete(commentId);

  emitCommentDeleted(comment.issue, commentId);

  return true;
};
