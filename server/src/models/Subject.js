import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    subjectId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    semesterId: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Subject', subjectSchema);
