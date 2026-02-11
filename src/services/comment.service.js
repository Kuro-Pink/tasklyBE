import Comment from '../models/Comment.js';
import ApiError from '../utils/ApiError.js';
import { requireRole } from '../utils/permission.js';
import { emitCommentCreated, emitCommentDeleted } from '../utils/socketEmitter.js';
import { createNotificationService } from './notification.service.js';
import { createActivityService } from './activity.service.js';

/* ===================== CREATE ===================== */
export const createCommentService = async (issueId, content, userId) => {
  if (!content) throw new ApiError(400, 'Content required');

  await requireRole(projectId, userId, ['Owner', 'Admin', 'Member']);

  const comment = await Comment.create({
    content,
    issue: issueId,
    author: userId,
  });

  await comment.populate('author', 'name email avatar');

  await createActivityService({
    project: comment.project,
    issue: comment.issue,
    user: userId,
    action: 'COMMENT',
    content: `đã bình luận vào công việc`,
  });

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

  await requireRole(projectId, userId, ['Owner', 'Admin']);

  if (comment.author.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not allowed');
  }

  await Comment.findByIdAndDelete(commentId);

  await createActivityService({
    project,
    issue,
    user: userId,
    action: 'DELETE_COMMENT',
    content: `đã xóa bình luận`,
  });

  emitCommentDeleted(comment.issue, commentId);

  return true;
};
