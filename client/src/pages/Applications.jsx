import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Mail,
  ExternalLink,
  Building2,
  Trash2,
  Eye,
  X,
  FileText,
  AlertCircle,
  Send,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { getSafeJobUrl } from '../components/JobCard';

const STATUS_CONFIG = {
  applied: { label: 'Applied', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  contacted: { label: 'Outreach Sent', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  interview: { label: 'Interview Scheduled', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  offer: { label: 'Offer Received', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedNotesApp, setSelectedNotesApp] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
        setFeedback(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedNotesApp) return;
    try {
      const res = await api.put(`/applications/${selectedNotesApp._id}/status`, { notes: notesText });
      if (res.data.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === selectedNotesApp._id ? { ...a, notes: notesText } : a))
        );
        setSelectedNotesApp(null);
        setFeedback('Notes updated successfully');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Remove this application entry from your history tracer?')) return;
    try {
      await api.delete(`/applications/${appId}`);
      setApplications(applications.filter((a) => a._id !== appId));
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered List
  const filteredApps = applications.filter((app) => {
    const title = app.jobId?.title || '';
    const company = app.jobId?.company || '';
    const recipient = app.emailLogId?.recipientEmail || '';
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Top Metrics
  const totalCount = applications.length;
  const appliedCount = applications.filter((a) => a.status === 'applied' || a.status === 'contacted').length;
  const interviewCount = applications.filter((a) => a.status === 'interview').length;
  const offerCount = applications.filter((a) => a.status === 'offer').length;

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            Job Application History & Tracer
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete audit trail of all jobs applied, outreach emails sent, and recruiter interview milestones
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0">
          <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Tracked</span>
            <span className="text-sm font-extrabold text-slate-900">{totalCount}</span>
          </div>
          <div className="bg-teal-50 px-3.5 py-2 rounded-xl border border-teal-200 text-center">
            <span className="text-[10px] uppercase font-bold text-teal-600 block">Outreach / Applied</span>
            <span className="text-sm font-extrabold text-teal-800">{appliedCount}</span>
          </div>
          <div className="bg-purple-50 px-3.5 py-2 rounded-xl border border-purple-200 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-600 block">Interviews</span>
            <span className="text-sm font-extrabold text-purple-800">{interviewCount}</span>
          </div>
          <div className="bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Offers</span>
            <span className="text-sm font-extrabold text-emerald-800">{offerCount}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company, role title, or recruiter email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Statuses ({applications.length})</option>
            <option value="applied">Applied</option>
            <option value="contacted">Outreach Sent</option>
            <option value="interview">Interview Scheduled</option>
            <option value="offer">Offer Received</option>
            <option value="rejected">Rejected</option>
            <option value="shortlisted">Shortlisted</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Clock className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading your application tracer history...</p>
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="p-4">Target Role & Company</th>
                  <th className="p-4">Recruiter / Contact</th>
                  <th className="p-4">Date Applied / Outreach</th>
                  <th className="p-4">Status & Pipeline</th>
                  <th className="p-4">Outreach Email</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => {
                  const job = app.jobId;
                  const emailLog = app.emailLogId;
                  const statusInfo = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
                  const dateStr = app.dateApplied
                    ? new Date(app.dateApplied).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Role & Company */}
                      <td className="p-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{job?.title || 'Open Role'}</span>
                          <a
                            href={getSafeJobUrl(job)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-teal-600"
                            title="Open original job posting"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="text-[11px] font-normal text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{job?.company || 'Company'}</span>
                          <span>•</span>
                          <span>{job?.location || 'Remote'}</span>
                        </div>
                      </td>

                      {/* Recruiter / Contact */}
                      <td className="p-4">
                        {emailLog?.recipientEmail ? (
                          <div>
                            <div className="font-bold text-slate-800">{emailLog.recipientName || 'Hiring Manager'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{emailLog.recipientEmail}</div>
                          </div>
                        ) : job?.recruiterId ? (
                          <div>
                            <div className="font-bold text-slate-800">{job.recruiterId.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{job.recruiterId.email}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Direct Career Portal</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} focus:outline-none cursor-pointer`}
                        >
                          <option value="shortlisted">Shortlisted</option>
                          <option value="applied">Applied</option>
                          <option value="contacted">Outreach Sent</option>
                          <option value="interview">Interview Scheduled</option>
                          <option value="offer">Offer Received</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Email Log Preview */}
                      <td className="p-4">
                        {emailLog ? (
                          <button
                            type="button"
                            onClick={() => setSelectedEmail(emailLog)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-bold rounded-lg transition-colors text-[11px]"
                          >
                            <Mail className="w-3.5 h-3.5 text-teal-600" />
                            <span>View Email Log</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions (Notes & Delete) */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNotesApp(app);
                              setNotesText(app.notes || '');
                            }}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              app.notes
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-transparent'
                            }`}
                            title="Notes / Interview Feedback"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(app._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove from history"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No applications or outreach history yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            When you send a cold email or mark a job as applied, it will automatically appear here with a full audit log.
          </p>
        </div>
      )}

      {/* View Email Content Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-teal-600" />
                  Sent Cold Email Tracer Log
                </h3>
                <p className="text-[11px] text-slate-500">
                  Recipient: <span className="font-mono font-semibold">{selectedEmail.recipientEmail}</span>
                </p>
              </div>
              <button onClick={() => setSelectedEmail(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Subject Line</span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900">
                  {selectedEmail.subject}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Message Body Sent</span>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                  {selectedEmail.body}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>Sent on: {new Date(selectedEmail.createdAt).toLocaleString()}</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Delivered Successfully ✓
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes / Interview Modal */}
      {selectedNotesApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Application Notes & Interview Details
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedNotesApp.jobId?.title} at {selectedNotesApp.jobId?.company}
                </p>
              </div>
              <button onClick={() => setSelectedNotesApp(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-xs space-y-3">
              <label className="font-bold text-slate-700 block">
                Internal Notes, Recruiter Feedback, or Interview Schedule:
              </label>
              <textarea
                rows={6}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="e.g. Technical screen scheduled for Friday 3 PM with Senior Engineering Manager. Focus on microservices and distributed caching..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setSelectedNotesApp(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
