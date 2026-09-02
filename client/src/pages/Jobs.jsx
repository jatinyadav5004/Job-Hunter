import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Flame,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../services/api';
import JobCard from '../components/JobCard';
import JobDetailsModal from '../components/JobDetailsModal';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobItem, setSelectedJobItem] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [minScore]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs', {
        params: {
          minScore: minScore > 0 ? minScore : undefined,
        },
      });
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobData) => {
    try {
      await api.post('/jobs/save-or-apply', { status: 'saved', jobData });
      fetchJobs();
    } catch (err) {
      console.error('Failed to save job:', err);
    }
  };

  // Counts
  const newCount = jobs.filter((j) => j.status === 'new').length;
  const appliedCount = jobs.filter((j) => j.status === 'applied' || j.status === 'contacted' || j.status === 'interview').length;
  const savedCount = jobs.filter((j) => j.status === 'shortlisted' || j.status === 'saved').length;

  const filteredJobs = jobs.filter((item) => {
    // Status filter
    if (statusFilter === 'new' && item.status !== 'new') return false;
    if (statusFilter === 'applied' && item.status !== 'applied' && item.status !== 'contacted' && item.status !== 'interview') return false;
    if (statusFilter === 'saved' && item.status !== 'shortlisted' && item.status !== 'saved') return false;

    // Search term
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch = item.job?.title?.toLowerCase().includes(term);
    const companyMatch = item.job?.company?.toLowerCase().includes(term);
    const skillsMatch = item.job?.skills?.some((s) => s.toLowerCase().includes(term));
    return titleMatch || companyMatch || skillsMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Discovered Opportunities</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {jobs.length} live jobs fetched on-demand & matched specifically for your profile
          </p>
        </div>

        {/* Filters Form - 100% Mobile Responsive */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto"
        >
          {/* Search bar with Clear & Submit Action */}
          <div className="relative flex-1 min-w-[220px] w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, company, skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Min Score Selector */}
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="flex-1 sm:flex-initial px-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={0}>All Scores</option>
              <option value={60}>60%+ Match</option>
              <option value={75}>75%+ Strong</option>
              <option value={85}>85%+ Top Match</option>
            </select>

            <button
              type="button"
              onClick={fetchJobs}
              title="Refresh live list"
              className="px-3.5 py-2.5 sm:py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="sm:hidden">Refresh</span>
            </button>
          </div>
        </form>
      </div>

      {/* Segment Tabs: All / New / Applied / Saved */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>All Discovered ({jobs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('new')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === 'new'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Unapplied Matches ({newCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('applied')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === 'applied'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-800 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Already Applied ({appliedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('saved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === 'saved'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-500" />
          <span>Watchlist ({savedCount})</span>
        </button>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Finding matched opportunities...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((item) => (
            <JobCard
              key={item.matchId || item.job?._id || item.job?.fingerprint}
              jobMatch={item}
              onSelect={() => setSelectedJobItem(item)}
              onSave={() => handleSaveJob(item.job)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {statusFilter === 'applied' ? 'No applications recorded yet' : 'No jobs found matching criteria'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {statusFilter === 'applied'
              ? 'When you apply to jobs or send outreach emails, they will appear here.'
              : 'Try adjusting your search filters or click refresh to load fresh jobs.'}
          </p>
        </div>
      )}

      {/* Details & Review Modal */}
      {selectedJobItem && (
        <JobDetailsModal
          item={selectedJobItem}
          jobMatch={selectedJobItem}
          onClose={() => setSelectedJobItem(null)}
          onStatusChange={fetchJobs}
        />
      )}
    </div>
  );
}
