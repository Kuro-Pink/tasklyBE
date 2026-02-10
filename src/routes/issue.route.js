import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createIssue,
  getIssuesByProject,
  getIssueDetail,
  updateIssue,
  deleteIssue,
  moveStatus,
  moveSprint,
  assignUser,
  changeParent,
} from '../controllers/issue.controller.js';

const router = express.Router();

router.post('/', protect, createIssue);
router.get('/', protect, getIssuesByProject);
router.get('/:id', protect, getIssueDetail);
router.put('/:id', protect, updateIssue);
router.delete('/:id', protect, deleteIssue);
router.patch('/:id/sprint', protect, moveSprint);
router.patch('/:id/status', protect, moveStatus);
router.patch('/:id/assign', protect, assignUser);
router.patch('/:id/parent', protect, changeParent);

export default router;
