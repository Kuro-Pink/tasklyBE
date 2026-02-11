import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    content: String,
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ issue: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);
