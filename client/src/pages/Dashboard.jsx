import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Target,
  Bookmark,
  Send,
  Users,
  Video,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Bell,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import JobDetailsModal from '../components/JobDetailsModal';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    jobsFoundToday: 0,
    strongMatches: 0,
    savedJobs: 0,
    applications: 0,
    recruitersContacted: 0,
    interviews: 0,
  });
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobItem, setSelectedJobItem] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecommendedJobs(res.data.recommendedJobs || []);
        setDigest(res.data.digest);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/status`, { status: 'saved' });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to save job:', err);
    }
  };

  const statCards = [
    { label: 'Jobs Found Today', value: stats.jobsFoundToday, icon: Briefcase, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Strong Matches', value: stats.strongMatches, icon: Target, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { label: 'Saved Jobs', value: stats.savedJobs, icon: Bookmark, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Applications', value: stats.applications, icon: Send, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { label: 'Recruiters Contacted', value: stats.recruitersContacted, icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { label: 'Interviews', value: stats.interviews, icon: Video, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-teal-600/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-teal-400/30">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            AI Autonomous Job Hunting Active
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good day, {user?.name?.split(' ')[0] || 'Candidate'} 👋
          </h2>
          <p className="text-sm text-teal-100/90 mt-2 leading-relaxed">
            Your automated crawler has analyzed the latest job postings from Greenhouse, Lever, and verified career portals. Here is your daily status report.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/saved-searches')}
            className="px-4 py-2.5 bg-white text-teal-900 hover:bg-teal-50 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
          >
            Configure Search
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate('/bulk-apply')}
            className="px-4 py-2.5 bg-teal-600/80 hover:bg-teal-600 border border-teal-400/40 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Bulk Outreach
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Top 6 Metric Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 line-clamp-1">{stat.label}</span>
                <div className={`p-2 rounded-lg border ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Daily Digest Section */}
      {digest && (
        <div className="bg-gradient-to-br from-white to-teal-50/40 border border-teal-200/70 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Daily Job Digest • {digest.date}</h3>
                <p className="text-xs text-slate-500">
                  {digest.newJobsFound} new jobs scanned • {digest.strongMatchesCount} strong matches • {digest.recruitersFoundCount} verified recruiters
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {digest.topOpportunities?.slice(0, 3).map((opp, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-teal-100/90 hover:border-teal-300 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                      {opp.score}% Match
                    </span>
                    <span className="text-xs font-medium text-slate-500">{opp.salaryString}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{opp.title}</h4>
                  <p className="text-xs font-medium text-slate-600 mb-2">{opp.company} • {opp.location}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{opp.matchReason}</p>
                </div>

                <button
                  onClick={() => navigate('/jobs')}
                  className="mt-3 text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recommended Opportunities</h3>
            <p className="text-xs text-slate-500">Ranked by AI match score against your profile</p>
          </div>

          <button
            onClick={() => navigate('/jobs')}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1.5"
          >
            View All ({recommendedJobs.length})
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Analyzing job listings with AI...</p>
          </div>
        ) : recommendedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedJobs.map((item) => (
              <JobCard
                key={item.matchId || item.job?._id}
                item={item}
                onReview={(it) => setSelectedJobItem(it)}
                onSave={handleSaveJob}
                isSaved={item.status === 'saved'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No jobs matched yet</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Upload your resume and set up your Saved Searches to begin receiving matched jobs automatically.
            </p>
            <button
              onClick={() => navigate('/saved-searches')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl"
            >
              Create Saved Search
            </button>
          </div>
        )}
      </div>

      {/* Full Modal Viewer */}
      {selectedJobItem && (
        <JobDetailsModal
          item={selectedJobItem}
          onClose={() => setSelectedJobItem(null)}
          onSave={handleSaveJob}
        />
      )}
    </div>
  );
}
