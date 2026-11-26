import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';

import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Faculty from './pages/admin/Faculty';
import Courses from './pages/admin/Courses';
import AdminTimetable from './pages/admin/Timetable';
import Announcements from './pages/admin/Announcements';
import Management from './pages/admin/Management';

import StudentDashboard from './pages/student/Dashboard';
import StudentTimetable from './pages/student/Timetable';
import Assignments from './pages/student/Assignments';
import Exams from './pages/student/Exams';

import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyAttendance from './pages/faculty/Attendance';
import FacultyAssignments from './pages/faculty/Assignments';
import FacultyTimetable from './pages/faculty/Timetable';

import HodDashboard from './pages/hod/Dashboard';
import HodPeople from './pages/hod/People';
import DeanDashboard from './pages/dean/Dashboard';
import Departments from './pages/dean/Departments';

import Events from './pages/Events';
import LeaveRequests from './pages/LeaveRequests';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

const commonRoutes = [
  <Route key="profile" path="profile" element={<Profile />} />,
  <Route key="notifications" path="notifications" element={<Notifications />} />
];

function Home() {
  const { user } = useAuth();
  return <Navigate to={user ? `/${user.role}` : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout role="admin" /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="faculty" element={<Faculty />} />
        <Route path="courses" element={<Courses />} />
        <Route path="timetable" element={<AdminTimetable />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="management" element={<Management />} />
        <Route path="reports" element={<Reports />} />
        <Route path="events" element={<Events />} />
        {commonRoutes}
      </Route>

      <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout role="student" /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="exams" element={<Exams />} />
        <Route path="leave" element={<LeaveRequests />} />
        <Route path="events" element={<Events />} />
        {commonRoutes}
      </Route>

      <Route path="/faculty" element={<ProtectedRoute roles={['faculty']}><Layout role="faculty" /></ProtectedRoute>}>
        <Route index element={<FacultyDashboard />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="assignments" element={<FacultyAssignments />} />
        <Route path="timetable" element={<FacultyTimetable />} />
        <Route path="leave" element={<LeaveRequests />} />
        <Route path="events" element={<Events />} />
        {commonRoutes}
      </Route>

      <Route path="/hod" element={<ProtectedRoute roles={['hod']}><Layout role="hod" /></ProtectedRoute>}>
        <Route index element={<HodDashboard />} />
        <Route path="people" element={<HodPeople />} />
        <Route path="leave" element={<LeaveRequests />} />
        <Route path="reports" element={<Reports />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="events" element={<Events />} />
        {commonRoutes}
      </Route>

      <Route path="/dean" element={<ProtectedRoute roles={['dean']}><Layout role="dean" /></ProtectedRoute>}>
        <Route index element={<DeanDashboard />} />
        <Route path="departments" element={<Departments />} />
        <Route path="leave" element={<LeaveRequests />} />
        <Route path="reports" element={<Reports />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="events" element={<Events />} />
        {commonRoutes}
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
