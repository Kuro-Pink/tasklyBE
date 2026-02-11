import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  getMyNotificationsService,
  markReadService,
  markAllReadService,
} from '../services/notification.service.js';

export const getMyNotifications = catchAsync(async (req, res) => {
  const data = await getMyNotificationsService(req.user._id);
  res.json(new ApiResponse(200, data));
});

export const markRead = catchAsync(async (req, res) => {
  const data = await markReadService(req.params.id, req.user._id);
  res.json(new ApiResponse(200, data));
});

export const markAllRead = catchAsync(async (req, res) => {
  await markAllReadService(req.user._id);
  res.json(new ApiResponse(200, 'OK'));
});
