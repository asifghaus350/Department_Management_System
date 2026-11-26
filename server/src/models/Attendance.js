import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true, trim: true },
    rollno: { type: String, required: true, trim: true },
    semesterId: { type: String, trim: true },
    subjectId: { type: String, required: true, trim: true },
    attendanceDate: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent'], required: true }
  },
  { timestamps: true }
);

attendanceSchema.index(
  { facultyId: 1, rollno: 1, subjectId: 1, attendanceDate: 1 },
  { unique: true }
);

export default mongoose.model('Attendance', attendanceSchema);
