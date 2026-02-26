import mongoose from 'mongoose';

const sprintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    startDate: Date,
    dueDate: Date,

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

/* ================= INDEX ================= */

sprintSchema.index({ project: 1, isActive: 1 });
sprintSchema.index({ project: 1, startDate: 1 });

export default mongoose.model('Sprint', sprintSchema);
