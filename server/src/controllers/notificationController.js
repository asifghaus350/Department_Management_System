import Notification from '../models/Notification.js';
import { sendError } from '../utils/crud.js';

const visible = (rows, user) =>
  rows.map((row) => ({
    ...row,
    read: row.reads.some((r) => r.user === user.identifier && r.role === user.role)
  }));

export async function listNotifications(req, res) {
  try {
    const query = {
      $or: [
        { audience: 'all' },
        { audience: req.user.role }
      ]
    };
    if (req.user.departmentId) {
      query.$or.push({ departmentId: req.user.departmentId });
    }
    const rows = await Notification.find(query).sort({ createdAt: -1 }).limit(50).lean();
    res.json(visible(rows, req.user));
  } catch (error) {
    sendError(res, error, 'Could not fetch notifications');
  }
}

export async function createNotification(req, res) {
  try {
    const { title, message, audience = 'all', departmentId = '' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'title and message are required' });
    }
    const doc = await Notification.create({
      title,
      message,
      audience,
      departmentId,
      createdBy: req.user.identifier
    });
    res.status(201).json({ ...doc.toObject(), read: false });
  } catch (error) {
    sendError(res, error, 'Could not create notification');
  }
}

export async function markRead(req, res) {
  try {
    const doc = await Notification.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Notification not found' });
    const exists = doc.reads.some((r) => r.user === req.user.identifier && r.role === req.user.role);
    if (!exists) {
      doc.reads.push({ user: req.user.identifier, role: req.user.role });
      await doc.save();
    }
    res.json({ message: 'Marked as read' });
  } catch (error) {
    sendError(res, error, 'Could not mark notification');
  }
}

export async function removeNotification(req, res) {
  try {
    const doc = await Notification.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    sendError(res, error, 'Could not delete notification');
  }
}
