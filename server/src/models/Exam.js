import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    subjectId: { type: String, required: true, trim: true },
    subjectName: { type: String, trim: true },
    date: { type: Date, required: true },
    time: { type: String, trim: true },
    room: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Exam', examSchema);
