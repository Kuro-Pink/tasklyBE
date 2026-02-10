import mongoose from 'mongoose';

const sprintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('Sprint', sprintSchema);
