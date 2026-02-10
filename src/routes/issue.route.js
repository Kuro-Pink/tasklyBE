import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createIssue,
  getIssuesByProject,
  updateIssue,
  deleteIssue,
} from '../controllers/issue.controller.js';

const router = express.Router();

router.post('/', protect, createIssue);
router.get('/', protect, getIssuesByProject);
router.put('/:id', protect, updateIssue);
router.delete('/:id', protect, deleteIssue);

export default router;
