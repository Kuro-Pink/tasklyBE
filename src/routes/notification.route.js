import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getMyNotifications,
  markRead,
  markAllRead,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.patch('/:id/read', protect, markRead);
router.patch('/read-all', protect, markAllRead);

export default router;
