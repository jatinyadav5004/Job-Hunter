import React from 'react';
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import MatchScoreBadge from './MatchScoreBadge';

export function getSafeJobUrl(job) {
  if (!job) return '#';
  const url = job.applicationUrl || '';
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

export default function JobCard({ item, jobMatch, onSelect, onReview, onSave, isSaved = false }) {
  const data = item || jobMatch || {};
  const job = data.job || {};
  const score = data.score ?? 80;
  const matchReason = data.matchReason || '';
  const matchedSkills = data.matchedSkills || [];
  const status = data.status || 'new';
  const isApplied = status === 'applied' || status === 'contacted' || status === 'interview';

  const handleReviewClick = () => {
    if (onSelect) onSelect(data);
    else if (onReview) onReview(data);
  };

  const handleSaveClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (onSave) onSave(job);
  };

  const formatSalary = (sal) => {
    if (!sal || !sal.min) return 'Competitive';
    if (sal.currency === 'INR') {
      return `₹${(sal.min / 100000).toFixed(1)} - ${(sal.max / 100000).toFixed(1)} LPA`;
    }
    return `$${(sal.min / 1000).toFixed(0)}k - $${(sal.max / 1000).toFixed(0)}k`;
  };

  const safeUrl = getSafeJobUrl(job);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between group shadow-sm hover:shadow-md ${
        isApplied
          ? 'bg-emerald-50/30 border-emerald-300 ring-1 ring-emerald-200'
          : 'bg-white border-slate-200/90 hover:border-teal-300'
      }`}
    >
      <div>
        {/* Applied Status Banner */}
        {isApplied && (
          <div className="mb-3 flex items-center justify-between bg-emerald-100/80 border border-emerald-300/80 px-3 py-1 rounded-xl text-emerald-900 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              Contacted / Cold Email Sent
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
              In History
            </span>
          </div>
        )}

        {/* Top bar */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-tight truncate">
              {job.title || 'Software Engineer'}
            </h3>
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mt-1">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{job.company || 'Company'}</span>
            </div>
          </div>
          <MatchScoreBadge score={score} size="md" />
        </div>

        {/* Badges / Metadata */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-2.5 text-xs text-slate-600 mb-4">
          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {job.location || 'Remote'}
          </span>
          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            {job.workMode || 'Hybrid'}
          </span>
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-semibold border border-emerald-100">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            {formatSalary(job.salary)}
          </span>
        </div>

        {/* AI Match Reason snippet */}
        {matchReason && (
          <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-2.5 mb-3 text-xs text-teal-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">{matchReason}</p>
          </div>
        )}

        {/* Skills matched list */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(matchedSkills.length > 0 ? matchedSkills : (job.skills || []).slice(0, 4)).map((sk, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
            >
              <CheckCircle2 className="w-3 h-3 text-teal-500" />
              {sk}
            </span>
          ))}
        </div>
      </div>

      {/* Action footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleReviewClick}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
            isApplied
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          <span>{isApplied ? 'Review Outreach & Status' : 'Review & Outreach'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {!isApplied && (
          <button
            type="button"
            onClick={handleSaveClick}
            title={isSaved ? 'Saved' : 'Save Job'}
            className={`p-2 rounded-xl border transition-colors ${
              isSaved
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        <a
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open Live Job Search"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-teal-700 hover:bg-slate-50 text-xs font-bold transition-colors"
        >
          <span>View Live Job</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
