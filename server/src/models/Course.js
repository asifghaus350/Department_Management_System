import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
