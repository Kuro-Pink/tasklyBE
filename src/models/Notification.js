import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['ISSUE_ASSIGN', 'COMMENT', 'PROJECT_INVITE'],
      default: 'COMMENT',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
  },
  { timestamps: true },
);

/* ================= INDEX ================= */

// Load danh sách notification (quan trọng nhất)
notificationSchema.index({ user: 1, createdAt: -1 });

// Đếm unread + mark all read
notificationSchema.index({ user: 1, isRead: 1 });

// Optional – nếu sau này filter theo project/issue
notificationSchema.index({ project: 1 });
notificationSchema.index({ issue: 1 });

export default mongoose.model('Notification', notificationSchema);
