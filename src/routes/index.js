import express from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.route.js';
import statusRoutes from './status.route.js';
import sprintRoutes from './sprint.route.js';
import issueRoutes from './issue.route.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/statuses', statusRoutes);
router.use('/sprints', sprintRoutes);
router.use('/issues', issueRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
