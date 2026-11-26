import Event from '../models/Event.js';
import { sendError } from '../utils/crud.js';

export async function listEvents(req, res) {
  try {
    const query = {
      $or: [{ audience: 'all' }, { audience: req.user.role }]
    };
    if (req.user.departmentId) query.$or.push({ departmentId: req.user.departmentId });
    res.json(await Event.find(query).sort({ date: 1 }).lean());
  } catch (error) {
    sendError(res, error, 'Could not fetch events');
  }
}

export async function createEvent(req, res) {
  try {
    const { title, date, description, time, location, audience = 'all', departmentId = '' } = req.body;
    if (!title || !date) return res.status(400).json({ message: 'title and date are required' });
    const doc = await Event.create({
      title, date: new Date(date), description, time, location,
      audience, departmentId, createdBy: req.user.identifier
    });
    res.status(201).json(doc);
  } catch (error) {
    sendError(res, error, 'Could not create event');
  }
}

export async function updateEvent(req, res) {
  try {
    const data = { ...req.body };
    if (data.date) data.date = new Date(data.date);
    const doc = await Event.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).lean();
    if (!doc) return res.status(404).json({ message: 'Event not found' });
    res.json(doc);
  } catch (error) {
    sendError(res, error, 'Could not update event');
  }
}

export async function removeEvent(req, res) {
  try {
    const doc = await Event.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    sendError(res, error, 'Could not delete event');
  }
}
