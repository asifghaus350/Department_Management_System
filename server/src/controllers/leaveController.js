import LeaveRequest from '../models/LeaveRequest.js';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Hod from '../models/Hod.js';
import Dean from '../models/Dean.js';
import { sendError } from '../utils/crud.js';

const MODELS = { admin: Admin, student: Student, faculty: Faculty, hod: Hod, dean: Dean };

export async function createLeave(req, res) {
  try {
    const { type, fromDate, toDate, reason } = req.body;
    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({ message: 'fromDate, toDate and reason are required' });
    }
    const Model = MODELS[req.user.role];
    const applicant = Model ? await Model.findById(req.user.id).select('name courseId departmentId -_id').lean() : null;
    const doc = await LeaveRequest.create({
      applicantId: req.user.identifier,
      applicantName: req.user.name,
      role: req.user.role,
      departmentId: applicant?.courseId || applicant?.departmentId || req.user.departmentId || '',
      type: type || 'Leave',
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason
    });
    res.status(201).json(doc);
  } catch (error) {
    sendError(res, error, 'Could not submit request');
  }
}

export async function listLeaves(req, res) {
  try {
    const review = req.query.scope === 'review' && ['admin', 'dean', 'hod'].includes(req.user.role);
    const query = review ? {} : { applicantId: req.user.identifier, role: req.user.role };
    if (review && req.user.role === 'hod') query.departmentId = req.user.departmentId;
    if (req.query.status) query.status = req.query.status;
    res.json(await LeaveRequest.find(query).sort({ createdAt: -1 }).lean());
  } catch (error) {
    sendError(res, error, 'Could not fetch requests');
  }
}

export async function reviewLeave(req, res) {
  try {
    const { status, remark } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'status must be Approved or Rejected' });
    }
    const doc = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status, remark: remark || '', reviewedBy: req.user.identifier, reviewedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: 'Request not found' });
    res.json(doc);
  } catch (error) {
    sendError(res, error, 'Could not review request');
  }
}
