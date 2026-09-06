const Resume = require('../models/Resume');
const Job = require('../models/Job');
const Recruiter = require('../models/Recruiter');
const EmailLog = require('../models/EmailLog');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');

// @route   POST /api/cold-email/generate
exports.generateEmail = async (req, res) => {
  try {
    const { jobId, customJobTitle, customCompany, recruiterName, recruiterEmail, context } = req.body;

    // 1. Fetch user's active resume
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const candidateProfile = resume?.parsedProfile || {
      name: req.user.name,
      yearsOfExperience: 1,
      skills: [],
    };

    // 2. Fetch Job details or use custom fields
    let job = {
      title: customJobTitle || candidateProfile.title || 'Open Position',
      company: customCompany || 'Hiring Organization',
      description: 'Position opportunity.',
      skills: candidateProfile.skills || [],
    };

    if (jobId) {
      const foundJob = await Job.findById(jobId).populate('recruiterId');
      if (foundJob) {
        job = foundJob;
      }
    }

    // 3. Recruiter info
    const recruiter = {
      name: recruiterName || (job.recruiterId ? job.recruiterId.name : 'Hiring Team'),
      email: recruiterEmail || (job.recruiterId ? job.recruiterId.email : ''),
    };

    // Check user tier & quota (Basic plan is restricted to strictly 1 preview)
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    const userEmail = (req.user.email || req.user._id || '').toLowerCase();
    const isPro = adminEmails.includes(userEmail) || req.user.plan === 'pro';

    const User = require('../models/User');
    const userDoc = await User.findById(req.user._id);

    if (!isPro && userDoc && (userDoc.aiGenerationsCount || 0) >= 1) {
      return res.status(403).json({
        success: false,
        isProRequired: true,
        limitReached: true,
        message:
          'Basic plan is limited to 1 AI Cold Email preview. Upgrade to PRO for unlimited AI generations and mass outreach.',
      });
    }

    // 4. Generate AI Email with normal & short versions
    const emailResult = await aiService.generateColdEmail({
      candidateProfile,
      job,
      recruiter,
      context,
    });

    // Increment preview count for basic users
    if (!isPro && userDoc) {
      userDoc.aiGenerationsCount = (userDoc.aiGenerationsCount || 0) + 1;
      await userDoc.save();
    }

    res.json({
      success: true,
      data: {
        subject: emailResult.subject,
        normalVersion: emailResult.normalVersion,
        shortVersion: emailResult.shortVersion,
        recruiter,
        isPro,
        generationsRemaining: isPro ? 'unlimited' : Math.max(0, 1 - (userDoc?.aiGenerationsCount || 1)),
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/cold-email/send
exports.sendEmail = async (req, res) => {
  try {
    const {
      jobId,
      senderEmail,
      senderName,
      recipientEmail,
      recipientName,
      companyName,
      subject,
      body,
      versionType,
    } = req.body;

    if (!recipientEmail || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email, subject, and body are required',
      });
    }

    const sendResult = await emailService.sendColdEmail({
      user: req.user,
      jobId,
      senderEmail,
      senderName,
      recipientEmail,
      recipientName: recipientName || 'Hiring Team',
      companyName: companyName || '',
      subject,
      body,
      versionType: versionType || 'normal',
    });

    res.json({
      success: true,
      message: `Cold email sent from ${sendResult.senderEmail} to ${recipientEmail}!`,
      data: sendResult,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   POST /api/cold-email/bulk-generate
exports.bulkGenerateEmails = async (req, res) => {
  try {
    const { jobIds } = req.body;

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide a list of job IDs' });
    }

    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const candidateProfile = resume?.parsedProfile || {
      name: req.user.name,
      yearsOfExperience: 1,
      skills: [],
    };

    const jobs = await Job.find({ _id: { $in: jobIds } }).populate('recruiterId');
    const generatedList = [];

    for (const job of jobs) {
      const recruiter = job.recruiterId || {
        name: 'Technical Recruiter',
        email: `talent@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      };

      const aiEmail = await aiService.generateColdEmail({
        candidateProfile,
        job,
        recruiter,
      });

      generatedList.push({
        jobId: job._id,
        title: job.title,
        company: job.company,
        recruiterName: recruiter.name,
        recruiterEmail: recruiter.email,
        subject: aiEmail.subject,
        body: aiEmail.normalVersion,
        shortVersion: aiEmail.shortVersion,
        status: 'ready', // ready, approved, sent, skipped
      });
    }

    res.json({
      success: true,
      count: generatedList.length,
      emails: generatedList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/cold-email/bulk-send
exports.bulkSendEmails = async (req, res) => {
  try {
    const { emails, senderEmail } = req.body; // Array of approved items

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ success: false, message: 'No emails provided to send' });
    }

    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const item of emails) {
      try {
        const sendRes = await emailService.sendColdEmail({
          user: req.user,
          jobId: item.jobId,
          senderEmail: item.senderEmail || senderEmail,
          recipientEmail: item.recruiterEmail,
          recipientName: item.recruiterName,
          companyName: item.company,
          subject: item.subject,
          body: item.body,
        });

        results.push({
          jobId: item.jobId,
          company: item.company,
          recipientEmail: item.recruiterEmail,
          status: 'sent',
        });
        sentCount++;
      } catch (err) {
        results.push({
          jobId: item.jobId,
          company: item.company,
          recipientEmail: item.recruiterEmail,
          status: 'failed',
          error: err.message,
        });
        failedCount++;
      }
    }

    res.json({
      success: true,
      message: `Bulk outreach complete: ${sentCount} sent, ${failedCount} failed or skipped.`,
      sentCount,
      failedCount,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/cold-email/logs
exports.getEmailLogs = async (req, res) => {
  try {
    const logs = await EmailLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('jobId');

    const accountStatus = await emailService.getAccountStatus(req.user._id);

    res.json({
      success: true,
      count: logs.length,
      accountStatus,
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
