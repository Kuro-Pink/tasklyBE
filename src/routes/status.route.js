import express from 'express';
import {
  createStatus,
  getStatuses,
  updateStatus,
  reorderStatus,
  deleteStatus,
} from '../controllers/status.controller.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createStatus);
router.get('/', getStatuses);
router.put('/:id', updateStatus);
router.delete('/:id', deleteStatus);

router.patch('/reorder', reorderStatus);

export default router;
