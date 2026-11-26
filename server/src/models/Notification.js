import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    audience: {
      type: String,
      enum: ['all', 'admin', 'dean', 'hod', 'faculty', 'student'],
      default: 'all'
    },
    departmentId: { type: String, default: '', trim: true },
    createdBy: { type: String, trim: true },
    reads: [{ user: String, role: String }]
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
