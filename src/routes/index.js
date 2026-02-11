import express from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.route.js';
import statusRoutes from './status.route.js';
import sprintRoutes from './sprint.route.js';
import issueRoutes from './issue.route.js';
import commentRoutes from './comment.route.js';
import notificationRoutes from './notification.route.js';
import activityRoutes from './activity.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/statuses', statusRoutes);
router.use('/sprints', sprintRoutes);
router.use('/issues', issueRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activities', activityRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
