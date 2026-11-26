import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema(
  {
    semesterId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    courseId: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Semester', semesterSchema);
