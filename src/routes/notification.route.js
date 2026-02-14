import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getMyNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} from '../controllers/notification.controller.js';

const router = express.Router();
router.use(protect);

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);

export default router;
