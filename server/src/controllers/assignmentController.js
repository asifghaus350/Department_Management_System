import mongoose from 'mongoose';
import Assignment from '../models/Assignment.js';
import FacultyAssignment from '../models/FacultyAssignment.js';
import Subject from '../models/Subject.js';
import Student from '../models/Student.js';
import { sendError } from '../utils/crud.js';

export async function listAssignments(req, res) {
  try {
    if (req.user.role === 'student') {
      const rows = await Assignment.find({ rollno: req.user.identifier })
        .sort({ dueDate: 1, createdAt: -1 })
        .lean();
      return res.json(rows);
    }
    if (req.user.role === 'faculty') {
      const master = await FacultyAssignment.find({ createdBy: req.user.identifier })
        .select('_id -_id')
        .lean();
      const ids = master.map((m) => m._id);
      const rows = await Assignment.find({ facultyAssignmentId: { $in: ids } })
        .sort({ createdAt: -1 })
        .lean();
      return res.json(rows);
    }
    res.json(await Assignment.find().sort({ createdAt: -1 }).lean());
  } catch (error) {
    sendError(res, error, 'Could not fetch assignments');
  }
}

export async function listMasterAssignments(req, res) {
  try {
    const query = req.user.role === 'faculty' ? { createdBy: req.user.identifier } : {};
    res.json(await FacultyAssignment.find(query).sort({ createdAt: -1 }).lean());
  } catch (error) {
    sendError(res, error, 'Could not fetch assignments');
  }
}

export async function createAssignment(req, res) {
  try {
    const { subjectId, assignmentName, description, dueDate } = req.body;
    if (!subjectId || !assignmentName) {
      return res.status(400).json({ message: 'subjectId and assignmentName are required' });
    }
    const subject = await Subject.findOne({ subjectId }).lean();
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const master = await FacultyAssignment.create({
      semesterId: subject.semesterId,
      subjectId,
      assignmentName,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: req.user.role === 'faculty' ? req.user.identifier : undefined
    });

    const students = await Student.find({ semesterId: subject.semesterId })
      .select('rollno -_id')
      .lean();
    if (students.length) {
      await Assignment.insertMany(
        students.map((student) => ({
          facultyAssignmentId: master._id,
          semesterId: subject.semesterId,
          rollno: student.rollno,
          subjectId,
          assignmentName,
          description,
          dueDate: master.dueDate,
          answer: '',
          completionStatus: 'Incomplete'
        }))
      );
    }

    res.status(201).json({ ...master.toObject(), studentsAssigned: students.length });
  } catch (error) {
    sendError(res, error, 'Could not create assignment');
  }
}

export async function updateAssignment(req, res) {
  try {
    const { answer, completionStatus } = req.body;
    const query = { _id: req.params.id };
    if (req.user.role === 'student') query.rollno = req.user.identifier;
    const doc = await Assignment.findOneAndUpdate(
      query,
      {
        ...(answer !== undefined ? { answer } : {}),
        ...(completionStatus !== undefined ? { completionStatus } : {})
      },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: 'Assignment not found' });
    res.json(doc);
  } catch (error) {
    sendError(res, error, 'Could not update assignment');
  }
}

export async function removeAssignment(req, res) {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);
    await FacultyAssignment.findByIdAndDelete(id);
    await Assignment.deleteMany({ facultyAssignmentId: id });
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    sendError(res, error, 'Could not delete assignment');
  }
}
