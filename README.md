# Department Management System (MERN)

A full-stack rewrite of the legacy Java JSP/Servlet + MySQL project using the MERN stack:

- **MongoDB** — document database (Mongoose ODM)
- **Express.js** — REST API with JWT authentication and role-based access
- **React** — SPA with Vite and React Router
- **Node.js** — runtime

## Features

| Role | Capabilities |
|---|---|
| Admin | Dashboard stats, manage students/faculty, courses/semesters/subjects, faculty subject allotments, timetable slots, announcements, appoint HODs & Deans, reports |
| Dean | University-wide dashboard, department overview with per-department stats, leave/OD approvals, reports, events, announcements |
| HOD | Department-scoped dashboard and people directory, leave/OD approvals, attendance reports (CSV export), events, announcements |
| Faculty | Profile, allotted subjects, timetable, two-step attendance marking, assignment creation with per-student fan-out, leave/OD requests, events |
| Student | Profile, subject-wise attendance, weekly timetable, announcements, today's faculty, assignments (answer + completion), exam schedule, leave/OD requests, events |

**Professional features** added on top of the core system:

- **Role hierarchy** — Dean → HOD → Faculty/Student, with JWT payload carrying department scope for HODs
- **Leave / OD workflow** — students and faculty submit requests; HODs and Deans approve or reject them
- **Notifications** — bell in the top bar with unread badge, per-role/per-department targeting, mark-as-read
- **Academic calendar** — role-targeted events with dates, time and venue; managed by leadership
- **Reports** — filterable attendance records with summary counts and CSV export
- **Self-service sign-up** — `/register` page where students (roll number) and faculty (faculty ID) create their own accounts, then sign in at `/login`
- **Profile settings** — editable contact details for every role
- **Data scoping** — HODs only see their own department's students, faculty, subjects, timetable and reports

Auth is stateless JWT stored in `localStorage`; passwords are hashed with bcrypt. All previous hardcoded data has been replaced with database collections and API-driven screens.

## Getting started

### Prerequisites
- Node.js 18+ (tested on Node 24)
- MongoDB running locally on port 27017 (or a MongoDB Atlas URI)

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment
Copy `server/.env.example` to `server/.env` and adjust if needed:
```
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/dms
JWT_SECRET=some-long-random-secret
JWT_EXPIRES=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed demo data (optional but recommended)
```bash
npm run seed
```
This creates the accounts below:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Dean | `DN1` | `dean123` |
| HOD | `HD1` | `hod123` |
| Student | `2023CS001` | `student123` |
| Faculty | `FT1` | `faculty123` |

Aap khud ka account bhi bana sakte hain: **http://localhost:5173/register** — student apne roll number se, faculty apne faculty ID se register karke phir login kar sakte hain.

### 4. Run
```bash
npm run dev
```
- Frontend: http://localhost:5173
- API: http://localhost:5001/api/health

For production: `npm run build` then `npm start` (serve `client/dist` with your static host / nginx).

## Project structure
```
server/
  src/
    config/       database connection
    controllers/  request handlers per domain
    middleware/   JWT auth + role guard
    models/       Mongoose schemas (12 collections)
    routes/       API routes
  scripts/seed.js demo data
client/
  src/
    api/          axios client + useFetch hook
    components/   layout, UI kit, timetable grid
    context/      auth state
    pages/        admin / student / faculty screens
    styles/       global CSS
```

## API overview
All endpoints are under `/api`. Public endpoints: `POST /api/auth/login`, `GET /api/register/options`, `POST /api/register/student`, `POST /api/register/faculty`. Everything else requires `Authorization: Bearer <token>`.

- `/auth` — login, current user, change password
- `/dashboard/admin|student|faculty` — aggregated role dashboards
- `/courses`, `/semesters`, `/subjects`, `/exams` — catalog (admin writes)
- `/students`, `/faculty` — people (admin)
- `/allotments` — faculty-subject mapping
- `/timetable` — class schedule (admin writes, `/timetable/faculty` for faculty)
- `/announcements` — notices
- `/attendance` — students for a subject, save attendance (faculty), own records (student)
- `/assignments` — student submissions, `/assignments/master` for faculty-created assignments
- `/notifications`, `/events` — targeted notices and academic calendar
- `/leave-requests`, `/reports/attendance`, `/profile` — approval workflow, reports, self-service profile
- `/departments`, `/hods`, `/deans` — university leadership and structure
