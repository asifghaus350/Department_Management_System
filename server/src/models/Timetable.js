import mongoose from 'mongoose';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const timetableSchema = new mongoose.Schema(
  {
    semesterId: { type: String, required: true, trim: true },
    roomno: { type: String, trim: true },
    day: { type: String, required: true, enum: DAYS, uppercase: true, trim: true },
    time: { type: String, required: true, trim: true },
    courseId: { type: String, trim: true },
    subjectId: { type: String, trim: true }
  },
  { timestamps: true }
);

timetableSchema.index({ semesterId: 1, day: 1, time: 1 });

export default mongoose.model('Timetable', timetableSchema);
