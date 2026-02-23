import mongoose from 'mongoose';

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
  },
  { timestamps: true },
);

labelSchema.index({ name: 1, project: 1 }, { unique: true });

export default mongoose.model('Label', labelSchema);
