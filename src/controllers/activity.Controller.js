import {
  getActivitiesByProjectService,
  getActivitiesByIssueService,
  getActivitiesByUserService,
} from '../services/activityService.js';

export const getProjectActivities = async (req, res) => {
  const data = await getActivitiesByProjectService(req.params.projectId);
  res.json(data);
};

export const getIssueActivities = async (req, res) => {
  const data = await getActivitiesByIssueService(req.params.issueId);
  res.json(data);
};

export const getMyActivities = async (req, res) => {
  const data = await getActivitiesByUserService(req.user.id);
  res.json(data);
};
