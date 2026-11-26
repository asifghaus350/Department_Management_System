export function sendError(res, error, fallback = 'Operation failed') {
  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with this ID already exists' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(error.errors).map((e) => e.message).join(', ')
    });
  }
  console.error(error);
  return res.status(500).json({ message: fallback });
}

export function crudHandlers(Model, naturalKey) {
  return {
    list: async (req, res) => {
      try {
        res.json(await Model.find(req.scopeFilter || {}).sort({ createdAt: -1 }).lean());
      } catch (error) {
        sendError(res, error, 'Could not fetch records');
      }
    },
    get: async (req, res) => {
      try {
        const doc = await Model.findById(req.params.id).lean();
        if (!doc) return res.status(404).json({ message: 'Record not found' });
        res.json(doc);
      } catch (error) {
        sendError(res, error, 'Could not fetch record');
      }
    },
    create: async (req, res) => {
      try {
        if (!req.body[naturalKey]) {
          return res.status(400).json({ message: `${naturalKey} is required` });
        }
        const doc = await Model.create(req.body);
        res.status(201).json(doc);
      } catch (error) {
        sendError(res, error, 'Could not create record');
      }
    },
    update: async (req, res) => {
      try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        }).lean();
        if (!doc) return res.status(404).json({ message: 'Record not found' });
        res.json(doc);
      } catch (error) {
        sendError(res, error, 'Could not update record');
      }
    },
    remove: async (req, res) => {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: 'Record deleted' });
      } catch (error) {
        sendError(res, error, 'Could not delete record');
      }
    }
  };
}
