import Course from '../models/Course.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Exam from '../models/Exam.js';
import { crudHandlers, sendError } from '../utils/crud.js';

export const courses = crudHandlers(Course, 'courseId');
export const semesters = crudHandlers(Semester, 'semesterId');
export const subjects = crudHandlers(Subject, 'subjectId');
export const exams = crudHandlers(Exam, 'subjectId');

export async function listSubjects(req, res) {
  try {
    let query = {};
    if (req.user.role === 'hod') {
      const semesters = await Semester.find({ courseId: req.user.departmentId })
        .select('semesterId -_id')
        .lean();
      query = { semesterId: { $in: semesters.map((s) => s.semesterId) } };
    }
    res.json(await Subject.find(query).sort({ createdAt: -1 }).lean());
  } catch (error) {
    sendError(res, error, 'Could not fetch subjects');
  }
}

export async function listExams(req, res) {
  try {
    res.json(await Exam.find().sort({ date: 1 }).lean());
  } catch (error) {
    sendError(res, error, 'Could not fetch exams');
  }
}
