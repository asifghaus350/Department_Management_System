import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Hod from '../models/Hod.js';
import Dean from '../models/Dean.js';
import { signToken } from '../middleware/auth.js';
import { sendError } from '../utils/crud.js';

const ROLE_CONFIG = {
  admin: { model: Admin, key: 'username', redirect: '/admin' },
  student: { model: Student, key: 'rollno', redirect: '/student' },
  faculty: { model: Faculty, key: 'facultyId', redirect: '/faculty' },
  hod: { model: Hod, key: 'hodId', redirect: '/hod' },
  dean: { model: Dean, key: 'deanId', redirect: '/dean' }
};

export async function login(req, res) {
  const { username, password, usertype } = req.body;
  if (!username || !password || !usertype) {
    return res.status(400).json({ message: 'Username, password and user type are required' });
  }

  const config = ROLE_CONFIG[usertype];
  if (!config) return res.status(400).json({ message: 'Invalid user type' });

  try {
    const user = await config.model.findOne({ [config.key]: username });
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) return res.status(401).json({ message: 'Invalid username or password' });

    const payload = {
      id: user._id.toString(),
      role: usertype,
      identifier: user[config.key],
      name: user.name || user[config.key],
      departmentId: user.departmentId || ''
    };

    res.json({ token: signToken(payload), user: payload, redirect: config.redirect });
  } catch (error) {
    sendError(res, error, 'Login failed');
  }
}

export function me(req, res) {
  res.json({ user: req.user });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both current and new password are required' });
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ message: 'New password must be at least 4 characters' });
  }

  const config = ROLE_CONFIG[req.user.role];
  try {
    const user = await config.model.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    sendError(res, error, 'Could not change password');
  }
}
