import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { applyScope } from '../middleware/scope.js';

import { login, me, changePassword } from '../controllers/authController.js';
import {
  getRegistrationOptions, registerStudent, registerFaculty
} from '../controllers/registerController.js';
import {
  courses, semesters, subjects, exams, listExams, listSubjects
} from '../controllers/catalogController.js';
import {
  listStudents, getStudent, createStudent, updateStudent, removeStudent,
  listFaculty, getFaculty, createFaculty, updateFaculty, removeFaculty
} from '../controllers/peopleController.js';
import { listAllotments, createAllotment, removeAllotment } from '../controllers/allotmentController.js';
import { listTimetable, listFacultyTimetable, createSlot, removeSlot } from '../controllers/timetableController.js';
import {
  listAnnouncements, createAnnouncement, getAnnouncement, updateAnnouncement, removeAnnouncement
} from '../controllers/announcementController.js';
import { listAttendance, studentsForSubject, submitAttendance } from '../controllers/attendanceController.js';
import {
  listAssignments, listMasterAssignments, createAssignment, updateAssignment, removeAssignment
} from '../controllers/assignmentController.js';
import {
  adminDashboard, studentDashboard, facultyDashboard, hodDashboard, deanDashboard
} from '../controllers/dashboardController.js';
import {
  hods, deans, createHod, updateHod, createDean, updateDean, listDepartments
} from '../controllers/managementController.js';
import {
  listNotifications, createNotification, markRead, removeNotification
} from '../controllers/notificationController.js';
import { listEvents, createEvent, updateEvent, removeEvent } from '../controllers/eventController.js';
import { createLeave, listLeaves, reviewLeave } from '../controllers/leaveController.js';
import { attendanceReport } from '../controllers/reportController.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = Router();
const admin = requireRole('admin');
const faculty = requireRole('faculty');
const student = requireRole('student');
const hod = requireRole('hod');
const dean = requireRole('dean');
const leadership = requireRole('admin', 'hod', 'dean');

router.post('/auth/login', login);

// Public self-registration (no token required)
router.get('/register/options', getRegistrationOptions);
router.post('/register/student', registerStudent);
router.post('/register/faculty', registerFaculty);

router.use(protect);
router.use(applyScope);

// Profile & auth
router.get('/auth/me', me);
router.post('/auth/change-password', changePassword);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Dashboards
router.get('/dashboard/admin', admin, adminDashboard);
router.get('/dashboard/student', student, studentDashboard);
router.get('/dashboard/faculty', faculty, facultyDashboard);
router.get('/dashboard/hod', hod, hodDashboard);
router.get('/dashboard/dean', dean, deanDashboard);

// Catalog
router.get('/courses', courses.list);
router.post('/courses', admin, courses.create);
router.put('/courses/:id', admin, courses.update);
router.delete('/courses/:id', admin, courses.remove);

router.get('/semesters', semesters.list);
router.post('/semesters', admin, semesters.create);
router.put('/semesters/:id', admin, semesters.update);
router.delete('/semesters/:id', admin, semesters.remove);

router.get('/subjects', listSubjects);
router.post('/subjects', admin, subjects.create);
router.put('/subjects/:id', admin, subjects.update);
router.delete('/subjects/:id', admin, subjects.remove);

router.get('/exams', listExams);
router.post('/exams', admin, exams.create);
router.put('/exams/:id', admin, exams.update);
router.delete('/exams/:id', admin, exams.remove);

// People
router.get('/students', requireRole('admin', 'hod', 'dean'), listStudents);
router.get('/students/:id', requireRole('admin', 'dean'), getStudent);
router.post('/students', admin, createStudent);
router.put('/students/:id', admin, updateStudent);
router.delete('/students/:id', admin, removeStudent);

router.get('/faculty', requireRole('admin', 'hod', 'dean'), listFaculty);
router.get('/faculty/:id', requireRole('admin', 'dean'), getFaculty);
router.post('/faculty', admin, createFaculty);
router.put('/faculty/:id', admin, updateFaculty);
router.delete('/faculty/:id', admin, removeFaculty);

// Management
router.get('/departments', requireRole('admin', 'dean'), listDepartments);
router.get('/hods', requireRole('admin', 'dean'), hods.list);
router.post('/hods', admin, createHod);
router.put('/hods/:id', admin, updateHod);
router.delete('/hods/:id', admin, hods.remove);
router.get('/deans', admin, deans.list);
router.post('/deans', admin, createDean);
router.put('/deans/:id', admin, updateDean);
router.delete('/deans/:id', admin, deans.remove);

// Allotments & timetable
router.get('/allotments', listAllotments);
router.post('/allotments', admin, createAllotment);
router.delete('/allotments/:id', admin, removeAllotment);

router.get('/timetable', listTimetable);
router.get('/timetable/faculty', faculty, listFacultyTimetable);
router.post('/timetable', admin, createSlot);
router.delete('/timetable/:id', admin, removeSlot);

// Announcements
router.get('/announcements', listAnnouncements);
router.get('/announcements/:id', getAnnouncement);
router.post('/announcements', leadership, createAnnouncement);
router.put('/announcements/:id', leadership, updateAnnouncement);
router.delete('/announcements/:id', leadership, removeAnnouncement);

// Attendance
router.get('/attendance/students', faculty, studentsForSubject);
router.get('/attendance', listAttendance);
router.post('/attendance', faculty, submitAttendance);

// Assignments
router.get('/assignments/master', listMasterAssignments);
router.get('/assignments', listAssignments);
router.post('/assignments', faculty, createAssignment);
router.put('/assignments/:id', updateAssignment);
router.delete('/assignments/:id', faculty, removeAssignment);

// Notifications & events
router.get('/notifications', listNotifications);
router.post('/notifications', leadership, createNotification);
router.put('/notifications/:id/read', markRead);
router.delete('/notifications/:id', leadership, removeNotification);

router.get('/events', listEvents);
router.post('/events', leadership, createEvent);
router.put('/events/:id', leadership, updateEvent);
router.delete('/events/:id', leadership, removeEvent);

// Leave workflow
router.post('/leave-requests', requireRole('student', 'faculty', 'hod'), createLeave);
router.get('/leave-requests', listLeaves);
router.put('/leave-requests/:id/review', leadership, reviewLeave);

// Reports
router.get('/reports/attendance', requireRole('admin', 'hod', 'dean'), attendanceReport);

export default router;
