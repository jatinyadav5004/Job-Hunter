const User = require('../models/User');
const Application = require('../models/Application');
const EmailLog = require('../models/EmailLog');
const Resume = require('../models/Resume');

// @route   GET /api/admin/users
// Fetch all users with search, filtering and metrics
exports.getUsers = async (req, res) => {
  try {
    const { search = '', plan, status } = req.query;

    const query = {};

    if (search.trim()) {
      const s = search.trim();
      query.$or = [
        { email: new RegExp(s, 'i') },
        { name: new RegExp(s, 'i') },
      ];
    }

    if (plan && ['basic', 'pro'].includes(plan)) {
      query.plan = plan;
    }

    if (status === 'suspended') {
      query.$or = [{ isSuspended: true }, { status: 'suspended' }];
    } else if (status === 'deleted') {
      query.$or = [{ isDeleted: true }, { status: 'deleted' }];
    } else if (status === 'active') {
      query.isDeleted = { $ne: true };
      query.isSuspended = { $ne: true };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Aggregated platform metrics
    const totalCount = await User.countDocuments({});
    const proCount = await User.countDocuments({ plan: 'pro', isDeleted: { $ne: true }, isSuspended: { $ne: true } });
    const basicCount = await User.countDocuments({ plan: 'basic', isDeleted: { $ne: true }, isSuspended: { $ne: true } });
    const suspendedCount = await User.countDocuments({ $or: [{ isSuspended: true }, { status: 'suspended' }] });
    const deletedCount = await User.countDocuments({ $or: [{ isDeleted: true }, { status: 'deleted' }] });

    // Enrich users with application count & activity
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const applicationsCount = await Application.countDocuments({ userId: u._id });
        const emailsSent = await EmailLog.countDocuments({ userId: u._id, status: 'sent' });
        const resume = await Resume.findOne({ userId: u._id }).sort({ createdAt: -1 });

        return {
          ...u,
          role: u.role || 'user',
          isAdmin: u.role === 'admin',
          plan: u.role === 'admin' ? 'pro' : u.plan || 'basic',
          isSuspended: Boolean(u.isSuspended || u.status === 'suspended'),
          isDeleted: Boolean(u.isDeleted || u.status === 'deleted'),
          applicationsCount,
          emailsSent,
          hasResume: Boolean(resume),
          resumeTitle: resume?.parsedProfile?.title || 'No Resume',
        };
      })
    );

    res.json({
      success: true,
      metrics: {
        totalUsers: totalCount,
        proUsers: proCount,
        basicUsers: basicCount,
        suspendedUsers: suspendedCount,
        deletedUsers: deletedCount,
      },
      users: enrichedUsers,
    });
  } catch (error) {
    console.error('[Admin getUsers Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/admin/users/:id/plan
// Update a user's subscription plan and daily limits
exports.updateUserPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, dailyEmailLimit } = req.body;

    if (!['basic', 'pro'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Plan must be either "basic" or "pro"' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.plan = plan;
    if (dailyEmailLimit !== undefined && !isNaN(dailyEmailLimit)) {
      user.dailyEmailLimit = Number(dailyEmailLimit);
    } else {
      user.dailyEmailLimit = plan === 'pro' ? 50 : 5;
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${user.email} plan successfully updated to ${plan.toUpperCase()}`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        dailyEmailLimit: user.dailyEmailLimit,
      },
    });
  } catch (error) {
    console.error('[Admin updateUserPlan Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/admin/users/:id/role
// Update user role (grant or revoke admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be "user" or "admin"' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    if (role === 'admin') {
      user.plan = 'pro';
      user.dailyEmailLimit = 50;
    }
    await user.save();

    res.json({
      success: true,
      message: `User ${user.email} role updated to ${role.toUpperCase()}`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error('[Admin updateUserRole Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/admin/users/:id/suspend
// Suspend or unsuspend user account
exports.toggleSuspension = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Do not allow self-suspension
    if (user._id === req.user._id) {
      return res.status(400).json({ success: false, message: 'Cannot suspend your own administrator account' });
    }

    const isSuspendedNow = !(user.isSuspended || user.status === 'suspended');
    user.isSuspended = isSuspendedNow;
    user.status = isSuspendedNow ? 'suspended' : 'active';
    user.suspendedAt = isSuspendedNow ? new Date() : null;

    await user.save();

    res.json({
      success: true,
      message: isSuspendedNow
        ? `User ${user.email} has been SUSPENDED.`
        : `User ${user.email} has been REACTIVATED.`,
      user: {
        id: user._id,
        email: user.email,
        status: user.status,
        isSuspended: user.isSuspended,
      },
    });
  } catch (error) {
    console.error('[Admin toggleSuspension Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/admin/users/:id/soft-delete
// Soft delete or restore user
exports.toggleSoftDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Do not allow self-deletion
    if (user._id === req.user._id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own administrator account' });
    }

    const isDeletedNow = !(user.isDeleted || user.status === 'deleted');
    user.isDeleted = isDeletedNow;
    user.status = isDeletedNow ? 'deleted' : 'active';
    user.deletedAt = isDeletedNow ? new Date() : null;

    await user.save();

    res.json({
      success: true,
      message: isDeletedNow
        ? `User ${user.email} has been SOFT-DELETED.`
        : `User ${user.email} has been RESTORED.`,
      user: {
        id: user._id,
        email: user.email,
        status: user.status,
        isDeleted: user.isDeleted,
      },
    });
  } catch (error) {
    console.error('[Admin toggleSoftDelete Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/admin/users/:id/reset-preview
// Reset preview generation count
exports.resetPreviewLimit = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.aiGenerationsCount = 0;
    await user.save();

    res.json({
      success: true,
      message: `Preview quota reset for ${user.email}`,
      user: {
        id: user._id,
        email: user.email,
        aiGenerationsCount: user.aiGenerationsCount,
      },
    });
  } catch (error) {
    console.error('[Admin resetPreviewLimit Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
