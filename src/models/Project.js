import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true }, // TASK
    description: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['Owner', 'Member'], default: 'Member' },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model('Project', projectSchema);
