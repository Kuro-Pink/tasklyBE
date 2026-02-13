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
          enum: ['Owner', 'Member', 'Admin'],
          default: 'Member',
        },
      },
    ],
  },
  { timestamps: true },
);

/* ================= INDEX ================= */

// Lấy project theo owner (My Projects)
projectSchema.index({ owner: 1, createdAt: -1 });

// Lấy project theo member
projectSchema.index({ 'members.user': 1 });

// Nếu muốn sort theo thời gian tạo
projectSchema.index({ createdAt: -1 });

export default mongoose.model('Project', projectSchema);
