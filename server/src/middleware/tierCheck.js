// Middleware to restrict endpoints to PRO plan subscribers or Admin users
exports.requirePro = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // Admins always have unrestricted full PRO access
  if (req.user.role === 'admin') {
    return next();
  }

  const userPlan = req.user.plan || 'basic';
  if (userPlan !== 'pro') {
    return res.status(403).json({
      success: false,
      isProRequired: true,
      message: 'PRO Plan required. Contact administrator to activate PRO access.',
    });
  }

  next();
};
