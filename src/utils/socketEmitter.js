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

export const emitIssueMoved = (projectId, issue) => {
  emitToProject(projectId, 'issue:moved', issue);
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

/* ================= NOTIFICATION ================= */

export const emitNotification = (userId, notification) => {
  emitToUser(userId, 'notification:new', notification);
};
