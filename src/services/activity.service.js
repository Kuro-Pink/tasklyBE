import Activity from '../models/Activity.js';
import { emitActivityCreated } from '../utils/socketEmitter.js';

/* CREATE */
export const createActivityService = async (payload) => {
  const activity = await Activity.create(payload);
  await activity.populate('user', 'name avatar');

  emitActivityCreated(payload.project, activity);
  return activity;
};

/* GET BY PROJECT */
export const getActivitiesByProjectService = async (projectId) => {
  return Activity.find({ project: projectId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
};

/* GET BY ISSUE */
export const getActivitiesByIssueService = async (issueId) => {
  return Activity.find({ issue: issueId }).populate('user', 'name avatar').sort({ createdAt: -1 });
};

/* GET BY USER */
export const getActivitiesByUserService = async (userId) => {
  return Activity.find({ user: userId }).sort({ createdAt: -1 });
};
