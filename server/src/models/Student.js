import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    rollno: { type: String, required: true, unique: true, trim: true },
    enroll: { type: String, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    courseId: { type: String, trim: true },
    semesterId: { type: String, trim: true },
    dob: { type: Date },
    address: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
