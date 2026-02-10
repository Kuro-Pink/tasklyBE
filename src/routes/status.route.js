import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createStatus, getStatuses } from '../controllers/status.controller.js';

const router = express.Router();

router.post('/', protect, createStatus);
router.get('/', protect, getStatuses);

export default router;
