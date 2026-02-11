import Sprint from '../models/Sprint.js';
import Issue from '../models/Issue.js';
import ApiError from '../utils/ApiError.js';
import { emitSprintStarted, emitSprintEnded, emitSprintDeleted } from '../utils/socketEmitter.js';

/* ===================== CREATE ===================== */
export const createSprintService = async (data) => {
  const sprint = await Sprint.create({
    ...data,
    project: data.projectId,
  });

  return sprint;
};

/* ===================== GET ALL ===================== */
export const getSprintsService = async (projectId) => {
  const sprints = await Sprint.find({ project: projectId }).sort({ createdAt: -1 });
  return sprints;
};

/* ===================== GET DETAIL ===================== */
export const getSprintDetailService = async (id) => {
  const sprint = await Sprint.findById(id);
  if (!sprint) throw new ApiError(404, 'Sprint not found');

  const issues = await Issue.find({ sprint: id }).populate('status').populate('assignee');

  return {
    ...sprint.toObject(),
    issues,
  };
};

/* ===================== UPDATE ===================== */
export const updateSprintService = async (id, updates) => {
  const sprint = await Sprint.findById(id);
  if (!sprint) throw new ApiError(404, 'Sprint not found');

  sprint.name = updates.name ?? sprint.name;
  sprint.startDate = updates.startDate ?? sprint.startDate;
  sprint.endDate = updates.endDate ?? sprint.endDate;

  await sprint.save();
  return sprint;
};

/* ===================== START ===================== */
export const startSprintService = async (id) => {
  const sprint = await Sprint.findById(id);
  if (!sprint) throw new ApiError(404, 'Sprint not found');

  // RULE: mỗi project chỉ có 1 sprint active
  const activeSprint = await Sprint.findOne({
    project: sprint.project,
    isActive: true,
  });

  if (activeSprint && activeSprint._id.toString() !== id) {
    throw new ApiError(400, 'Another sprint is already active');
  }

  sprint.isActive = true;
  await sprint.save();

  emitSprintStarted(sprint.project, sprint);

  return sprint;
};

/* ===================== END ===================== */
export const endSprintService = async (id, moveToBacklog = false) => {
  const sprint = await Sprint.findById(id);
  if (!sprint) throw new ApiError(404, 'Sprint not found');

  sprint.isActive = false;
  await sprint.save();

  // OPTIONAL: move issue về backlog
  if (moveToBacklog) {
    await Issue.updateMany({ sprint: id }, { sprint: null });
  }

  emitSprintEnded(sprint.project, sprint);

  return sprint;
};

/* ===================== DELETE ===================== */
export const deleteSprintService = async (id) => {
  const sprint = await Sprint.findById(id);
  if (!sprint) throw new ApiError(404, 'Sprint not found');

  // move issue về backlog trước khi xoá
  await Issue.updateMany({ sprint: id }, { sprint: null });

  await Sprint.findByIdAndDelete(id);

  emitSprintDeleted(sprint.project, id);

  return true;
};
