import express from 'express';
import {
  getProjectActivities,
  getIssueActivities,
  getMyActivities,
} from '../controllers/activity.controller.js';

const router = express.Router();

router.get('/project/:projectId', getProjectActivities);
router.get('/issue/:issueId', getIssueActivities);
router.get('/me', getMyActivities);

export default router;
