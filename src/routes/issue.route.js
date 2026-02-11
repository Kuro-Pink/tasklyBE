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

router.use(protect);

router.post('/', createIssue);
router.get('/', getIssuesByProject);
router.get('/:id', getIssueDetail);
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);
router.patch('/:id/sprint', moveSprint);
router.patch('/:id/status', moveStatus);
router.patch('/:id/assign', assignUser);
router.patch('/:id/parent', changeParent);

export default router;
