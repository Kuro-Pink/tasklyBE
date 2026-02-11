import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';

import {
  getMyNotificationsService,
  markReadService,
  markAllReadService,
  getUnreadCountService,
} from '../services/notification.service.js';

/* ===================== GET MY ===================== */
export const getMyNotifications = catchAsync(async (req, res) => {
  const data = await getMyNotificationsService(req.user._id);
  res.json(new ApiResponse(200, data));
});

/* ===================== MARK READ ===================== */
export const markRead = catchAsync(async (req, res) => {
  const data = await markReadService(req.params.id, req.user._id);
  res.json(new ApiResponse(200, data, 'Marked as read'));
});

/* ===================== MARK ALL ===================== */
export const markAllRead = catchAsync(async (req, res) => {
  const count = await markAllReadService(req.user._id);
  res.json(new ApiResponse(200, count, 'All marked as read'));
});

/* ===================== UNREAD COUNT ===================== */
export const getUnreadCount = catchAsync(async (req, res) => {
  const count = await getUnreadCountService(req.user._id);
  res.json(new ApiResponse(200, { count }));
});
