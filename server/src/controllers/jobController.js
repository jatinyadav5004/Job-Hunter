const Job = require('../models/Job');
const Application = require('../models/Application');
const Recruiter = require('../models/Recruiter');
const Resume = require('../models/Resume');
const SavedSearch = require('../models/SavedSearch');
const jobSourceService = require('../services/jobSourceService');
const aiService = require('../services/aiService');
const { findOrDiscoverRecruiter } = require('../jobs/scheduler');

function sanitizeJobUrl(job) {
  if (!job) return 'https://www.linkedin.com/jobs/';
  let url = job.applicationUrl || '';
  if (
    !url ||
    url.includes('/job-') ||
    url.includes('/job/1') ||
    url.includes('.com/careers/job/') ||
    url.includes('jobs.lever.co/') ||
    url.includes('boards.greenhouse.io/') ||
    url.includes('/jobs/view/') ||
    url.includes('example.com')
  ) {
    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(`${job.title || 'Engineer'} ${job.company || ''}`)}`;
  }
  return url;
}

// @route   GET /api/jobs
// On-demand Real-Time Live Discovery (Does NOT save unapplied jobs to MongoDB)
exports.getMatchedJobs = async (req, res) => {
  try {
    const { status, minScore, search, page = 1, limit = 30 } = req.query;
    const userId = req.user._id;

    // 1. Fetch user search preferences & resume
    const userSearch = await SavedSearch.findOne({ userId }).sort({ createdAt: -1 });
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

    const candidateTitle = resume?.parsedProfile?.title || 'Software Engineer';
    const candidateSkills = resume?.parsedProfile?.skills || ['React', 'JavaScript', 'Node.js', 'Python', 'SQL', 'AWS'];
    const candidateLocation = resume?.parsedProfile?.location || 'PAN India';

    const defaultRoleList = ['Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer'];

    const searchPreferences = {
      jobTitles: search?.trim()
        ? [search.trim()]
        : userSearch?.jobTitles?.length
        ? userSearch.jobTitles
        : (resume?.parsedProfile?.title ? [resume.parsedProfile.title] : defaultRoleList),
      skills: userSearch?.skills?.length
        ? userSearch.skills
        : candidateSkills,
      locations: userSearch?.locations?.length
        ? userSearch.locations
        : [candidateLocation, 'Remote', 'PAN India'],
      minSalary: userSearch?.minSalary || 0,
      workModes: userSearch?.workModes || ['Remote', 'Hybrid', 'On-site'],
    };

    const candidateProfile = resume?.parsedProfile || {
      name: req.user.name || 'Candidate',
      title: candidateTitle,
      yearsOfExperience: resume?.parsedProfile?.yearsOfExperience || 2,
      skills: candidateSkills,
      location: candidateLocation,
    };

    // 2. Fetch live latest jobs on-the-fly directly from all sources
    const rawJobs = await jobSourceService.fetchFromAllSources(searchPreferences);

    // 3. Check which jobs user already applied/saved in DB
    const userApplications = await Application.find({ userId }).populate('jobId');
    const appliedUrls = new Map();
    userApplications.forEach((app) => {
      if (app.jobId) {
        appliedUrls.set(app.jobId.fingerprint || app.jobId.applicationUrl, app.status);
      }
    });

    // 4. Score and format live jobs in-memory in parallel
    const liveMatches = await Promise.all(
      rawJobs.map(async (raw, i) => {
        raw.applicationUrl = sanitizeJobUrl(raw);

        const matchResult = await aiService.calculateMatchScore(candidateProfile, raw);
        const score = matchResult.overallScore ?? matchResult.score ?? 84;
        const appStatus = appliedUrls.get(raw.fingerprint || raw.applicationUrl) || 'new';

        return {
          matchId: `live-${raw.fingerprint || i}`,
          score,
          breakdown: matchResult.breakdown || {
            skills: 85,
            experience: 80,
            location: 90,
            title: 85,
            salary: 80,
          },
          matchReason:
            matchResult.matchReason || `Strong alignment for ${raw.title} at ${raw.company}`,
          missingRequirements:
            matchResult.missingRequirements || 'No significant gaps detected.',
          matchedSkills: matchResult.matchedSkills || raw.skills?.slice(0, 4) || ['Core Skills'],
          missingSkills: matchResult.missingSkills || [],
          status: appStatus,
          isStrongMatch: score >= 60,
          job: raw,
        };
      })
    );

    // 5. Apply filters (minScore, status, search term)
    let filtered = liveMatches;
    if (status && status !== 'all') {
      filtered = filtered.filter((m) => m.status === status);
    }
    if (minScore && Number(minScore) > 0) {
      filtered = filtered.filter((m) => m.score >= Number(minScore));
    }
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          (m.job.title || '').toLowerCase().includes(term) ||
          (m.job.company || '').toLowerCase().includes(term) ||
          (m.job.skills || []).some((s) => s.toLowerCase().includes(term))
      );
    }

    // Sort by highest score first
    filtered.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      count: filtered.length,
      total: filtered.length,
      page: 1,
      pages: 1,
      jobs: filtered,
    });
  } catch (error) {
    console.error('[GetMatchedJobs Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/jobs/save-or-apply
// Only saves the Job and Application record to MongoDB when user takes an action
exports.saveOrApplyJob = async (req, res) => {
  try {
    const { status, jobData, notes } = req.body;
    const userId = req.user._id;

    if (!jobData && !req.params.id) {
      return res.status(400).json({ success: false, message: 'Missing job data' });
    }

    let job;
    if (jobData) {
      jobData.applicationUrl = sanitizeJobUrl(jobData);
      job = await Job.findOne({
        $or: [
          { fingerprint: jobData.fingerprint },
          { applicationUrl: jobData.applicationUrl },
        ],
      });

      if (!job) {
        const recruiter = await findOrDiscoverRecruiter(jobData.company, jobData.title);
        if (recruiter) {
          jobData.recruiterId = recruiter._id;
        }
        job = await Job.create(jobData);
      }
    } else {
      job = await Job.findById(req.params.id);
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Create or Update Application
    const applicationStatus = status === 'saved' ? 'shortlisted' : (status || 'applied');
    const application = await Application.findOneAndUpdate(
      { userId, jobId: job._id },
      {
        userId,
        jobId: job._id,
        status: applicationStatus,
        notes: notes || '',
        dateApplied: applicationStatus === 'applied' ? new Date() : undefined,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Job successfully ${status === 'saved' ? 'saved to watchlist' : 'marked as applied'}!`,
      job,
      application,
    });
  } catch (error) {
    console.error('[SaveOrApplyJob Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/jobs/:id
exports.getJobDetails = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiterId');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found in database' });
    }

    const jobObj = job.toObject ? job.toObject() : { ...job };
    jobObj.applicationUrl = sanitizeJobUrl(jobObj);

    const application = await Application.findOne({ userId: req.user._id, jobId: job._id });

    res.json({
      success: true,
      job: jobObj,
      application: application || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/jobs/:id/status
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    return exports.saveOrApplyJob(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/jobs/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const EmailLog = require('../models/EmailLog');

    const applications = await Application.find({ userId });
    const appliedCount = applications.filter((a) => a.status === 'applied' || a.status === 'contacted').length;
    const interviewCount = applications.filter((a) => a.status === 'interview').length;
    const savedCount = applications.filter((a) => a.status === 'saved' || a.status === 'shortlisted').length;
    const emailsSentCount = await EmailLog.countDocuments({ userId, status: 'sent' });

    // Dynamic count from live discovered opportunities for this candidate
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    const userSearch = await SavedSearch.findOne({ userId }).sort({ createdAt: -1 });
    const titles = userSearch?.jobTitles?.length
      ? userSearch.jobTitles
      : (resume?.parsedProfile?.title ? [resume.parsedProfile.title] : ['Opportunities']);
    const locations = userSearch?.locations?.length ? userSearch.locations : ['India'];

    const liveJobs = await jobSourceService.fetchFromAllSources({ jobTitles: titles, locations });
    const jobsFoundToday = liveJobs.length;
    const strongMatches = liveJobs.filter((j) => (j.matchScore || 80) >= 70).length;

    res.json({
      success: true,
      stats: {
        jobsFoundToday,
        strongMatches,
        savedJobs: savedCount,
        applications: appliedCount,
        recruitersContacted: emailsSentCount,
        interviews: interviewCount,
        responseRate: appliedCount > 0 ? Math.round((interviewCount / appliedCount) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
