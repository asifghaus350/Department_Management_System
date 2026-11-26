import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    content: { type: String, required: true, trim: true },
    courseId: { type: String, trim: true },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);
