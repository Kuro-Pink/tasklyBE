import Notification from '../models/Notification.js';
import { emitNotification } from '../utils/socketEmitter.js';

/* CREATE */
export const createNotificationService = async (data) => {
  const notification = await Notification.create(data);

  emitNotification(notification.user, notification);

  return notification;
};

/* GET MY */
export const getMyNotificationsService = async (userId) => {
  return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
};

/* MARK READ */
export const markReadService = async (id, userId) => {
  return Notification.findOneAndUpdate({ _id: id, user: userId }, { isRead: true }, { new: true });
};

/* MARK ALL */
export const markAllReadService = async (userId) => {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
};
