// HODs only see data belonging to their department (stored as courseId).
export function applyScope(req, res, next) {
  req.scopeFilter =
    req.user?.role === 'hod' ? { courseId: req.user.departmentId } : {};
  next();
}
