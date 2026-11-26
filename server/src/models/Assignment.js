import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    facultyAssignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'FacultyAssignment' },
    semesterId: { type: String, trim: true },
    rollno: { type: String, required: true, trim: true },
    subjectId: { type: String, trim: true },
    assignmentName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dueDate: { type: Date },
    answer: { type: String, default: '' },
    completionStatus: { type: String, enum: ['Complete', 'Incomplete'], default: 'Incomplete' }
  },
  { timestamps: true }
);

assignmentSchema.index({ rollno: 1, facultyAssignmentId: 1 }, { unique: true });

export default mongoose.model('Assignment', assignmentSchema);
