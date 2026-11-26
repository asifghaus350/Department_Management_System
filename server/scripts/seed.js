import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Admin from '../src/models/Admin.js';
import Student from '../src/models/Student.js';
import Faculty from '../src/models/Faculty.js';
import Course from '../src/models/Course.js';
import Semester from '../src/models/Semester.js';
import Subject from '../src/models/Subject.js';
import FacultySubject from '../src/models/FacultySubject.js';
import Timetable from '../src/models/Timetable.js';
import Attendance from '../src/models/Attendance.js';
import Announcement from '../src/models/Announcement.js';
import FacultyAssignment from '../src/models/FacultyAssignment.js';
import Assignment from '../src/models/Assignment.js';
import Exam from '../src/models/Exam.js';
import Hod from '../src/models/Hod.js';
import Dean from '../src/models/Dean.js';
import Notification from '../src/models/Notification.js';
import Event from '../src/models/Event.js';
import LeaveRequest from '../src/models/LeaveRequest.js';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dms';
const hash = (value) => bcrypt.hash(value, 10);
const date = (value) => new Date(`${value}T00:00:00.000Z`);

async function seed() {
  await mongoose.connect(uri);
  const collections = [
    Admin, Student, Faculty, Course, Semester, Subject, FacultySubject,
    Timetable, Attendance, Announcement, FacultyAssignment, Assignment, Exam,
    Hod, Dean, Notification, Event, LeaveRequest
  ];
  await Promise.all(collections.map((model) => model.deleteMany({})));
  console.log('Cleared existing data');

  // --- Admin ---
  await Admin.create({ username: 'admin', password: await hash('admin123'), name: 'Administrator', phone: '9990000000' });
  await Hod.create({
    hodId: 'HD1', password: await hash('hod123'), name: 'Dr. Nadia Rahman',
    email: 'nadia.rahman@manuu.edu.in', phone: '9990000001', departmentId: 'CS',
    qualification: 'Ph.D', address: 'Hyderabad'
  });
  await Dean.create({
    deanId: 'DN1', password: await hash('dean123'), name: 'Prof. A. H. Siddiqui',
    email: 'dean@manuu.edu.in', phone: '9990000002', qualification: 'Ph.D',
    address: 'Hyderabad'
  });

  // --- Courses & semesters ---
  await Course.create([
    { courseId: 'CS', name: 'Computer Science & Engineering' },
    { courseId: 'EC', name: 'Electronics & Communication' }
  ]);
  await Semester.create(
    Array.from({ length: 8 }, (_, i) => ({
      semesterId: `BT${i + 1}`,
      name: `Semester ${i + 1}`,
      courseId: 'CS'
    }))
  );

  // --- Subjects ---
  await Subject.create([
    { subjectId: 'BTCS111EST', name: 'Mathematics I', semesterId: 'BT1' },
    { subjectId: 'BTCS101BST', name: 'Physics', semesterId: 'BT1' },
    { subjectId: 'BTCS112PCT', name: 'Programming in C', semesterId: 'BT1' },
    { subjectId: 'BTCS211PCT', name: 'Data Structures', semesterId: 'BT2' },
    { subjectId: 'BTCS311PCT', name: 'Database Systems', semesterId: 'BT3' },
    { subjectId: 'BTCS412PCT', name: 'Operating Systems', semesterId: 'BT4' },
    { subjectId: 'BTCS511EST', name: 'Machine Learning', semesterId: 'BT5' },
    { subjectId: 'BTCS612PCT', name: 'Distributed Systems', semesterId: 'BT6' }
  ]);

  // --- Faculty ---
  await Faculty.create([
    {
      facultyId: 'FT1', password: await hash('faculty123'), name: 'Khaleda Afroaz', departmentId: 'CS',
      email: 'khaledaafroaz@manuu.edu.in', qualification: 'Ph.D',
      address: 'Hyderabad', researchInterest: 'Data Mining, Machine Learning, Artificial Intelligence'
    },
    {
      facultyId: 'FT2', password: await hash('faculty123'), name: 'Khalid Ahmed', departmentId: 'CS',
      email: 'khalid.ahmed@manuu.edu.in', qualification: 'M.Tech',
      address: 'Hyderabad', researchInterest: 'Networks, Operating Systems'
    },
    {
      facultyId: 'FT3', password: await hash('faculty123'), name: 'Priya Sharma', departmentId: 'CS',
      email: 'priya.sharma@manuu.edu.in', qualification: 'Ph.D',
      address: 'Hyderabad', researchInterest: 'Databases, Information Retrieval'
    }
  ]);

  // --- Students ---
  const studentNames = ['Asif Khan', 'Ayesha Siddiqua', 'Rahul Verma', 'Sana Fatima', 'Imran Ali', 'Meera Nair'];
  const studentPassword = await hash('student123');
  await Student.create(
    studentNames.map((name, i) => ({
      rollno: `2023CS00${i + 1}`,
      enroll: `ENR2023${String(i + 1).padStart(3, '0')}`,
      password: studentPassword,
      name,
      email: `student${i + 1}@manuu.edu.in`,
      courseId: 'CS',
      semesterId: 'BT1',
      dob: date(`200${i % 3}-0${(i % 9) + 1}-1${i % 9}`),
      address: 'Hyderabad, Telangana'
    }))
  );

  // --- Faculty subject allotments ---
  await FacultySubject.create([
    { facultyId: 'FT1', subjectId: 'BTCS111EST', semesterId: 'BT1', courseId: 'CS' },
    { facultyId: 'FT1', subjectId: 'BTCS101BST', semesterId: 'BT1', courseId: 'CS' },
    { facultyId: 'FT2', subjectId: 'BTCS112PCT', semesterId: 'BT1', courseId: 'CS' },
    { facultyId: 'FT2', subjectId: 'BTCS211PCT', semesterId: 'BT2', courseId: 'CS' },
    { facultyId: 'FT3', subjectId: 'BTCS311PCT', semesterId: 'BT3', courseId: 'CS' }
  ]);

  // --- Timetable (fixed day casing) ---
  const slots = [];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
  const weekSubjects = ['BTCS111EST', 'BTCS101BST', 'BTCS112PCT'];
  ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].forEach((day, d) => {
    slots.push({
      semesterId: 'BT1', day, time: times[0], roomno: `F${20 + d}`,
      courseId: 'CS', subjectId: weekSubjects[d % weekSubjects.length]
    });
    slots.push({
      semesterId: 'BT1', day, time: times[1], roomno: `F${25 + d}`,
      courseId: 'CS', subjectId: weekSubjects[(d + 1) % weekSubjects.length]
    });
  });
  await Timetable.create(slots);

  // --- Attendance for the last 10 weekdays ---
  const attendance = [];
  const rollnos = studentNames.map((_, i) => `2023CS00${i + 1}`);
  for (let i = 0; i < 10; i++) {
    const day = new Date();
    day.setUTCDate(day.getUTCDate() - i);
    if ([0, 6].includes(day.getUTCDay())) continue;
    const attendanceDate = new Date(day.toISOString().slice(0, 10) + 'T00:00:00.000Z');
    rollnos.forEach((rollno, index) => {
      attendance.push({
        facultyId: 'FT1', rollno, semesterId: 'BT1', subjectId: 'BTCS111EST',
        attendanceDate,
        status: (index + i) % 7 === 0 ? 'Absent' : 'Present'
      });
    });
  }
  await Attendance.create(attendance);

  // --- Announcements ---
  await Announcement.create([
    { title: 'Mid semester test', content: 'Mid semester tests will begin from 15th December. Check the exam schedule.', courseId: 'CS', date: date('2026-11-20') },
    { title: 'Assignment deadline', content: 'All pending assignments must be submitted before the end of this week.', courseId: 'CS', date: date('2026-11-18') },
    { title: 'Guest lecture', content: 'Guest lecture on Artificial Intelligence by Dr. Khaleda Afroaz on Friday.', courseId: 'CS', date: date('2026-11-15') }
  ]);

  // --- Assignment fan-out ---
  const master = await FacultyAssignment.create({
    semesterId: 'BT1', subjectId: 'BTCS111EST', assignmentName: 'Assignment 1 – Matrices',
    description: 'Solve all questions from unit 1 and submit in class.',
    dueDate: date('2026-12-05'), createdBy: 'FT1'
  });
  await Assignment.create(
    rollnos.map((rollno, i) => ({
      facultyAssignmentId: master._id, semesterId: 'BT1', rollno,
      subjectId: 'BTCS111EST', assignmentName: master.assignmentName,
      description: master.description, dueDate: master.dueDate,
      answer: i === 0 ? 'Solutions uploaded.' : '',
      completionStatus: i === 0 ? 'Complete' : 'Incomplete'
    }))
  );

  // --- Exams (replaces the hardcoded table) ---
  await Exam.create([
    { subjectId: 'BTCS111EST', subjectName: 'Mathematics I', date: date('2026-12-03'), time: '09:00 – 12:00 AM', room: 'F24' },
    { subjectId: 'BTCS412PCT', subjectName: 'Operating Systems', date: date('2026-12-07'), time: '09:00 – 12:00 AM', room: 'F25' },
    { subjectId: 'BTCS101BST', subjectName: 'Physics', date: date('2026-12-12'), time: '09:00 – 12:00 AM', room: 'F24' },
    { subjectId: 'BTCS612PCT', subjectName: 'Distributed Systems', date: date('2026-12-14'), time: '09:00 – 12:00 AM', room: 'F25' },
    { subjectId: 'BTCS511EST', subjectName: 'Machine Learning', date: date('2026-12-18'), time: '09:00 – 12:00 AM', room: 'F24' }
  ]);

  // --- Notifications ---
  await Notification.create([
    { title: 'Welcome to the new portal', message: 'The Department Management System is now live for all users.', audience: 'all', createdBy: 'admin' },
    { title: 'Faculty meeting', message: 'Faculty meeting at 3:00 PM in the conference room.', audience: 'faculty', departmentId: 'CS', createdBy: 'HD1' },
    { title: 'Semester fee reminder', message: 'Please complete your fee payment before the due date.', audience: 'student', createdBy: 'DN1' }
  ]);

  // --- Academic calendar ---
  await Event.create([
    { title: 'Mid semester examinations', description: 'Written tests for all first-year subjects.', date: date('2026-12-15'), time: '09:00 AM', location: 'Exam Hall A', audience: 'all' },
    { title: 'Guest lecture: AI in Education', description: 'By Dr. Khaleda Afroaz, Department of CSE.', date: date('2026-12-04'), time: '11:00 AM', location: 'Seminar Hall', audience: 'student', departmentId: 'CS' },
    { title: 'Board of Studies meeting', description: 'Curriculum review for the next academic year.', date: date('2026-12-10'), time: '02:00 PM', location: 'Conference Room', audience: 'hod' },
    { title: 'Annual sports day', description: 'Inter-department sports competition.', date: date('2026-12-20'), time: '08:00 AM', location: 'Ground', audience: 'all' }
  ]);

  // --- Leave / OD requests ---
  await LeaveRequest.create([
    {
      applicantId: '2023CS001', applicantName: 'Asif Khan', role: 'student', departmentId: 'CS',
      type: 'Leave', fromDate: date('2026-12-01'), toDate: date('2026-12-03'),
      reason: 'Family function', status: 'Pending'
    },
    {
      applicantId: 'FT2', applicantName: 'Khalid Ahmed', role: 'faculty', departmentId: 'CS',
      type: 'OD', fromDate: date('2026-12-05'), toDate: date('2026-12-05'),
      reason: 'Conference presentation', status: 'Pending'
    },
    {
      applicantId: '2023CS003', applicantName: 'Rahul Verma', role: 'student', departmentId: 'CS',
      type: 'Permission', fromDate: date('2026-11-28'), toDate: date('2026-11-28'),
      reason: 'Medical appointment', status: 'Approved', reviewedBy: 'HD1', reviewedAt: date('2026-11-25'), remark: 'Approved'
    }
  ]);

  console.log('Seed complete');
  console.log('Accounts — admin/admin123 | hod/HD1/hod123 | dean/DN1/dean123');
  console.log('           student/2023CS001/student123 | faculty/FT1/faculty123');
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
