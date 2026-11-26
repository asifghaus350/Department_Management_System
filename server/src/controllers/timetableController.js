import Timetable from '../models/Timetable.js';
import FacultySubject from '../models/FacultySubject.js';
import Subject from '../models/Subject.js';
import Semester from '../models/Semester.js';
import { sendError } from '../utils/crud.js';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export async function listTimetable(req, res) {
  try {
    const query = req.query.semesterId ? { semesterId: req.query.semesterId } : {};
    if (req.user.role === 'hod') {
      const semesters = await Semester.find({ courseId: req.user.departmentId })
        .select('semesterId -_id')
        .lean();
      query.semesterId = { $in: semesters.map((s) => s.semesterId) };
    }
    const rows = await Timetable.find(query).lean();
    rows.sort(
      (a, b) =>
        DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.time.localeCompare(b.time)
    );
    res.json(rows);
  } catch (error) {
    sendError(res, error, 'Could not fetch timetable');
  }
}

export async function listFacultyTimetable(req, res) {
  try {
    const allotments = await FacultySubject.find({ facultyId: req.user.identifier })
      .select('subjectId -_id')
      .lean();
    const subjectIds = allotments.map((a) => a.subjectId);
    const rows = await Timetable.find({ subjectId: { $in: subjectIds } }).lean();
    const subjects = await Subject.find({ subjectId: { $in: subjectIds } })
      .select('subjectId name -_id')
      .lean();
    const sMap = Object.fromEntries(subjects.map((s) => [s.subjectId, s.name]));
    rows.sort(
      (a, b) =>
        DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.time.localeCompare(b.time)
    );
    res.json(rows.map((r) => ({ ...r, subjectName: sMap[r.subjectId] || r.subjectId })));
  } catch (error) {
    sendError(res, error, 'Could not fetch faculty timetable');
  }
}

export async function createSlot(req, res) {
  try {
    const { semesterId, roomno, day, time, courseId, subjectId } = req.body;
    if (!semesterId || !day || !time) {
      return res.status(400).json({ message: 'semesterId, day and time are required' });
    }
    const doc = await Timetable.create({
      semesterId,
      roomno,
      day: day.toUpperCase(),
      time,
      courseId,
      subjectId
    });
    res.status(201).json(doc);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid day value' });
    }
    sendError(res, error, 'Could not add timetable slot');
  }
}

export async function removeSlot(req, res) {
  try {
    const doc = await Timetable.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Slot deleted' });
  } catch (error) {
    sendError(res, error, 'Could not delete slot');
  }
}
