import { useState } from 'react';
import { Card, Empty } from './UI';

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function TimetableGrid({ slots = [], title = 'Time table' }) {
  const [index, setIndex] = useState(new Date().getDay());
  const day = DAYS[index];
  const rows = slots.filter((slot) => slot.day === day).sort((a, b) => a.time.localeCompare(b.time));

  const move = (step) => setIndex((value) => (value + step + 7) % 7);

  return (
    <Card className="timetable-card">
      <div className="timetable-head">
        <button className="icon-btn" onClick={() => move(-1)} aria-label="Previous day">‹</button>
        <h2>{title} — {day.charAt(0) + day.slice(1).toLowerCase()}</h2>
        <button className="icon-btn" onClick={() => move(1)} aria-label="Next day">›</button>
      </div>
      {rows.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Time</th><th>Subject</th><th>Room</th><th>Semester</th></tr>
            </thead>
            <tbody>
              {rows.map((slot) => (
                <tr key={slot._id}>
                  <td>{slot.time}</td>
                  <td>{slot.subjectName || slot.subjectId || '—'}</td>
                  <td>{slot.roomno || '—'}</td>
                  <td>{slot.semesterId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty message={`No classes scheduled for ${day.toLowerCase()}`} />}
    </Card>
  );
}
