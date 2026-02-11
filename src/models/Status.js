import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    color: { type: String, default: '#999' },

    order: { type: Number, default: 0 },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  },
  { timestamps: true },
);

/* ================= INDEX ================= */

// Load board
statusSchema.index({ project: 1, order: 1 });

// Không cho trùng tên status trong cùng project
statusSchema.index({ project: 1, name: 1 }, { unique: true });

export default mongoose.model('Status', statusSchema);
