import Activity from '../models/Activity.js';
import { emitActivityCreated } from '../utils/socketEmitter.js';

/* CREATE */
export const createActivityService = async (payload) => {
  const activity = await Activity.create(payload);

  await activity.populate([
    { path: 'user', select: 'name avatar' },
    { path: 'issue', select: 'title' },
  ]);

  if (activity.project) {
    emitActivityCreated(activity.project, activity);
  }

  return activity;
};

/* GET BY PROJECT */
export const getActivitiesByProjectService = async (projectId) => {
  return Activity.find({ project: projectId })
    .populate('user', 'name avatar')
    .populate('issue', 'title')
    .sort({ createdAt: -1 })
    .limit(100);
};

/* GET BY ISSUE */
export const getActivitiesByIssueService = async (issueId) => {
  return Activity.find({ issue: issueId })
    .populate('user', 'name avatar')
    .populate('project', 'name')
    .sort({ createdAt: -1 });
};

/* GET BY USER */
export const getActivitiesByUserService = async (userId) => {
  return Activity.find({ user: userId })
    .populate('project', 'name')
    .populate('issue', 'title')
    .sort({ createdAt: -1 });
};
