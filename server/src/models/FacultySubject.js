import mongoose from 'mongoose';

const facultySubjectSchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true, trim: true },
    subjectId: { type: String, required: true, trim: true },
    semesterId: { type: String, trim: true },
    courseId: { type: String, trim: true }
  },
  { timestamps: true }
);

facultySubjectSchema.index({ facultyId: 1, subjectId: 1 }, { unique: true });

export default mongoose.model('FacultySubject', facultySubjectSchema);
