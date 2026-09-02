const Recruiter = require('../models/Recruiter');
const Job = require('../models/Job');
const EmailLog = require('../models/EmailLog');

// Corporate domain mapping helper
function deriveCompanyDomain(companyName) {
  const clean = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const knownDomains = {
    google: 'google.com',
    microsoft: 'microsoft.com',
    amazon: 'amazon.com',
    apple: 'apple.com',
    meta: 'meta.com',
    netflix: 'netflix.com',
    stripe: 'stripe.com',
    razorpay: 'razorpay.com',
    swiggy: 'swiggy.in',
    zomato: 'zomato.com',
    flipkart: 'flipkart.com',
    paytm: 'paytm.com',
    phonepe: 'phonepe.com',
    cred: 'cred.club',
    groww: 'groww.in',
    zepto: 'zeptonow.com',
    ola: 'olacabs.com',
    uber: 'uber.com',
    airbnb: 'airbnb.com',
    postman: 'postman.com',
    tcs: 'tcs.com',
    infosys: 'infosys.com',
    wipro: 'wipro.com',
    hcl: 'hcltech.com',
    marriott: 'marriott.com',
    taj: 'ihcltata.com',
    itchotels: 'itchotels.com',
    oberoi: 'oberoihotels.com',
  };

  return knownDomains[clean] || `${clean}.com`;
}

// @route   GET /api/recruiters/search
// Search real recruiters by Company Name & provide direct live LinkedIn search portals
exports.searchCompanyEmployees = async (req, res) => {
  try {
    const { company, role } = req.query;

    if (!company) {
      return res.status(400).json({ success: false, message: 'Please provide a company name to search' });
    }

    const cleanCompany = company.trim();
    const domain = deriveCompanyDomain(cleanCompany);

    // 1. Fetch any verified recruiters in the database
    const savedRecruiters = await Recruiter.find({
      companyName: new RegExp(`^${cleanCompany}$`, 'i'),
    });

    // 2. Check which ones have been contacted by user
    const userEmailLogs = await EmailLog.find({ userId: req.user._id, status: 'sent' });
    const contactedSet = new Set(userEmailLogs.map((l) => (l.recipientEmail || '').toLowerCase()));

    const verifiedContacts = savedRecruiters.map((r) => ({
      _id: r._id,
      name: r.name,
      title: r.title,
      companyName: r.companyName,
      email: r.email,
      linkedinUrl: r.linkedinUrl,
      confidenceScore: r.confidenceScore || 95,
      contacted: contactedSet.has((r.email || '').toLowerCase()),
    }));

    // 3. Live LinkedIn & Talent Discovery Portals (Real live LinkedIn queries)
    const customRoleQuery = role ? ` ${role}` : '';
    const linkedinPortals = [
      {
        title: '🎯 All Live Recruiters & Talent Team',
        description: `Search active recruiters, talent sourcers, and HRs at ${cleanCompany} directly on LinkedIn`,
        query: `${cleanCompany} (recruiter OR "talent acquisition" OR "talent partner" OR "technical recruiter")${customRoleQuery}`,
        url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${cleanCompany} (recruiter OR "talent acquisition" OR "talent partner" OR "technical recruiter")${customRoleQuery}`)}`,
        badge: 'Recommended',
      },
      {
        title: '💻 Technical & Engineering Recruiters',
        description: `Find technical hiring managers and engineering talent leads at ${cleanCompany}`,
        query: `${cleanCompany} ("technical recruiter" OR "tech talent" OR "engineering recruiter")`,
        url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${cleanCompany} ("technical recruiter" OR "tech talent" OR "engineering recruiter")`)}`,
        badge: 'Tech Roles',
      },
      {
        title: '👥 Talent Acquisition Leads & Heads',
        description: `Find Talent Acquisition Directors, Lead Recruiters, and Heads of People`,
        query: `${cleanCompany} ("lead recruiter" OR "talent acquisition lead" OR "head of talent")`,
        url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${cleanCompany} ("lead recruiter" OR "talent acquisition lead" OR "head of talent")`)}`,
        badge: 'Leadership',
      },
      {
        title: '🚀 Engineering Managers & Hiring Leads',
        description: `Find department managers and engineering leads who make direct hiring decisions`,
        query: `${cleanCompany} ("engineering manager" OR "hiring manager" OR "director of engineering")`,
        url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${cleanCompany} ("engineering manager" OR "hiring manager" OR "director of engineering")`)}`,
        badge: 'Decision Makers',
      },
      {
        title: '🌐 Google X-Ray Verified Profiles',
        description: `Search indexed LinkedIn profiles at ${cleanCompany} via Google Search`,
        query: `site:linkedin.com/in/ "${cleanCompany}" ("recruiter" OR "talent acquisition")`,
        url: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in/ "${cleanCompany}" ("recruiter" OR "talent acquisition" OR "hiring")`)}`,
        badge: 'X-Ray Web',
      },
    ];

    // Standard official inboxes
    const officialInboxes = [
      { email: `careers@${domain}`, label: 'Official Careers Inbox' },
      { email: `talent@${domain}`, label: 'Talent Acquisition Team' },
      { email: `recruiting@${domain}`, label: 'Recruiting Team' },
      { email: `hr@${domain}`, label: 'HR & People Operations' },
    ];

    res.json({
      success: true,
      company: cleanCompany,
      domain,
      verifiedContacts,
      linkedinPortals,
      officialInboxes,
    });
  } catch (error) {
    console.error('[Recruiter Search Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/recruiters
exports.getRecruiters = async (req, res) => {
  try {
    const recruiters = await Recruiter.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: recruiters.length, recruiters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/recruiters
exports.createRecruiter = async (req, res) => {
  try {
    const { companyName, name, title, email, linkedinUrl } = req.body;

    if (!companyName || !name) {
      return res.status(400).json({ success: false, message: 'Company name and recruiter name are required' });
    }

    const cleanCompany = companyName.trim();
    const cleanEmail = email ? email.toLowerCase().trim() : `talent@${deriveCompanyDomain(cleanCompany)}`;

    const recruiter = await Recruiter.create({
      companyName: cleanCompany,
      name: name.trim(),
      title: title?.trim() || 'Technical Recruiter',
      email: cleanEmail,
      linkedinUrl: linkedinUrl?.trim() || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${cleanCompany} ${name}`)}`,
      source: 'manual',
      confidenceScore: 98,
    });

    res.status(201).json({
      success: true,
      message: 'Recruiter contact saved successfully',
      recruiter,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/recruiters/:id
exports.getRecruiterById = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id);
    if (!recruiter) {
      return res.status(404).json({ success: false, message: 'Recruiter not found' });
    }
    res.json({ success: true, recruiter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
