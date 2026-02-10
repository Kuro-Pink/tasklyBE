import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createSprint,
  getSprints,
  startSprint,
  endSprint,
  deleteSprint,
} from '../controllers/sprint.controller.js';

const router = express.Router();

router.post('/', protect, createSprint);
router.get('/', protect, getSprints);
router.patch('/:id/start', protect, startSprint);
router.patch('/:id/end', protect, endSprint);
router.delete('/:id', protect, deleteSprint);

export default router;
