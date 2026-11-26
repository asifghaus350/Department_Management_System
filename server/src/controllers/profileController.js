import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Hod from '../models/Hod.js';
import Dean from '../models/Dean.js';
import { sendError } from '../utils/crud.js';

const MODELS = { admin: Admin, student: Student, faculty: Faculty, hod: Hod, dean: Dean };
const EDITABLE = ['name', 'email', 'phone', 'address', 'qualification', 'researchInterest'];

export async function getProfile(req, res) {
  try {
    const Model = MODELS[req.user.role];
    const doc = await Model.findById(req.user.id).select('-password').lean();
    if (!doc) return res.status(404).json({ message: 'Profile not found' });
    res.json(doc);
  } catch (error) {
    sendError(res, error, 'Could not fetch profile');
  }
}

export async function updateProfile(req, res) {
  try {
    const Model = MODELS[req.user.role];
    const data = {};
    EDITABLE.forEach((field) => {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    });
    const doc = await Model.findByIdAndUpdate(req.user.id, data, {
      new: true,
      runValidators: true
    }).select('-password').lean();
    if (!doc) return res.status(404).json({ message: 'Profile not found' });
    res.json({ ...doc, role: req.user.role, identifier: req.user.identifier });
  } catch (error) {
    sendError(res, error, 'Could not update profile');
  }
}
