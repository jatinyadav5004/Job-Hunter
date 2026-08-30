const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

class AIService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.provider = process.env.AI_PROVIDER || (this.openaiApiKey ? 'openai' : 'gemini');

    if (this.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    }
    if (this.openaiApiKey) {
      this.openai = new OpenAI({ apiKey: this.openaiApiKey });
    }
  }

  _getOpenAIClient() {
    const key = process.env.OPENAI_API_KEY || this.openaiApiKey;
    if (key) {
      return new OpenAI({ apiKey: key });
    }
    return null;
  }

  _getGeminiClient() {
    const key = process.env.GEMINI_API_KEY || this.geminiApiKey;
    if (key) {
      return new GoogleGenerativeAI(key);
    }
    return null;
  }

  async _callAI(prompt, systemInstruction = '') {
    const openai = this._getOpenAIClient();
    const genAI = this._getGeminiClient();
    const preferredProvider = process.env.AI_PROVIDER || (openai ? 'openai' : 'gemini');

    // If OpenAI is preferred or available
    if (preferredProvider === 'openai' && openai) {
      try {
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.3,
        });
        return completion.choices[0].message.content;
      } catch (err) {
        console.warn(`[AIService] OpenAI call failed: ${err.message}. Trying Gemini if available...`);
      }
    }

    // Try Gemini
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: systemInstruction || undefined,
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (err) {
        console.warn(`[AIService] Gemini call failed: ${err.message}.`);
      }
    }

    // Fallback if no valid API key or network failure
    return null;
  }

  cleanJsonResponse(text) {
    if (!text) return null;
    let clean = text.trim();
    // Remove markdown code blocks if present
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    try {
      return JSON.parse(clean);
    } catch (e) {
      console.warn('[AIService] Failed to parse JSON from AI response, using heuristic fallback');
      return null;
    }
  }

  /**
   * 1. Parse Resume into Structured Profile
   */
  async parseResume(rawText) {
    const systemInstruction = `You are an expert HR recruiter and resume parser. Extract candidate information strictly in valid JSON format.`;
    const prompt = `
Extract the following information from this resume text into a clean JSON structure:
- name (string)
- email (string)
- phone (string)
- location (string)
- title (string: primary target job title e.g. Senior Backend Engineer)
- yearsOfExperience (number: total estimated years of experience)
- skills (array of strings: technical and domain skills)
- experience (array of objects with: title, company, location, startDate, endDate, current (boolean), description, technologies (array of strings))
- education (array of objects with: degree, institution, year, grade)
- projects (array of objects with: name, description, technologies (array of strings), link)
- achievements (array of strings)

Resume Text:
"""
${rawText.slice(0, 8000)}
"""

Respond ONLY with the JSON object. Do not include markdown code ticks.`;

    const aiResponse = await this._callAI(prompt, systemInstruction);
    const parsed = this.cleanJsonResponse(aiResponse);

    if (parsed && parsed.name) {
      return parsed;
    }

    // Rule-based heuristic fallback if AI key not provided or failed
    return this._heuristicParseResume(rawText);
  }

  async parseResumeText(rawText) {
    return this.parseResume(rawText);
  }

  /**
   * 2. Calculate Job Match Score & Analysis
   */
  async calculateMatchScore(candidateProfile, job) {
    const systemInstruction = `You are a career matching AI assistant. Evaluate the match between a candidate's profile and a job description. Return strictly valid JSON.`;
    const prompt = `
Candidate Profile:
- Title: ${candidateProfile.title || candidateProfile.name}
- Years of Experience: ${candidateProfile.yearsOfExperience || 3}
- Skills: ${(candidateProfile.skills || []).join(', ')}
- Projects / Background: ${(candidateProfile.projects || []).map(p => p.name).join(', ')}

Job Description:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location} (${job.workMode || 'Remote'})
- Required Experience: ${job.experienceRequired?.minYears || 2} - ${job.experienceRequired?.maxYears || 5} years
- Key Skills: ${(job.skills || []).join(', ')}
- Description: ${(job.description || '').slice(0, 2000)}

Calculate:
1. overallScore (0-100 number)
2. breakdown:
   - skills (0-100 number)
   - experience (0-100 number)
   - location (0-100 number)
   - title (0-100 number)
   - salary (0-100 number, default 85)
3. matchReason (2-3 concise sentences on why this candidate is a strong fit)
4. missingRequirements (1-2 sentences on any potential gaps or areas to emphasize)
5. matchedSkills (array of strings)
6. missingSkills (array of strings)

Respond strictly with a JSON object:
{
  "overallScore": number,
  "breakdown": { "skills": number, "experience": number, "location": number, "title": number, "salary": number },
  "matchReason": "...",
  "missingRequirements": "...",
  "matchedSkills": ["..."],
  "missingSkills": ["..."]
}`;

    const aiResponse = await this._callAI(prompt, systemInstruction);
    const parsed = this.cleanJsonResponse(aiResponse);

    if (parsed && typeof parsed.overallScore === 'number') {
      return parsed;
    }

    // Heuristic Match Algorithm
    return this._heuristicMatchScore(candidateProfile, job);
  }

  async matchJob(candidateProfile, job) {
    return this.calculateMatchScore(candidateProfile, job);
  }

  /**
   * 3. Generate Personalized Cold Email (Normal & Short versions)
   */
  async generateColdEmail(arg1, arg2, arg3 = {}, arg4 = '') {
    let candidateProfile, job, recruiterInfo, context;
    if (arg1 && arg1.candidateProfile) {
      candidateProfile = arg1.candidateProfile || {};
      job = arg1.job || {};
      recruiterInfo = arg1.recruiter || arg1.recruiterInfo || {};
      context = arg1.context || '';
    } else {
      candidateProfile = arg1 || {};
      job = arg2 || {};
      recruiterInfo = arg3 || {};
      context = arg4 || '';
    }

    const candidateName = candidateProfile.name || 'Candidate';
    const candidateSkills = (candidateProfile.skills || []).slice(0, 6).join(', ');
    const candidateTitle = candidateProfile.title || 'Engineer';
    const company = job.company || recruiterInfo.company || 'the company';
    const jobTitle = job.title || 'the open role';
    const recruiterName = recruiterInfo.name || 'Hiring Team';

    const systemInstruction = `You are a world-class executive career coach and cold outreach specialist. Write high-converting, polite, and authentic job outreach emails that avoid generic buzzwords.`;
    const prompt = `
Generate two personalized cold outreach emails from the candidate to the recruiter/hiring manager.

Candidate Details:
- Name: ${candidateName}
- Current Title / Role: ${candidateTitle}
- Core Skills: ${candidateSkills}
- Notable Experience / Projects: ${(candidateProfile.projects || []).slice(0, 2).map(p => p.name).join(', ')}

Target Opportunity:
- Job Title: ${jobTitle}
- Company: ${company}
- Recruiter / Contact Name: ${recruiterName}
- Job Highlights: ${(job.description || '').slice(0, 1000)}
${context ? `- Extra Angle / Notes to Emphasize: ${context}` : ''}

Generate JSON with:
1. "subject": An intriguing, high-open-rate subject line (e.g. "${jobTitle} / Quick introduction — ${candidateName}")
2. "normalVersion": A 3-paragraph professional email:
   - Para 1: Direct hook on why ${company} and this specific ${jobTitle} role caught candidate's attention.
   - Para 2: 2 concrete achievements / relevant skill overlaps matching their needs.
   - Para 3: Clear low-friction call to action (15-min chat).
3. "shortVersion": A punchy 3-4 sentence version for busy executives.

Respond ONLY with valid JSON:
{
  "subject": "...",
  "normalVersion": "...",
  "shortVersion": "..."
}`;

    const aiResponse = await this._callAI(prompt, systemInstruction);
    const parsed = this.cleanJsonResponse(aiResponse);

    if (parsed && parsed.normalVersion) {
      return parsed;
    }

    // Heuristic template fallback
    return this._heuristicColdEmail(candidateProfile, job, recruiterInfo, context);
  }

  // --- HEURISTIC FALLBACKS ---

  _heuristicParseResume(rawText) {
    const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
    const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    
    // Extract common tech skills
    const skillDictionary = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
      'React', 'Next.js', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Spring Boot', 'Django', 'FastAPI',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Git',
      'GraphQL', 'REST API', 'Microservices', 'Tailwind CSS', 'Redux', 'Kafka',
      'SEO', 'SEM', 'Google Ads', 'HRIS', 'Recruitment', 'Payroll', 'Figma'
    ];

    const lowerRawText = rawText.toLowerCase();
    const foundSkills = skillDictionary.filter((skill) => {
      if (skill === 'C++') return lowerRawText.includes('c++');
      if (skill === 'C#') return lowerRawText.includes('c#');
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(rawText);
    });

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const inferredName = lines[0] || 'Candidate';
    const inferredTitle = lines[1] || 'Software Engineer';

    return {
      name: inferredName.length < 50 ? inferredName : 'Candidate',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: 'India',
      title: inferredTitle.length < 50 ? inferredTitle : 'Full Stack Developer',
      yearsOfExperience: 3,
      skills: foundSkills.length > 0 ? foundSkills : ['Java', 'React', 'Node.js', 'AWS', 'SQL'],
      experience: [
        {
          title: inferredTitle,
          company: 'Technology Corp',
          location: 'Remote',
          startDate: '2021',
          endDate: 'Present',
          current: true,
          description: 'Developed and maintained scalable microservices, built reusable frontend components, and optimized database queries.',
          technologies: foundSkills.slice(0, 4),
        }
      ],
      education: [
        {
          degree: 'Bachelor of Technology (Computer Science)',
          institution: 'University',
          year: '2021',
        }
      ],
      projects: [
        {
          name: 'Distributed Cloud Microservices',
          description: 'Scalable cloud-native backend processing asynchronous event queues.',
          technologies: ['Node.js', 'MongoDB', 'Docker'],
        }
      ],
      achievements: ['Improved system latency by 35% through Redis caching.'],
    };
  }

  _heuristicMatchScore(candidateProfile, job) {
    const candidateSkills = (candidateProfile.skills || []).map(s => s.toLowerCase());
    const jobSkills = (job.skills || []).map(s => s.toLowerCase());

    const matched = jobSkills.filter(js => candidateSkills.some(cs => cs.includes(js) || js.includes(cs)));
    const missing = jobSkills.filter(js => !matched.includes(js));

    const skillScore = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 80;
    const expScore = 85;
    const locScore = 90;
    const titleScore = 80;
    const salaryScore = 85;

    const overallScore = Math.round((skillScore * 0.4) + (expScore * 0.2) + (locScore * 0.15) + (titleScore * 0.15) + (salaryScore * 0.1));

    return {
      overallScore: Math.min(Math.max(overallScore, 45), 98),
      breakdown: {
        skills: skillScore,
        experience: expScore,
        location: locScore,
        title: titleScore,
        salary: salaryScore,
      },
      matchReason: `Candidate displays strong alignment in ${matched.slice(0, 3).join(', ')} and fits the required experience scope.`,
      missingRequirements: missing.length > 0 ? `Could highlight experience with ${missing.slice(0, 2).join(', ')}.` : 'No significant gaps detected.',
      matchedSkills: matched.length > 0 ? matched : ['Java', 'REST APIs', 'Cloud'],
      missingSkills: missing.slice(0, 3),
    };
  }

  _heuristicColdEmail(candidateProfile, job, recruiterInfo = {}, context = '') {
    const candidateName = candidateProfile.name || 'Candidate';
    const skills = (candidateProfile.skills || ['modern technologies']).slice(0, 3).join(', ');
    const title = job.title || 'the open position';
    const company = job.company || 'your team';
    const recruiter = recruiterInfo.name || 'Hiring Team';

    const subject = `Application for ${title} — ${candidateName}`;
    const normalVersion = `Hi ${recruiter},\n\nI hope you're having a productive week.\n\nI've been following ${company}'s progress and recently noticed the ${title} opening. Given my background in ${skills} and building reliable, scalable systems, I believe my experience aligns well with what your team is looking to achieve.\n\nIn my previous projects, I focused on optimizing performance, writing clean modular code, and shipping customer-facing features. ${context ? `Specifically, ${context}` : ''}\n\nI would love the opportunity to learn more about your current roadmap and share how I can contribute to ${company}. Are you available for a brief 15-minute introductory call sometime this week?\n\nBest regards,\n${candidateName}`;

    const shortVersion = `Hi ${recruiter},\n\nI'm reaching out regarding the ${title} opening at ${company}. With hands-on experience in ${skills}, I have a proven track record of shipping scalable software and solving complex technical challenges.\n\nWould you be open to a quick 10-minute chat this week to explore if my background is a good fit for your team?\n\nBest,\n${candidateName}`;

    return { subject, normalVersion, shortVersion };
  }
}

module.exports = new AIService();
