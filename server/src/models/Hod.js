import mongoose from 'mongoose';

const hodSchema = new mongoose.Schema(
  {
    hodId: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    departmentId: { type: String, required: true, trim: true },
    qualification: { type: String, trim: true },
    address: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Hod', hodSchema);
