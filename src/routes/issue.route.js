import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createIssueSchema } from '../validators/issue.validator.js';
import {
  createIssue,
  getIssues,
  countIssues,
  getIssueDetail,
  updateIssue,
  deleteIssue,
  moveStatus,
  moveSprint,
  assignUser,
  changeParent,
  addLabel,
  removeLabel,
  setFlag,
  clearFlag,
} from '../controllers/issue.controller.js';

const router = express.Router();

router.use(protect);

router.post('/', validate(createIssueSchema), createIssue);
router.get('/', getIssues);
router.get('/count', countIssues);
router.get('/:id', getIssueDetail);
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);
router.patch('/:id/sprint', moveSprint);
router.patch('/:id/status', moveStatus);
router.patch('/:id/assign', assignUser);
router.patch('/:id/parent', changeParent);

router.patch('/:id/add-label', addLabel);
router.patch('/:id/remove-label', removeLabel);
router.patch('/:id/set-flag', setFlag);
router.patch('/:id/clear-flag', clearFlag);

export default router;
