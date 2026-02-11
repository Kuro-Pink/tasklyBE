import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getMyNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', protect, markRead);
router.patch('/read-all', protect, markAllRead);

export default router;
