import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import { sendError } from '../utils/crud.js';

export async function listAttendance(req, res) {
  try {
    const query = {};
    if (req.user.role === 'student') query.rollno = req.user.identifier;
    else if (req.user.role === 'faculty') query.facultyId = req.user.identifier;
    if (req.query.subjectId) query.subjectId = req.query.subjectId;
    if (req.query.rollno && req.user.role === 'faculty') query.rollno = req.query.rollno;
    const rows = await Attendance.find(query).sort({ attendanceDate: -1 }).lean();
    res.json(rows);
  } catch (error) {
    sendError(res, error, 'Could not fetch attendance');
  }
}

export async function studentsForSubject(req, res) {
  try {
    const { subjectId, date } = req.query;
    if (!subjectId) return res.status(400).json({ message: 'subjectId is required' });
    const subject = await Subject.findOne({ subjectId }).lean();
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const students = await Student.find({ semesterId: subject.semesterId })
      .select('rollno name enroll -_id')
      .sort({ rollno: 1 })
      .lean();

    let existing = [];
    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      existing = await Attendance.find({
        subjectId,
        facultyId: req.user.identifier,
        attendanceDate: { $gte: start, $lte: end }
      }).lean();
    }
    const statusMap = Object.fromEntries(existing.map((r) => [r.rollno, r.status]));
    res.json({ subject, students: students.map((s) => ({ ...s, status: statusMap[s.rollno] || '' })) });
  } catch (error) {
    sendError(res, error, 'Could not fetch students');
  }
}

export async function submitAttendance(req, res) {
  try {
    const { subjectId, attendanceDate, presentRollnos } = req.body;
    if (!subjectId || !attendanceDate || !Array.isArray(presentRollnos)) {
      return res.status(400).json({ message: 'subjectId, attendanceDate and presentRollnos are required' });
    }
    const subject = await Subject.findOne({ subjectId }).lean();
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const students = await Student.find({ semesterId: subject.semesterId })
      .select('rollno -_id')
      .lean();
    const present = new Set(presentRollnos);
    const day = new Date(`${attendanceDate}T00:00:00.000Z`);
    if (Number.isNaN(day.getTime())) return res.status(400).json({ message: 'Invalid date' });

    const ops = students.map((student) => ({
      updateOne: {
        filter: {
          facultyId: req.user.identifier,
          rollno: student.rollno,
          subjectId,
          attendanceDate: day
        },
        update: {
          $set: {
            facultyId: req.user.identifier,
            rollno: student.rollno,
            subjectId,
            semesterId: subject.semesterId,
            attendanceDate: day,
            status: present.has(student.rollno) ? 'Present' : 'Absent'
          }
        },
        upsert: true
      }
    }));

    if (ops.length) await Attendance.bulkWrite(ops);
    res.json({
      message: 'Attendance saved',
      present: students.filter((s) => present.has(s.rollno)).length,
      total: students.length
    });
  } catch (error) {
    sendError(res, error, 'Could not save attendance');
  }
}
