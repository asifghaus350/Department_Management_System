import jwt from 'jsonwebtoken';

const secret = () => process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(user) {
  // user: { id, role, identifier, name, departmentId }
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      identifier: user.identifier,
      name: user.name,
      departmentId: user.departmentId || ''
    },
    secret(),
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );
}

export function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    req.user = jwt.verify(token, secret());
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission for this action' });
    }
    next();
  };
}
