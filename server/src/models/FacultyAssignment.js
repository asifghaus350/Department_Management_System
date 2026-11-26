import mongoose from 'mongoose';

const facultyAssignmentSchema = new mongoose.Schema(
  {
    semesterId: { type: String, trim: true },
    subjectId: { type: String, trim: true },
    assignmentName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dueDate: { type: Date },
    createdBy: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('FacultyAssignment', facultyAssignmentSchema);
