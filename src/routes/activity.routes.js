import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getProjectActivities,
  getIssueActivities,
  getMyActivities,
} from '../controllers/activity.controller.js';

const router = express.Router();
router.use(protect);

router.get('/project/:projectId', getProjectActivities);
router.get('/issue/:issueId', getIssueActivities);
router.get('/me', getMyActivities);

export default router;
