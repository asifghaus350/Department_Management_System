import bcrypt from 'bcryptjs';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import { crudHandlers, sendError } from '../utils/crud.js';

const studentCrud = crudHandlers(Student, 'rollno');
const facultyCrud = crudHandlers(Faculty, 'facultyId');

export const listStudents = studentCrud.list;
export const getStudent = studentCrud.get;
export const removeStudent = studentCrud.remove;
export async function listFaculty(req, res) {
  try {
    const query = req.user.role === 'hod' ? { departmentId: req.user.departmentId } : {};
    res.json(await Faculty.find(query).sort({ createdAt: -1 }).select('-password').lean());
  } catch (error) {
    sendError(res, error, 'Could not fetch faculty');
  }
}
export const getFaculty = facultyCrud.get;
export const removeFaculty = facultyCrud.remove;

export async function createStudent(req, res) {
  try {
    const { rollno, password } = req.body;
    if (!rollno || !password) {
      return res.status(400).json({ message: 'rollno and password are required' });
    }
    const doc = await Student.create({
      ...req.body,
      password: await bcrypt.hash(password, 10)
    });
    const result = doc.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error, 'Could not create student');
  }
}

export async function updateStudent(req, res) {
  try {
    const data = { ...req.body };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    else delete data.password;
    if (data.dob === '') delete data.dob;
    const doc = await Student.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    }).select('-password').lean();
    if (!doc) return res.status(404).json({ message: 'Student not found' });
    res.json(doc);
  } catch (error) {
    sendError(res, error, 'Could not update student');
  }
}

export async function createFaculty(req, res) {
  try {
    const { facultyId, password } = req.body;
    if (!facultyId || !password) {
      return res.status(400).json({ message: 'facultyId and password are required' });
    }
    const doc = await Faculty.create({
      ...req.body,
      password: await bcrypt.hash(password, 10)
    });
    const result = doc.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error, 'Could not create faculty');
  }
}

export async function updateFaculty(req, res) {
  try {
    const data = { ...req.body };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    else delete data.password;
    const doc = await Faculty.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    }).select('-password').lean();
    if (!doc) return res.status(404).json({ message: 'Faculty not found' });
    res.json(doc);
  } catch (error) {
    sendError(res, error, 'Could not update faculty');
  }
}
