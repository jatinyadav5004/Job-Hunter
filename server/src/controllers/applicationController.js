const Application = require('../models/Application');
const JobMatch = require('../models/JobMatch');

// @route   GET /api/applications
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate({
        path: 'jobId',
        populate: { path: 'recruiterId' },
      })
      .populate('emailLogId')
      .sort({ updatedAt: -1 });

    // Group by Kanban columns
    const columns = {
      shortlisted: [],
      applied: [],
      contacted: [],
      interview: [],
      offer: [],
      rejected: [],
    };

    applications.forEach(app => {
      if (columns[app.status]) {
        columns[app.status].push(app);
      }
    });

    res.json({
      success: true,
      count: applications.length,
      columns,
      applications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/applications
exports.createApplication = async (req, res) => {
  try {
    const { jobId, status, notes } = req.body;

    let app = await Application.findOne({ userId: req.user._id, jobId });
    if (app) {
      if (status) app.status = status;
      if (notes) app.notes = notes;
      await app.save();
    } else {
      app = await Application.create({
        userId: req.user._id,
        jobId,
        status: status || 'shortlisted',
        notes: notes || '',
        dateApplied: status === 'applied' ? new Date() : undefined,
      });
    }

    // Update match status as well
    if (status === 'applied') {
      await JobMatch.findOneAndUpdate(
        { userId: req.user._id, jobId },
        { status: 'applied' }
      );
    }

    res.status(201).json({ success: true, application: app });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/applications/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, notes, interviewRound, salaryOffered } = req.body;

    const updateFields = {};
    if (status) {
      updateFields.status = status;
      if (status === 'applied' && !updateFields.dateApplied) {
        updateFields.dateApplied = new Date();
      }
    }
    if (notes !== undefined) updateFields.notes = notes;
    if (salaryOffered) updateFields.salaryOffered = salaryOffered;

    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updateFields },
      { new: true }
    ).populate('jobId');

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // If interview added
    if (interviewRound) {
      app.interviews.push(interviewRound);
      await app.save();
    }

    res.json({ success: true, message: 'Application updated', application: app });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/applications/:id
exports.deleteApplication = async (req, res) => {
  try {
    const app = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, message: 'Application removed from tracker' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
