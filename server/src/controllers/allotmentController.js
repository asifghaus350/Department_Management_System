import FacultySubject from '../models/FacultySubject.js';
import Faculty from '../models/Faculty.js';
import Subject from '../models/Subject.js';
import { sendError } from '../utils/crud.js';

export async function listAllotments(req, res) {
  try {
    const rows = await FacultySubject.find(req.scopeFilter || {}).sort({ createdAt: -1 }).lean();
    const faculty = await Faculty.find().select('facultyId name -_id').lean();
    const subjects = await Subject.find().select('subjectId name semesterId -_id').lean();
    const fMap = Object.fromEntries(faculty.map((f) => [f.facultyId, f.name]));
    const sMap = Object.fromEntries(subjects.map((s) => [s.subjectId, s]));
    res.json(
      rows.map((row) => ({
        ...row,
        facultyName: fMap[row.facultyId] || row.facultyId,
        subjectName: sMap[row.subjectId]?.name || row.subjectId,
        semesterName: sMap[row.subjectId]?.semesterId || row.semesterId
      }))
    );
  } catch (error) {
    sendError(res, error, 'Could not fetch allotments');
  }
}

export async function createAllotment(req, res) {
  try {
    const { facultyId, subjectId, semesterId, courseId } = req.body;
    if (!facultyId || !subjectId) {
      return res.status(400).json({ message: 'facultyId and subjectId are required' });
    }
    const doc = await FacultySubject.create({ facultyId, subjectId, semesterId, courseId });
    res.status(201).json(doc);
  } catch (error) {
    sendError(res, error, 'Could not allot subject');
  }
}

export async function removeAllotment(req, res) {
  try {
    const doc = await FacultySubject.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Allotment not found' });
    res.json({ message: 'Allotment removed' });
  } catch (error) {
    sendError(res, error, 'Could not remove allotment');
  }
}
