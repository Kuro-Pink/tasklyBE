import { getIO } from '../config/socket.js';

/* ================= BASE ================= */

export const emitToUser = (userId, event, data) => {
  const io = getIO();
  io.to(userId.toString()).emit(event, data);
};

export const emitToProject = (projectId, event, data) => {
  const io = getIO();
  io.to(projectId.toString()).emit(event, data);
};

export const emitToIssue = (issueId, event, data) => {
  const io = getIO();
  io.to(issueId.toString()).emit(event, data);
};

/* ================= ISSUE ================= */

export const emitIssueCreated = (projectId, issue) => {
  emitToProject(projectId, 'issue:created', issue);
};

export const emitIssueUpdated = (projectId, issue) => {
  emitToProject(projectId, 'issue:updated', issue);
};

export const emitIssueDeleted = (projectId, issueId) => {
  emitToProject(projectId, 'issue:deleted', issueId);
};

export const emitIssueMovedStatus = (projectId, data) => {
  emitToProject(projectId, 'issue:statusMoved', data);
};

export const emitIssueMovedSprint = (projectId, data) => {
  emitToProject(projectId, 'issue:sprintMoved', data);
};

export const emitIssueAssigned = (projectId, issue) => {
  emitToProject(projectId, 'issue:assigned', issue);
};

/* ================= SPRINT ================= */

export const emitSprintStarted = (projectId, sprint) => {
  emitToProject(projectId, 'sprint:started', sprint);
};

export const emitSprintEnded = (projectId, sprint) => {
  emitToProject(projectId, 'sprint:ended', sprint);
};

export const emitSprintDeleted = (projectId, sprintId) => {
  emitToProject(projectId, 'sprint:deleted', sprintId);
};

/* ================= STATUS ================= */

export const emitStatusCreated = (projectId, status) => {
  emitToProject(projectId, 'status:created', status);
};

export const emitStatusUpdated = (projectId, status) => {
  emitToProject(projectId, 'status:updated', status);
};

export const emitStatusDeleted = (projectId, statusId) => {
  emitToProject(projectId, 'status:deleted', statusId);
};

/* ================= PROJECT ================= */

export const emitProjectCreated = (projectId, project) => {
  emitToProject(projectId, 'project:created', project);
};

export const emitProjectUpdated = (projectId, project) => {
  emitToProject(projectId, 'project:updated', project);
};

/* ================= COMMENT ================= */
export const emitCommentCreated = (issueId, comment) =>
  emitToIssue(issueId, 'comment:created', comment);

export const emitCommentDeleted = (issueId, commentId) =>
  emitToIssue(issueId, 'comment:deleted', commentId);

/* ================= NOTIFICATION ================= */

export const emitNotification = (userId, notification) => {
  emitToUser(userId, 'notification:new', notification);
};

/* ================= ACTIVITY ================= */

export const emitActivityCreated = (projectId, activity) => {
  emitToProject(projectId, 'activity:created', activity);
};
