import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // Nếu muốn global unique như Jira
    key: { type: String, required: true, unique: true },

    description: String,

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['Owner', 'Member'],
          default: 'Member',
        },
      },
    ],
  },
  { timestamps: true },
);

/* ================= INDEX ================= */

sprintSchema.index({ project: 1, isActive: 1 });
sprintSchema.index({ project: 1, startDate: 1 });

export default mongoose.model('Project', projectSchema);
