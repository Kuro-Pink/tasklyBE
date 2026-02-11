import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

/* ================= INDEX ================= */

// Lấy comment theo issue (mới nhất lên đầu)
commentSchema.index({ issue: 1, createdAt: -1 });

// Lọc comment theo author
commentSchema.index({ author: 1 });

export default mongoose.model('Comment', commentSchema);
