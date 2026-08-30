import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  SearchCode,
  Briefcase,
  Users,
  Mail,
  History,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Compass,
  Cpu,
  Layers,
  Send,
} from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Upload Your Resume & Extract Profile',
    desc: 'Upload your PDF or DOCX resume. The AI engine instantly parses your core skills, work history, projects, and target role into a structured candidate profile.',
    icon: FileText,
    link: '/resume',
    linkText: 'Go to Resume & Profile',
    color: 'from-teal-500 to-emerald-500',
    tags: ['PDF / DOCX Parsing', 'Skills Extraction', 'Projects & Background'],
  },
  {
    step: '02',
    title: 'Configure Automated Search Sweeps',
    desc: 'Select your target roles and locations (e.g. PAN India, Remote, Indian Metros). Click "✨ Auto-Fill from Resume" to automatically map your search criteria from your active resume.',
    icon: SearchCode,
    link: '/saved-searches',
    linkText: 'Set Up Saved Searches',
    color: 'from-blue-500 to-cyan-500',
    tags: ['PAN India & Remote', 'Auto-Fill from Resume', 'Daily Automated Crawlers'],
  },
  {
    step: '03',
    title: 'Explore AI-Ranked Opportunities',
    desc: 'Browse discovered jobs ranked from 0–100% based on a 5-factor AI analysis (skills match, experience, location, title, and salary). Review reasons why you match and identify key strengths with 100% live job links.',
    icon: Briefcase,
    link: '/jobs',
    linkText: 'View Matched Jobs',
    color: 'from-indigo-500 to-purple-500',
    tags: ['5-Factor Match Score', 'Live LinkedIn Job Links', 'Gap Analysis'],
  },
  {
    step: '04',
    title: 'Find Recruiter & Employee Emails',
    desc: 'Search any target company (e.g. Razorpay, Google, Swiggy, Stripe, Flipkart) to discover verified employee email addresses and live LinkedIn profiles for direct recruiter outreach.',
    icon: Users,
    link: '/recruiters',
    linkText: 'Open Recruiter Finder',
    color: 'from-amber-500 to-orange-500',
    tags: ['Company Domain Resolution', 'Live LinkedIn Search', 'Direct Recruiter Leads'],
  },
  {
    step: '05',
    title: 'Generate Personalized Cold Emails',
    desc: 'Generate tailored outreach citing your real resume projects, achievements, and unique strengths. You can also view or switch your active resume directly inside the generator.',
    icon: Mail,
    link: '/cold-email',
    linkText: 'Compose Cold Email',
    color: 'from-rose-500 to-pink-500',
    tags: ['Dual Version (Standard & Concise)', 'In-Place Resume Switcher', '1-Click Send'],
  },
  {
    step: '06',
    title: 'Track Pipeline in Application History',
    desc: 'Keep an audit trail of every job applied to or contacted. Review exact sent email logs, track interview milestones, and take interview notes.',
    icon: History,
    link: '/applications',
    linkText: 'View Application Tracer',
    color: 'from-emerald-500 to-teal-600',
    tags: ['Sent Email Log Viewer', 'Interview Milestones', 'Application Audit Trail'],
  },
];

export default function About() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Career Automation</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Supercharge Your Job Search with <span className="text-teal-400">JobHunter AI</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            JobHunter AI is an autonomous career copilot designed to find matched opportunities, discover corporate recruiter emails, and write hyper-personalized cold outreach grounded in your real uploaded resume.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/resume"
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all inline-flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Get Started: Upload Resume</span>
            </Link>

            <Link
              to="/jobs"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs transition-all inline-flex items-center gap-2"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decorative Glow Background */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900">Resume-Grounded AI</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every match score and cold email is dynamically generated from your uploaded projects, technical skills, and experience scope.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900">Direct Recruiter Outreach</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bypass generic black-hole application forms by finding verified hiring manager and recruiter email addresses and live LinkedIn leads.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-900">100% Real Live Links</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every job posting and recruiter profile links directly to live, active LinkedIn searches with zero broken or dummy URLs.
          </p>
        </div>
      </div>

      {/* Step-by-Step Guide */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-600" />
              How to Use JobHunter AI (Step-by-Step)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Follow these simple steps to automate your daily job hunt pipeline
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-black text-slate-400">
                        STEP {step.step}
                      </span>
                    </div>

                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {step.desc}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {step.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    to={step.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>{step.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Launch CTA */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-sm text-teal-950">Ready to start landing interviews?</h3>
          <p className="text-xs text-teal-800 mt-0.5">
            Begin by uploading your resume to activate automated daily matching.
          </p>
        </div>

        <Link
          to="/resume"
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-all inline-flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upload Resume Now</span>
        </Link>
      </div>
    </div>
  );
}
