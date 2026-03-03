import mongoose from 'mongoose';

const projectJoinRequestSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true },
);

projectJoinRequestSchema.index({ project: 1, user: 1 }, { unique: true });

export default mongoose.model('ProjectJoinRequest', projectJoinRequestSchema);
