# Department Management System (MERN)

A modern full-stack rewrite of the legacy Java JSP/Servlet + MySQL project.

| Layer | Technology |
|---|---|
| Database | **MongoDB** with Mongoose ODM |
| Backend | **Express.js** REST API, JWT auth, bcrypt passwords, role guards |
| Frontend | **React 18** + Vite + React Router + Axios |
| Runtime | **Node.js** 18+ (tested on Node 24) |

---

## Features

### Role-based portal

| Role | Capabilities |
|---|---|
| **Admin** | Dashboard stats, manage students/faculty, courses/semesters/subjects, faculty subject allotments, timetable slots, announcements, appoint HODs & Deans, reports |
| **Dean** | University-wide dashboard, department overview with per-department stats, leave/OD approvals, reports, events, announcements |
| **HOD** | Department-scoped dashboard and people directory, leave/OD approvals, attendance reports (CSV export), events, announcements |
| **Faculty** | Profile, allotted subjects, timetable, two-step attendance marking, assignment creation with per-student fan-out, leave/OD requests, events |
| **Student** | Profile, subject-wise attendance, weekly timetable, announcements, today's faculty, assignments (answer + completion), exam schedule, leave/OD requests, events |

### Professional workflows

- **Role hierarchy** — Dean → HOD → Faculty/Student. The JWT carries a `departmentId` so HODs only see their own department.
- **Self-service sign-up** — `/register` lets students (roll number) and faculty (faculty ID) create accounts, then sign in at `/login`.
- **Leave / OD workflow** — students and faculty submit requests; HODs and Deans approve or reject them.
- **Notifications** — top-bar bell with unread badge, role/department targeting, mark-as-read, popover closes on outside click or route change.
- **Academic calendar** — role-targeted events with date, time and venue; managed by leadership.
- **Reports** — filterable attendance records with summary counts and CSV export.
- **Profile settings** — editable contact details for every role.

### Student dashboard UI

- Greeting with current date and a profile hero card
- Quick stats: average attendance, pending assignments, upcoming exams, classes today
- Color-coded attendance rings (green ≥ 75%, amber ≥ 40%, red < 40%) with progress bars
- Subjects without sessions are shown as a small note instead of empty 0% cards
- Weekly timetable with day pills, "Today" badge and full subject names
- Announcements, today's faculty (with subject chips), upcoming events and next exams

---

## Getting started

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment
Copy `server/.env.example` to `server/.env` and adjust if needed:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/dms
JWT_SECRET=some-long-random-secret
JWT_EXPIRES=7d
CLIENT_URL=http://localhost:5173
```

> `server/.env` is git-ignored — secrets never reach GitHub. If ports `5000`/`5173` are busy on your machine, change `PORT` here and the proxy target in `client/vite.config.js`.

### 3. Seed demo data (optional but recommended)
```bash
npm run seed
```

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Dean | `DN1` | `dean123` |
| HOD | `HD1` | `hod123` |
| Student | `2023CS001` | `student123` |
| Faculty | `FT1` | `faculty123` |

You can also create your own account at **http://localhost:5173/register** — students with a roll number, faculty with a faculty ID.

### 4. Run
```bash
npm run dev
```

- Frontend: http://localhost:5173
- API health: http://localhost:5001/api/health

For production: `npm run build`, then `npm start` (serve `client/dist` with your static host / nginx).

---

## Project structure

```
server/
  src/
    config/       database connection
    controllers/  request handlers per domain (18 Mongoose models)
    middleware/   JWT auth, role guards, department scoping
    models/       Mongoose schemas
    routes/       API routes
  scripts/seed.js demo data
client/
  src/
    api/          axios client + useFetch hook
    components/   layout, UI kit, timetable grid, notification bell
    context/      auth state
    pages/        admin / dean / hod / faculty / student + shared pages
    styles/       global CSS (light + dark theme)
```

---

## API overview

All endpoints are under `/api`.

**Public:** `POST /api/auth/login`, `GET /api/register/options`, `POST /api/register/student`, `POST /api/register/faculty`

Everything else requires `Authorization: Bearer <token>`.

- `/auth` — login, current user, change password
- `/profile` — view/update own profile
- `/dashboard/admin|student|faculty|hod|dean` — aggregated role dashboards
- `/courses`, `/semesters`, `/subjects`, `/exams` — catalog (admin writes)
- `/students`, `/faculty` — people (admin writes; HOD/Dean read)
- `/allotments` — faculty–subject mapping
- `/timetable` — class schedule (`/timetable/faculty` for faculty)
- `/announcements` — notices
- `/attendance` — student list for a subject, save attendance, own records
- `/assignments` — student submissions; `/assignments/master` for faculty
- `/notifications`, `/events` — targeted notices and academic calendar
- `/leave-requests`, `/reports/attendance` — approval workflow and reports
- `/departments`, `/hods`, `/deans` — university leadership and structure

---

## Verification

- Production build: ✅ `npm run build`
- Core API smoke tests: **27/27 passed**
- Roles / workflows API tests: **35/35 passed**
- Registration API tests: **9/9 passed**
- Browser checks: all role dashboards and pages render with zero console errors; signup → login → dashboard verified for both student and faculty.

---

## Notes

- Passwords are stored as bcrypt hashes; no credentials are hardcoded in the source (the legacy `root` / MySQL password is gone).
- Original JSP/Servlet code was intentionally removed in favour of the MERN implementation.
- The database is seeded with realistic demo data (courses, semesters, subjects, faculty, students, attendance, assignments, exams, events, notices and leave requests).
