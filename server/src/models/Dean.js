import mongoose from 'mongoose';

const deanSchema = new mongoose.Schema(
  {
    deanId: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    qualification: { type: String, trim: true },
    address: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Dean', deanSchema);
