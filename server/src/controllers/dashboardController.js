import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Course from '../models/Course.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import FacultySubject from '../models/FacultySubject.js';
import Timetable from '../models/Timetable.js';
import Attendance from '../models/Attendance.js';
import Announcement from '../models/Announcement.js';
import Assignment from '../models/Assignment.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import Hod from '../models/Hod.js';
import Dean from '../models/Dean.js';
import Notification from '../models/Notification.js';
import Event from '../models/Event.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Exam from '../models/Exam.js';
import { sendError } from '../utils/crud.js';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const dayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
const isoDay = (date) => new Date(date).toISOString().slice(0, 10);

export async function adminDashboard(req, res) {
  try {
    const [students, faculty, courses, semesters, subjects, slots, announcements, assignments] =
      await Promise.all([
        Student.countDocuments(),
        Faculty.countDocuments(),
        Course.countDocuments(),
        Semester.countDocuments(),
        Subject.countDocuments(),
        Timetable.countDocuments(),
        Announcement.countDocuments(),
        Assignment.countDocuments()
      ]);
    const [recentStudents, recentFaculty, recentAnnouncements] = await Promise.all([
      Student.find().select('rollno name courseId semesterId -_id').sort({ createdAt: -1 }).limit(5).lean(),
      Faculty.find().select('facultyId name qualification -_id').sort({ createdAt: -1 }).limit(5).lean(),
      Announcement.find().sort({ date: -1 }).limit(5).lean()
    ]);
    res.json({
      stats: { students, faculty, courses, semesters, subjects, slots, announcements, assignments },
      recentStudents,
      recentFaculty,
      announcements: recentAnnouncements
    });
  } catch (error) {
    sendError(res, error, 'Could not load dashboard');
  }
}

export async function studentDashboard(req, res) {
  try {
    const rollno = req.user.identifier;
    const student = await Student.findOne({ rollno }).select('-password').lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const [course, semester, subjects, announcements, records, timetable] = await Promise.all([
      Course.findOne({ courseId: student.courseId }).select('courseId name -_id').lean(),
      Semester.findOne({ semesterId: student.semesterId }).select('semesterId name -_id').lean(),
      Subject.find({ semesterId: student.semesterId }).lean(),
      Announcement.find().sort({ date: -1 }).limit(5).lean(),
      Attendance.find({ rollno }).lean(),
      Timetable.find({ semesterId: student.semesterId }).lean()
    ]);

    const attendance = subjects.map((subject) => {
      const own = records.filter((r) => r.subjectId === subject.subjectId);
      const total = new Set(own.map((r) => isoDay(r.attendanceDate))).size;
      const present = own.filter((r) => r.status === 'Present').length;
      return {
        subjectId: subject.subjectId,
        subjectName: subject.name,
        total,
        present,
        percentage: total ? Math.round((present / total) * 100) : 0
      };
    });

    const [assignments, exams, events] = await Promise.all([
      Assignment.find({ rollno }).select('completionStatus -_id').lean(),
      Exam.find().sort({ date: 1 }).limit(3).lean(),
      Event.find({ $or: [{ audience: 'all' }, { audience: 'student' }] }).sort({ date: 1 }).limit(4).lean()
    ]);

    const subjectNames = Object.fromEntries(subjects.map((s) => [s.subjectId, s.name]));
    const enrichedTimetable = timetable.map((slot) => ({
      ...slot,
      subjectName: subjectNames[slot.subjectId] || slot.subjectId
    }));

    const today = dayName();
    const todaySubjects = timetable.filter((slot) => slot.day === today).map((slot) => slot.subjectId);
    const allotments = await FacultySubject.find({ subjectId: { $in: todaySubjects } }).lean();
    const faculty = await Faculty.find({ facultyId: { $in: allotments.map((a) => a.facultyId) } })
      .select('facultyId name -_id')
      .lean();
    const todayFaculty = [...new Map(faculty.map((f) => [f.facultyId, f])).values()].map((f) => ({
      ...f,
      subjects: allotments
        .filter((a) => a.facultyId === f.facultyId)
        .map((a) => subjectNames[a.subjectId] || a.subjectId)
    }));

    enrichedTimetable.sort(
      (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.time.localeCompare(b.time)
    );

    const withSessions = attendance.filter((item) => item.total > 0);
    const avgAttendance = withSessions.length
      ? Math.round(withSessions.reduce((sum, item) => sum + item.percentage, 0) / withSessions.length)
      : 0;

    res.json({
      student: { ...student, courseName: course?.name || '', semesterName: semester?.name || '' },
      attendance,
      announcements,
      todayFaculty,
      timetable: enrichedTimetable,
      events,
      exams,
      quickStats: {
        attendance: avgAttendance,
        assignments: assignments.length,
        pendingAssignments: assignments.filter((a) => a.completionStatus === 'Incomplete').length,
        exams: exams.length
      },
      today
    });
  } catch (error) {
    sendError(res, error, 'Could not load dashboard');
  }
}

export async function facultyDashboard(req, res) {
  try {
    const faculty = await Faculty.findOne({ facultyId: req.user.identifier })
      .select('-password')
      .lean();
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    const allotments = await FacultySubject.find({ facultyId: faculty.facultyId }).lean();
    const subjectIds = allotments.map((a) => a.subjectId);
    const [subjects, slots, assignments, sessions] = await Promise.all([
      Subject.find({ subjectId: { $in: subjectIds } }).lean(),
      Timetable.find({ subjectId: { $in: subjectIds } }).lean(),
      FacultyAssignment.find({ createdBy: faculty.facultyId }).sort({ createdAt: -1 }).limit(5).lean(),
      Attendance.countDocuments({ facultyId: faculty.facultyId })
    ]);
    const names = Object.fromEntries(subjects.map((s) => [s.subjectId, s.name]));
    slots.sort(
      (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.time.localeCompare(b.time)
    );

    res.json({
      faculty,
      subjects: subjects.map((s) => ({ ...s, courseId: allotments.find((a) => a.subjectId === s.subjectId)?.courseId })),
      timetable: slots.map((s) => ({ ...s, subjectName: names[s.subjectId] || s.subjectId })),
      assignments,
      stats: { subjects: subjects.length, sessions, slots: slots.length }
    });
  } catch (error) {
    sendError(res, error, 'Could not load dashboard');
  }
}

const notificationQuery = (user) => {
  const query = { $or: [{ audience: 'all' }, { audience: user.role }] };
  if (user.departmentId) query.$or.push({ departmentId: user.departmentId });
  return query;
};

export async function hodDashboard(req, res) {
  try {
    const departmentId = req.user.departmentId;
    const hod = await Hod.findOne({ hodId: req.user.identifier }).select('-password').lean();
    if (!hod) return res.status(404).json({ message: 'HOD not found' });

    const semesters = await Semester.find({ courseId: departmentId }).select('semesterId -_id').lean();
    const semesterIds = semesters.map((s) => s.semesterId);
    const [department, students, faculty, subjects, events, notifications, leaves] =
      await Promise.all([
        Course.findOne({ courseId: departmentId }).lean(),
        Student.find({ courseId: departmentId }).select('rollno name semesterId -_id').sort({ createdAt: -1 }).limit(5).lean(),
        Faculty.find({ departmentId }).select('facultyId name qualification -_id').sort({ createdAt: -1 }).limit(5).lean(),
        Subject.find({ semesterId: { $in: semesterIds } }).lean(),
        Event.find({ $or: [{ audience: 'all' }, { departmentId }] }).sort({ date: 1 }).limit(5).lean(),
        Notification.find(notificationQuery(req.user)).sort({ createdAt: -1 }).limit(5).lean(),
        LeaveRequest.find({ departmentId, status: 'Pending' }).sort({ createdAt: -1 }).limit(5).lean()
      ]);

    const rollnos = await Student.find({ courseId: departmentId }).select('rollno -_id').lean();
    const [studentCount, facultyCount, slots, sessions] = await Promise.all([
      Student.countDocuments({ courseId: departmentId }),
      Faculty.countDocuments({ departmentId }),
      Timetable.countDocuments({ semesterId: { $in: semesterIds } }),
      Attendance.countDocuments({ rollno: { $in: rollnos.map((r) => r.rollno) } })
    ]);

    res.json({
      hod,
      departmentName: department?.name || departmentId,
      stats: {
        students: studentCount, faculty: facultyCount, subjects: subjects.length,
        slots, sessions, pendingLeaves: leaves.length
      },
      recentStudents: students,
      recentFaculty: faculty,
      events,
      notifications: notifications.map((n) => ({
        ...n,
        read: n.reads.some((r) => r.user === req.user.identifier && r.role === req.user.role)
      })),
      leaves
    });
  } catch (error) {
    sendError(res, error, 'Could not load dashboard');
  }
}

export async function deanDashboard(req, res) {
  try {
    const dean = await Dean.findOne({ deanId: req.user.identifier }).select('-password').lean();
    if (!dean) return res.status(404).json({ message: 'Dean not found' });

    const [courses, hods, students, faculty, subjects, leaves, events, notifications] =
      await Promise.all([
        Course.find().sort({ courseId: 1 }).lean(),
        Hod.find().select('hodId name departmentId email -_id').lean(),
        Student.find().select('courseId rollno -_id').lean(),
        Faculty.find().select('departmentId facultyId -_id').lean(),
        Subject.find().select('subjectId semesterId -_id').lean(),
        LeaveRequest.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(8).lean(),
        Event.find().sort({ date: 1 }).limit(6).lean(),
        Notification.find(notificationQuery(req.user)).sort({ createdAt: -1 }).limit(6).lean()
      ]);

    const semesters = await Semester.find().select('semesterId courseId -_id').lean();
    const semesterCourse = Object.fromEntries(semesters.map((s) => [s.semesterId, s.courseId]));
    const hodMap = Object.fromEntries(hods.map((h) => [h.departmentId, h]));
    const departments = courses.map((course) => ({
      ...course,
      hod: hodMap[course.courseId]?.name || 'Not assigned',
      students: students.filter((s) => s.courseId === course.courseId).length,
      faculty: faculty.filter((f) => f.departmentId === course.courseId).length,
      subjects: subjects.filter((s) => semesterCourse[s.semesterId] === course.courseId).length
    }));

    res.json({
      dean,
      stats: {
        departments: courses.length,
        students: students.length,
        faculty: faculty.length,
        hods: hods.length,
        subjects: subjects.length,
        pendingLeaves: leaves.length
      },
      departments,
      hods,
      leaves,
      events,
      notifications: notifications.map((n) => ({
        ...n,
        read: n.reads.some((r) => r.user === req.user.identifier && r.role === req.user.role)
      }))
    });
  } catch (error) {
    sendError(res, error, 'Could not load dashboard');
  }
}
