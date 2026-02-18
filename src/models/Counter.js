import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  project: mongoose.Schema.Types.ObjectId,
  seq: { type: Number, default: 0 },
});

export default mongoose.model('Counter', counterSchema);
