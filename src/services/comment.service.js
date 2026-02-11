import Comment from '../models/Comment.js';
import Issue from '../models/Issue.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { requireRole } from '../utils/permission.js';
import { emitCommentCreated, emitCommentDeleted } from '../utils/socketEmitter.js';
import { createNotificationService } from './notification.service.js';
import { createActivityService } from './activity.service.js';

/* ===================== CREATE ===================== */
export const createCommentService = async (issueId, content, userId) => {
  if (!content) throw new ApiError(400, 'Content required');

  const issue = await Issue.findById(issueId);
  if (!issue) throw new ApiError(404, 'Issue not found');

  await requireRole(issue.project, userId, ['Owner', 'Admin', 'Member']);

  const comment = await Comment.create({
    content,
    issue: issueId,
    author: userId,
  });

  await comment.populate('author', 'name email avatar');

  await createActivityService({
    project: issue.project,
    issue: issue._id,
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

  const issue = await Issue.findById(comment.issue);
  if (!issue) throw new ApiError(404, 'Issue not found');

  await requireRole(issue.project, userId, ['Owner', 'Admin']);

  // cho phép author tự xóa
  if (comment.author.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not allowed');
  }

  await Comment.findByIdAndDelete(commentId);

  await createActivityService({
    project: issue.project,
    issue: issue._id,
    user: userId,
    action: 'DELETE_COMMENT',
    content: `đã xóa bình luận`,
  });

  emitCommentDeleted(issue._id, commentId);

  return true;
};
