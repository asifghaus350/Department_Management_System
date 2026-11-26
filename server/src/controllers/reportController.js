import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import { sendError } from '../utils/crud.js';

export async function attendanceReport(req, res) {
  try {
    const query = {};
    if (req.query.subjectId) query.subjectId = req.query.subjectId;
    if (req.query.from || req.query.to) {
      query.attendanceDate = {};
      if (req.query.from) query.attendanceDate.$gte = new Date(req.query.from);
      if (req.query.to) query.attendanceDate.$lte = new Date(`${req.query.to}T23:59:59.999Z`);
    }

    const [rows, students, subjects] = await Promise.all([
      Attendance.find(query).sort({ attendanceDate: -1 }).limit(2000).lean(),
      Student.find().select('rollno name courseId -_id').lean(),
      Subject.find().select('subjectId name semesterId -_id').lean()
    ]);
    const sMap = Object.fromEntries(students.map((s) => [s.rollno, s]));
    const subMap = Object.fromEntries(subjects.map((s) => [s.subjectId, s]));

    const result = rows
      .filter((row) => {
        if (req.user.role !== 'hod') return true;
        return sMap[row.rollno]?.courseId === req.user.departmentId;
      })
      .map((row) => ({
        date: new Date(row.attendanceDate).toISOString().slice(0, 10),
        rollno: row.rollno,
        studentName: sMap[row.rollno]?.name || row.rollno,
        subjectId: row.subjectId,
        subjectName: subMap[row.subjectId]?.name || row.subjectId,
        semesterId: row.semesterId,
        facultyId: row.facultyId,
        status: row.status
      }));

    res.json({
      rows: result,
      summary: {
        total: result.length,
        present: result.filter((r) => r.status === 'Present').length,
        absent: result.filter((r) => r.status === 'Absent').length
      }
    });
  } catch (error) {
    sendError(res, error, 'Could not generate report');
  }
}
