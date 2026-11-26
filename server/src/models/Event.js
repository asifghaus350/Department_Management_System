import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
    time: { type: String, trim: true },
    location: { type: String, trim: true },
    audience: {
      type: String,
      enum: ['all', 'admin', 'dean', 'hod', 'faculty', 'student'],
      default: 'all'
    },
    departmentId: { type: String, default: '', trim: true },
    createdBy: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
