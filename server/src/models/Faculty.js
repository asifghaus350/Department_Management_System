import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    departmentId: { type: String, trim: true },
    qualification: { type: String, trim: true },
    address: { type: String, trim: true },
    researchInterest: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Faculty', facultySchema);
