import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createSprint,
  getSprints,
  getSprintDetail,
  updateSprint,
  startSprint,
  endSprint,
  deleteSprint,
} from '../controllers/sprint.controller.js';

const router = express.Router();

router.use(protect);

router.post('/', createSprint);
router.get('/', getSprints);
router.get('/:id', getSprintDetail);
router.put('/:id', updateSprint);
router.delete('/:id', deleteSprint);

router.patch('/:id/start', startSprint);
router.patch('/:id/end', endSprint);

export default router;
