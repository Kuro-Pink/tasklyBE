import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createProject, getProjects } from '../controllers/project.controller.js';

const router = express.Router();

router.post('/', protect, createProject);
router.get('/', protect, getProjects);

export default router;
