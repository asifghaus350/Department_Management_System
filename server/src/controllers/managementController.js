import bcrypt from 'bcryptjs';
import Hod from '../models/Hod.js';
import Dean from '../models/Dean.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Subject from '../models/Subject.js';
import { crudHandlers, sendError } from '../utils/crud.js';

export const hods = crudHandlers(Hod, 'hodId');
export const deans = crudHandlers(Dean, 'deanId');

export async function createHod(req, res) {
  try {
    const { hodId, password, departmentId } = req.body;
    if (!hodId || !password || !departmentId) {
      return res.status(400).json({ message: 'hodId, password and departmentId are required' });
    }
    const doc = await Hod.create({ ...req.body, password: await bcrypt.hash(password, 10) });
    const result = doc.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error, 'Could not create HOD');
  }
}

export async function updateHod(req, res) {
  try {
    const data = { ...req.body };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    else delete data.password;
    const doc = await Hod.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    }).select('-password').lean();
    if (!doc) return res.status(404).json({ message: 'HOD not found' });
    res.json(doc);
  } catch (error) {
    sendError(res, error, 'Could not update HOD');
  }
}

export async function createDean(req, res) {
  try {
    const { deanId, password } = req.body;
    if (!deanId || !password) {
      return res.status(400).json({ message: 'deanId and password are required' });
    }
    const doc = await Dean.create({ ...req.body, password: await bcrypt.hash(password, 10) });
    const result = doc.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error, 'Could not create Dean');
  }
}

export async function updateDean(req, res) {
  try {
    const data = { ...req.body };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    else delete data.password;
    const doc = await Dean.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    }).select('-password').lean();
    if (!doc) return res.status(404).json({ message: 'Dean not found' });
    res.json(doc);
  } catch (error) {
    sendError(res, error, 'Could not update Dean');
  }
}

export async function listDepartments(req, res) {
  try {
    const [courses, hods, students, faculty, subjects] = await Promise.all([
      Course.find().sort({ courseId: 1 }).lean(),
      Hod.find().select('hodId name departmentId email -_id').lean(),
      Student.find().select('courseId -_id').lean(),
      Faculty.find().select('facultyId name departmentId -_id').lean(),
      SemesterIds()
    ]);
    const hodMap = Object.fromEntries(hods.map((h) => [h.departmentId, h]));
    const result = courses.map((course) => ({
      ...course,
      hod: hodMap[course.courseId] || null,
      students: students.filter((s) => s.courseId === course.courseId).length,
      faculty: faculty.filter((f) => f.departmentId === course.courseId).length,
      subjects: subjects.filter((s) => s.courseId === course.courseId).length
    }));
    res.json(result);
  } catch (error) {
    sendError(res, error, 'Could not fetch departments');
  }
}

async function SemesterIds() {
  const { default: Semester } = await import('../models/Semester.js');
  const semesters = await Semester.find().select('semesterId courseId -_id').lean();
  const subjects = await Subject.find().select('subjectId semesterId -_id').lean();
  const map = Object.fromEntries(semesters.map((s) => [s.semesterId, s.courseId]));
  return subjects.map((s) => ({ ...s, courseId: map[s.semesterId] || '' }));
}
