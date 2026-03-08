import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,

    type: {
      type: String,
      enum: ['Epic', 'Story', 'Task', 'Bug', 'Subtask'],
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },

    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Status',
      required: true,
    },

    sprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sprint',
      default: null,
    },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },

    flag: {
      type: String,
      enum: ['Impediment', 'Blocked'],
      default: null,
    },

    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Label',
      },
    ],

    startDate: {
      type: Date,
      default: null,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    number: {
      type: Number,
      required: true,
    },
    commits: [
      {
        message: String,
        url: String,
        author: String,
        date: Date,
      },
    ],
  },
  { timestamps: true },
);

/* ================= INDEX ================= */

// Board (quan trọng nhất)
issueSchema.index({ project: 1, status: 1 });

// Backlog
issueSchema.index({ project: 1, sprint: 1 });

// Subtask
issueSchema.index({ parent: 1 });

// User workload
issueSchema.index({ assignee: 1 });

// Project issues
issueSchema.index({ project: 1, createdAt: -1 });

// Search number trong project
issueSchema.index({ project: 1, number: 1 }, { unique: true });

issueSchema.index({ project: 1, startDate: 1 });
issueSchema.index({ project: 1, dueDate: 1 });

export default mongoose.model('Issue', issueSchema);
