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

export default mongoose.model('Notification', notificationSchema);
