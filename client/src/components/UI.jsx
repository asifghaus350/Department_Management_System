export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Loading() {
  return (
    <div className="state-box">
      <span className="spinner" />
      <p>Loading…</p>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="state-box error">
      <p>{message || 'Something went wrong'}</p>
      {onRetry && <button className="btn ghost" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Empty({ message = 'Nothing to show yet' }) {
  return <div className="state-box muted"><p>{message}</p></div>;
}

export function Alert({ type = 'success', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert ${type}`}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} aria-label="Dismiss">×</button>}
    </div>
  );
}

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function StatCard({ label, value, hint, tone = 'primary' }) {
  return (
    <Card className={`stat-card ${tone}`}>
      <span className="stat-label">{label}</span>
      <strong>{value ?? '—'}</strong>
      {hint && <small>{hint}</small>}
    </Card>
  );
}

export function Modal({ title, children, onClose, width = 520 }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" style={{ maxWidth: width }} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div className="modal confirm" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-body">
          <h3>Are you sure?</h3>
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export function DataTable({ columns, rows, empty = 'No records found' }) {
  if (!rows?.length) return <Empty message={empty} />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row._id || index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : row[column.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
