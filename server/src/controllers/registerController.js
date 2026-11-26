import bcrypt from 'bcryptjs';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Course from '../models/Course.js';
import Semester from '../models/Semester.js';
import { sendError } from '../utils/crud.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getRegistrationOptions(req, res) {
  try {
    const [courses, semesters] = await Promise.all([
      Course.find().select('courseId name -_id').sort({ courseId: 1 }).lean(),
      Semester.find().select('semesterId name courseId -_id').sort({ semesterId: 1 }).lean()
    ]);
    res.json({ courses, semesters });
  } catch (error) {
    sendError(res, error, 'Could not load registration options');
  }
}

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

export async function registerStudent(req, res) {
  try {
    const { rollno, password, name, email, enroll, courseId, semesterId, dob, address } = req.body;
    const id = clean(rollno);
    const pass = clean(password);

    if (!id || !pass || !clean(name)) {
      return res.status(400).json({ message: 'Roll number, name and password are required' });
    }
    if (pass.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters' });
    }
    if (email && !EMAIL_RE.test(clean(email))) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    if (await Student.findOne({ rollno: id })) {
      return res.status(409).json({ message: 'This roll number is already registered' });
    }

    const student = await Student.create({
      rollno: id,
      enroll: clean(enroll),
      password: await bcrypt.hash(pass, 10),
      name: clean(name),
      email: clean(email),
      courseId: clean(courseId),
      semesterId: clean(semesterId),
      dob: dob ? new Date(dob) : undefined,
      address: clean(address)
    });
    const result = student.toObject();
    delete result.password;
    res.status(201).json({ message: 'Account created. You can sign in now.', user: result });
  } catch (error) {
    sendError(res, error, 'Could not create student account');
  }
}

export async function registerFaculty(req, res) {
  try {
    const { facultyId, password, name, email, phone, departmentId, qualification, address, researchInterest } = req.body;
    const id = clean(facultyId);
    const pass = clean(password);

    if (!id || !pass || !clean(name)) {
      return res.status(400).json({ message: 'Faculty ID, name and password are required' });
    }
    if (pass.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters' });
    }
    if (email && !EMAIL_RE.test(clean(email))) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    if (await Faculty.findOne({ facultyId: id })) {
      return res.status(409).json({ message: 'This faculty ID is already registered' });
    }

    const faculty = await Faculty.create({
      facultyId: id,
      password: await bcrypt.hash(pass, 10),
      name: clean(name),
      email: clean(email),
      phone: clean(phone),
      departmentId: clean(departmentId),
      qualification: clean(qualification),
      address: clean(address),
      researchInterest: clean(researchInterest)
    });
    const result = faculty.toObject();
    delete result.password;
    res.status(201).json({ message: 'Account created. You can sign in now.', user: result });
  } catch (error) {
    sendError(res, error, 'Could not create faculty account');
  }
}
