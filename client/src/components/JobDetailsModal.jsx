import React from 'react';
import { X, Sparkles, AlertCircle, Building2, MapPin, Briefcase, DollarSign, Mail, Linkedin, ExternalLink, Send, BookmarkCheck } from 'lucide-react';
import MatchScoreBadge from './MatchScoreBadge';
import { useNavigate } from 'react-router-dom';
import { getSafeJobUrl } from './JobCard';

import api from '../services/api';

function formatJobDescription(raw) {
  if (!raw) return 'Join our team to drive impactful engineering and business milestones.';
  let text = String(raw);

  text = text
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|tr)>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/(ul|ol|table)>/gi, '\n\n')
    .replace(/<[^>]*>/g, ' ');

  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&#x27;': "'",
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&#8217;': "'",
    '&#8216;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&#8220;': '"',
    '&#8221;': '"',
    '&ndash;': '-',
    '&mdash;': '—',
    '&#8211;': '-',
    '&#8212;': '—',
    '&bull;': '•',
    '&middot;': '•',
    '&#8226;': '•',
    '&lt;': '<',
    '&gt;': '>',
    '&hellip;': '...',
    '&#8230;': '...',
    '&trade;': '™',
    '&reg;': '®',
    '&copy;': '©',
  };

  for (const [entity, replacement] of Object.entries(entities)) {
    text = text.split(entity).join(replacement);
  }

  text = text.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  return text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

export default function JobDetailsModal({ item, jobMatch, onClose, onSave, onStatusChange, onGenerateEmail }) {
  const navigate = useNavigate();
  const data = item || jobMatch;
  if (!data) return null;

  const job = data.job || {};
  const score = data.score ?? 80;
  const breakdown = data.breakdown || {};
  const matchReason = data.matchReason || '';
  const missingRequirements = data.missingRequirements || '';
  const matchedSkills = data.matchedSkills || [];
  const missingSkills = data.missingSkills || [];
  const recruiter = job?.recruiterId;

  const formatSalary = (sal) => {
    if (!sal || !sal.min) return 'Competitive compensation';
    if (sal.currency === 'INR') {
      return `₹${(sal.min / 100000).toFixed(1)} - ${(sal.max / 100000).toFixed(1)} LPA`;
    }
    return `$${(sal.min / 1000).toFixed(0)}k - $${(sal.max / 1000).toFixed(0)}k USD`;
  };

  const handleApplyClick = async () => {
    try {
      await api.post('/jobs/save-or-apply', {
        status: 'applied',
        jobData: job,
      });
      if (onStatusChange) onStatusChange();
    } catch (e) {
      // ignore
    }
  };

  const handleStartEmail = () => {
    onClose();
    if (onGenerateEmail) {
      onGenerateEmail(data);
    } else {
      navigate('/cold-email', {
        state: {
          selectedJob: {
            ...job,
            recruiterId: recruiter,
          },
          selectedMatch: data,
        },
      });
    }
  };

  const safeApplyUrl = getSafeJobUrl(job);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-slate-900">{job.title || 'Open Position'}</h2>
              <MatchScoreBadge score={score} size="md" />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <Building2 className="w-4 h-4 text-teal-600" />
                {job.company || 'Company'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                {job.location || 'Remote'} ({job.workMode || 'Hybrid'})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                {formatSalary(job.salary)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {/* AI Match Deep Dive */}
          <div className="bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-slate-50 border border-teal-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-teal-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                AI Match Score Breakdown
              </h3>
              <span className="text-xs font-semibold text-teal-700">5-Factor Analysis</span>
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Skills</span>
                  <span className="font-bold text-slate-800">{breakdown.skills || score}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${breakdown.skills || score}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Experience</span>
                  <span className="font-bold text-slate-800">{breakdown.experience || 85}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${breakdown.experience || 85}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Location</span>
                  <span className="font-bold text-slate-800">{breakdown.location || 90}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${breakdown.location || 90}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Title Fit</span>
                  <span className="font-bold text-slate-800">{breakdown.title || 80}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${breakdown.title || 80}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Salary</span>
                  <span className="font-bold text-slate-800">{breakdown.salary || 85}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${breakdown.salary || 85}%` }}></div>
                </div>
              </div>
            </div>

            {/* Why It Matches Reason */}
            {matchReason && (
              <div className="mb-3">
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong className="text-teal-900">Why it matches: </strong>
                  {matchReason}
                </p>
              </div>
            )}

            {/* Missing requirements */}
            {missingRequirements && (
              <div className="text-xs text-slate-600 flex items-start gap-1.5 bg-white/70 p-2.5 rounded-lg border border-slate-200/60">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong className="text-slate-800">Gap Analysis: </strong>{missingRequirements}</span>
              </div>
            )}
          </div>

          {/* Recruiter / Hiring Team Profile */}
          {recruiter && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {recruiter.name ? recruiter.name[0] : 'R'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{recruiter.name}</h4>
                  <p className="text-xs text-slate-500">{recruiter.title || 'Technical Recruiter'} at {job.company}</p>
                  <p className="text-xs font-mono text-teal-800 mt-0.5">{recruiter.email}</p>
                </div>
              </div>

              <a
                href={
                  recruiter.linkedinUrl && recruiter.linkedinUrl.startsWith('https://www.linkedin.com/search')
                    ? recruiter.linkedinUrl
                    : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${recruiter.name} ${job.company || ''} Recruiter`)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                LinkedIn Profile
              </a>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Job Overview</h4>
            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4.5 rounded-xl border border-slate-100/90 font-normal">
              {formatJobDescription(job.description)}
            </div>
          </div>

          {/* Required Skills */}
          {job.skills?.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Key Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill, idx) => {
                  const isMatched = matchedSkills.includes(skill);
                  return (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                        isMatched
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isMatched ? '✓ ' : ''}{skill}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5">
          <a
            href={safeApplyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-2xs transition-all"
          >
            <span>View Live Job</span>
            <ExternalLink className="w-4 h-4 text-teal-600" />
          </a>

          <button
            onClick={handleStartEmail}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all"
          >
            <Send className="w-4 h-4" />
            Generate Cold Email
          </button>
        </div>
      </div>
    </div>
  );
}
