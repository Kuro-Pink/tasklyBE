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
    endDate: Date,

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

/* ================= INDEX ================= */

// Lấy sprint theo project (Board page)
sprintSchema.index({ project: 1, createdAt: -1 });

// Sort theo ngày bắt đầu
sprintSchema.index({ project: 1, startDate: -1 });

export default mongoose.model('Sprint', sprintSchema);
