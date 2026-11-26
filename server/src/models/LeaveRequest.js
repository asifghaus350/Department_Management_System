import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
  {
    applicantId: { type: String, required: true, trim: true },
    applicantName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    departmentId: { type: String, default: '', trim: true },
    type: { type: String, enum: ['Leave', 'OD', 'Permission'], default: 'Leave' },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: Date },
    remark: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('LeaveRequest', leaveRequestSchema);
