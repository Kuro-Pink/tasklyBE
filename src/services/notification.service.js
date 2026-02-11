import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import { emitNotification } from '../utils/socketEmitter.js';

/* CREATE */
export const createNotificationService = async (data) => {
  const notification = await Notification.create({
    ...data,
    isRead: false,
  });

  emitNotification(notification.user, notification);

  return notification;
};

/* GET MY */
export const getMyNotificationsService = async (userId) => {
  return Notification.find({ user: userId })
    .populate('project', 'name')
    .populate('issue', 'title')
    .sort({ createdAt: -1 })
    .limit(50);
};

/* MARK READ */
export const markReadService = async (id, userId) => {
  const noti = await Notification.findOneAndUpdate(
    { _id: id, user: userId }, // đảm bảo đúng chủ
    { isRead: true },
    { new: true },
  );

  if (!noti) throw new ApiError(404, 'Notification not found');

  return noti;
};

/* MARK ALL */
export const markAllReadService = async (userId) => {
  const result = await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

  return result.modifiedCount;
};

/* UNREAD COUNT */
export const getUnreadCountService = async (userId) => {
  return Notification.countDocuments({
    user: userId,
    isRead: false,
  });
};
