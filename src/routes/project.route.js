import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createProject,
  getProjects,
  getProjectDetail,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  changeRole,
} from '../controllers/project.controller.js';

const router = express.Router();

router.use(protect);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectDetail);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

router.post('/:id/members', addMember);
router.delete('/:id/members', removeMember);
router.patch('/:id/role', changeRole);

export default router;
