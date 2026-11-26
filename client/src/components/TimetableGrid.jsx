import { useState } from 'react';
import { Card, Empty } from './UI';

const DAYS = [
  { key: 'SUNDAY', short: 'Sun' }, { key: 'MONDAY', short: 'Mon' },
  { key: 'TUESDAY', short: 'Tue' }, { key: 'WEDNESDAY', short: 'Wed' },
  { key: 'THURSDAY', short: 'Thu' }, { key: 'FRIDAY', short: 'Fri' },
  { key: 'SATURDAY', short: 'Sat' }
];

export default function TimetableGrid({ slots = [], title = 'Time table' }) {
  const todayIndex = new Date().getDay();
  const [index, setIndex] = useState(todayIndex);
  const day = DAYS[index].key;
  const rows = slots
    .filter((slot) => slot.day === day)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Card className="timetable-card">
      <div className="timetable-head">
        <div>
          <h2>{title}</h2>
          <small>Select a day to view classes</small>
        </div>
        {index === todayIndex && <span className="badge primary">Today</span>}
      </div>

      <div className="day-pills">
        {DAYS.map((item, i) => (
          <button
            key={item.key}
            className={`day-pill ${i === index ? 'active' : ''} ${i === todayIndex ? 'is-today' : ''}`}
            onClick={() => setIndex(i)}
          >
            {item.short}
          </button>
        ))}
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
                  <td><strong>{slot.time}</strong></td>
                  <td>{slot.subjectName || slot.subjectId || '—'}</td>
                  <td>{slot.roomno || '—'}</td>
                  <td>{slot.semesterId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty message={`No classes scheduled for ${DAYS[index].short}`} />
      )}
    </Card>
  );
}
