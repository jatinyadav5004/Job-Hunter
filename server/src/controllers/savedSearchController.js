const SavedSearch = require('../models/SavedSearch');
const { executeSavedSearch } = require('../jobs/scheduler');

// Comprehensive roles and locations dataset served via API
const METADATA_OPTIONS = {
  roleCategories: [
    {
      category: 'Software Engineering & IT',
      roles: [
        { title: 'Software Engineer', defaultSkills: ['Java', 'Python', 'React', 'Node.js', 'AWS', 'SQL', 'Git'] },
        { title: 'Backend Engineer', defaultSkills: ['Java', 'Spring Boot', 'Node.js', 'MongoDB', 'PostgreSQL', 'Microservices', 'AWS'] },
        { title: 'Frontend Engineer', defaultSkills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Redux'] },
        { title: 'Full Stack Developer', defaultSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'REST APIs', 'Docker'] },
        { title: 'DevOps & Cloud Engineer', defaultSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux', 'Azure'] },
        { title: 'Data Scientist & AI Engineer', defaultSkills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Pandas', 'LLMs'] },
        { title: 'Mobile App Developer (iOS/Android)', defaultSkills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android'] },
        { title: 'QA Automation Engineer', defaultSkills: ['Selenium', 'Cypress', 'Java', 'Python', 'API Testing', 'Postman'] },
        { title: 'Cloud Solutions Architect', defaultSkills: ['AWS', 'GCP', 'Azure', 'System Architecture', 'Security', 'Distributed Systems'] },
      ],
    },
    {
      category: 'Human Resources (HR) & Talent',
      roles: [
        { title: 'Human Resources (HR) Manager', defaultSkills: ['Employee Relations', 'HRIS', 'Talent Management', 'Compliance', 'Performance Management', 'Payroll'] },
        { title: 'Talent Acquisition Specialist / Recruiter', defaultSkills: ['Talent Sourcing', 'Technical Recruitment', 'LinkedIn Recruiter', 'Interviewing', 'Candidate Engagement'] },
        { title: 'HR Generalist / Operations', defaultSkills: ['HR Operations', 'Onboarding', 'Payroll', 'Employee Engagement', 'Policy Implementation'] },
        { title: 'HR Business Partner (HRBP)', defaultSkills: ['Strategic HR', 'Stakeholder Management', 'Organizational Development', 'Talent Strategy'] },
        { title: 'Technical Recruiter', defaultSkills: ['Tech Sourcing', 'Engineering Hiring', 'Screening', 'Salary Negotiation', 'ATS'] },
      ],
    },
    {
      category: 'Marketing, Growth & Content',
      roles: [
        { title: 'Digital Marketing Specialist', defaultSkills: ['SEO', 'SEM', 'Google Ads', 'Meta Ads', 'Social Media Marketing', 'Google Analytics'] },
        { title: 'Content & Growth Marketer', defaultSkills: ['Content Strategy', 'Copywriting', 'Growth Hacking', 'Email Marketing', 'Funnel Optimization'] },
        { title: 'Product Marketing Manager (PMM)', defaultSkills: ['Go-To-Market (GTM)', 'Market Research', 'Positioning', 'Messaging', 'Competitive Analysis'] },
        { title: 'Brand Manager', defaultSkills: ['Brand Strategy', 'Campaign Management', 'PR', 'Creative Direction'] },
        { title: 'SEO / Organic Growth Lead', defaultSkills: ['SEO', 'Keyword Research', 'Technical SEO', 'Backlink Strategy', 'Ahrefs'] },
      ],
    },
    {
      category: 'Product & Design',
      roles: [
        { title: 'Product Manager', defaultSkills: ['Product Strategy', 'Agile / Scrum', 'User Research', 'Roadmapping', 'Jira', 'Data Analytics'] },
        { title: 'UI/UX Designer', defaultSkills: ['Figma', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'] },
        { title: 'Product Designer', defaultSkills: ['UI/UX', 'Figma', 'Interaction Design', 'User Testing', 'Visual Design'] },
        { title: 'Business Analyst', defaultSkills: ['Requirements Gathering', 'Process Mapping', 'SQL', 'Documentation', 'Agile'] },
        { title: 'Scrum Master / Agile Project Lead', defaultSkills: ['Scrum', 'Kanban', 'Sprint Planning', 'Agile Coaching', 'Jira'] },
      ],
    },
    {
      category: 'Sales & Business Development',
      roles: [
        { title: 'Business Development Manager (BDM)', defaultSkills: ['B2B Sales', 'Lead Generation', 'CRM (Salesforce)', 'Negotiation', 'Client Relationship'] },
        { title: 'Sales Executive / Account Manager', defaultSkills: ['Client Acquisition', 'Cold Outreach', 'Account Management', 'Closing Deals'] },
        { title: 'Enterprise Account Executive', defaultSkills: ['Enterprise Sales', 'Complex Deals', 'Executive Pitching', 'Contract Negotiation'] },
        { title: 'Customer Success Manager', defaultSkills: ['Client Retention', 'Onboarding', 'Customer Relationship', 'Upselling'] },
      ],
    },
    {
      category: 'Finance, Accounts & Operations',
      roles: [
        { title: 'Financial Analyst / Accountant', defaultSkills: ['Financial Modeling', 'Accounting', 'Excel / Sheets', 'Budgeting', 'Taxation', 'Reporting'] },
        { title: 'Finance Manager', defaultSkills: ['Financial Planning', 'P&L Management', 'Auditing', 'Compliance', 'Investor Reporting'] },
        { title: 'Operations Manager', defaultSkills: ['Process Optimization', 'Vendor Management', 'Resource Planning', 'Supply Chain', 'Logistics'] },
      ],
    },
  ],
  locations: [
    { name: 'PAN India (All States / Any Location)', group: 'All India' },
    { name: 'Remote / Work from Anywhere', group: 'Remote' },
    // Major Metros & Tech Hubs
    { name: 'Bangalore / Bengaluru (Karnataka)', group: 'Major Tech Hubs' },
    { name: 'Delhi NCR (Delhi, Gurgaon, Noida, Faridabad)', group: 'Major Tech Hubs' },
    { name: 'Mumbai / Pune (Maharashtra)', group: 'Major Tech Hubs' },
    { name: 'Hyderabad (Telangana)', group: 'Major Tech Hubs' },
    { name: 'Chennai (Tamil Nadu)', group: 'Major Tech Hubs' },
    { name: 'Kolkata (West Bengal)', group: 'Major Tech Hubs' },
    { name: 'Ahmedabad (Gujarat)', group: 'Major Tech Hubs' },
    { name: 'Jaipur (Rajasthan)', group: 'Major Tech Hubs' },
    { name: 'Chandigarh / Mohali (Punjab & Haryana)', group: 'Major Tech Hubs' },
    { name: 'Kochi / Thiruvananthapuram (Kerala)', group: 'Major Tech Hubs' },
    { name: 'Indore (Madhya Pradesh)', group: 'Major Tech Hubs' },
    { name: 'Coimbatore (Tamil Nadu)', group: 'Major Tech Hubs' },
    { name: 'Bhubaneswar (Odisha)', group: 'Major Tech Hubs' },
    // Indian States
    { name: 'Andhra Pradesh', group: 'States' },
    { name: 'Arunachal Pradesh', group: 'States' },
    { name: 'Assam', group: 'States' },
    { name: 'Bihar', group: 'States' },
    { name: 'Chhattisgarh', group: 'States' },
    { name: 'Goa', group: 'States' },
    { name: 'Gujarat', group: 'States' },
    { name: 'Haryana', group: 'States' },
    { name: 'Himachal Pradesh', group: 'States' },
    { name: 'Jharkhand', group: 'States' },
    { name: 'Karnataka', group: 'States' },
    { name: 'Kerala', group: 'States' },
    { name: 'Madhya Pradesh', group: 'States' },
    { name: 'Maharashtra', group: 'States' },
    { name: 'Manipur', group: 'States' },
    { name: 'Meghalaya', group: 'States' },
    { name: 'Mizoram', group: 'States' },
    { name: 'Nagaland', group: 'States' },
    { name: 'Odisha', group: 'States' },
    { name: 'Punjab', group: 'States' },
    { name: 'Rajasthan', group: 'States' },
    { name: 'Sikkim', group: 'States' },
    { name: 'Tamil Nadu', group: 'States' },
    { name: 'Telangana', group: 'States' },
    { name: 'Tripura', group: 'States' },
    { name: 'Uttar Pradesh', group: 'States' },
    { name: 'Uttarakhand', group: 'States' },
    { name: 'West Bengal', group: 'States' },
    // Union Territories
    { name: 'Andaman and Nicobar Islands', group: 'Union Territories' },
    { name: 'Chandigarh (UT)', group: 'Union Territories' },
    { name: 'Dadra & Nagar Haveli and Daman & Diu', group: 'Union Territories' },
    { name: 'Delhi (National Capital Territory)', group: 'Union Territories' },
    { name: 'Jammu and Kashmir', group: 'Union Territories' },
    { name: 'Ladakh', group: 'Union Territories' },
    { name: 'Lakshadweep', group: 'Union Territories' },
    { name: 'Puducherry', group: 'Union Territories' },
    // International
    { name: 'Global Remote (Worldwide)', group: 'International' },
    { name: 'USA / North America', group: 'International' },
    { name: 'Europe / UK', group: 'International' },
    { name: 'Singapore / Asia Pacific', group: 'International' },
    { name: 'UAE / Middle East', group: 'International' },
  ],
};

// @route   GET /api/saved-searches/options
exports.getSearchOptions = async (req, res) => {
  res.json({
    success: true,
    data: METADATA_OPTIONS,
  });
};

// @route   GET /api/saved-searches
exports.getSavedSearches = async (req, res) => {
  try {
    const searches = await SavedSearch.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: searches.length, searches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/saved-searches
exports.createSavedSearch = async (req, res) => {
  try {
    const {
      name,
      jobTitles,
      skills,
      experienceMin,
      experienceMax,
      locations,
      workModes,
      minSalary,
      maxSalary,
      currency,
      employmentTypes,
      targetCompanies,
      excludedCompanies,
      keywords,
      excludedKeywords,
      minMatchScore,
    } = req.body;

    const titlesList = Array.isArray(jobTitles) ? jobTitles : (jobTitles ? [jobTitles] : ['Software Engineer']);
    const profileName = name || (titlesList.length > 0 ? `${titlesList.slice(0, 2).join(' / ')} Search` : 'Job Search Profile');

    const savedSearch = await SavedSearch.create({
      userId: req.user._id,
      name: profileName,
      jobTitles: titlesList,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []),
      experienceMin: experienceMin ?? 2,
      experienceMax: experienceMax ?? 6,
      locations: Array.isArray(locations) ? locations : (locations ? locations.split(',').map(s => s.trim()).filter(Boolean) : ['PAN India']),
      workModes: workModes || ['Remote', 'Hybrid', 'On-site'],
      minSalary: minSalary || 1000000,
      maxSalary,
      currency: currency || 'INR',
      employmentTypes: employmentTypes || ['Full-time'],
      targetCompanies: targetCompanies || [],
      excludedCompanies: excludedCompanies || [],
      keywords: keywords || [],
      excludedKeywords: excludedKeywords || [],
      minMatchScore: minMatchScore || 75,
      isActive: true,
    });

    // Run immediate crawler in background
    executeSavedSearch(savedSearch).catch(err =>
      console.error(`[SavedSearch] Immediate run error: ${err.message}`)
    );

    res.status(201).json({
      success: true,
      message: 'Saved search created and initial sweep started',
      savedSearch,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/saved-searches/:id
exports.updateSavedSearch = async (req, res) => {
  try {
    const savedSearch = await SavedSearch.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!savedSearch) {
      return res.status(404).json({ success: false, message: 'Saved search profile not found' });
    }

    res.json({ success: true, message: 'Search profile updated', savedSearch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/saved-searches/:id
exports.deleteSavedSearch = async (req, res) => {
  try {
    const savedSearch = await SavedSearch.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savedSearch) {
      return res.status(404).json({ success: false, message: 'Saved search profile not found' });
    }

    res.json({ success: true, message: 'Saved search removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/saved-searches/:id/run
exports.runSearchNow = async (req, res) => {
  try {
    const search = await SavedSearch.findOne({ _id: req.params.id, userId: req.user._id });
    if (!search) {
      return res.status(404).json({ success: false, message: 'Saved search not found' });
    }

    const results = await executeSavedSearch(search);

    res.json({
      success: true,
      message: `Search completed. Discovered ${results.jobsFound} jobs with ${results.strongMatches} strong matches!`,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
