import Announcement from '../models/Announcement.js';
import { crudHandlers, sendError } from '../utils/crud.js';

export const { get: getAnnouncement, update: updateAnnouncement, remove: removeAnnouncement } =
  crudHandlers(Announcement, 'content');

export async function listAnnouncements(req, res) {
  try {
    res.json(await Announcement.find().sort({ date: -1, createdAt: -1 }).lean());
  } catch (error) {
    sendError(res, error, 'Could not fetch announcements');
  }
}

export async function createAnnouncement(req, res) {
  try {
    const { title, content, courseId, date } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });
    const doc = await Announcement.create({
      title,
      content,
      courseId,
      date: date ? new Date(date) : new Date()
    });
    res.status(201).json(doc);
  } catch (error) {
    sendError(res, error, 'Could not create announcement');
  }
}
