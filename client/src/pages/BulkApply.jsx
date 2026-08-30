import React, { useState, useEffect } from 'react';
import {
  Send,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Building2,
  Users,
  Edit3,
  Trash2,
  RefreshCw,
  Eye,
  X,
  Mail,
} from 'lucide-react';
import api from '../services/api';
import MatchScoreBadge from '../components/MatchScoreBadge';
import { useAuth } from '../context/AuthContext';

export default function BulkApply() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [senders, setSenders] = useState([]);
  const [selectedSenderEmail, setSelectedSenderEmail] = useState(user?.email || '');

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchCandidates();
    fetchSenders();
  }, []);

  const fetchCandidates = async () => {
    setLoadingJobs(true);
    try {
      const res = await api.get('/jobs?minScore=70');
      if (res.data.success) {
        setJobs(res.data.jobs || []);
        // Pre-select top 4 matches
        const topIds = (res.data.jobs || []).slice(0, 4).map((j) => j.job?._id).filter(Boolean);
        setSelectedJobIds(topIds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchSenders = async () => {
    try {
      const res = await api.get('/email/senders');
      if (res.data.success && res.data.senders?.length > 0) {
        setSenders(res.data.senders);
        const def = res.data.senders.find((s) => s.isDefault) || res.data.senders[0];
        setSelectedSenderEmail(def.emailAddress);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedJobIds.includes(id)) {
      setSelectedJobIds(selectedJobIds.filter((jId) => jId !== id));
    } else {
      setSelectedJobIds([...selectedJobIds, id]);
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedJobIds.length === 0) return;
    setGenerating(true);
    setFeedback({ type: '', msg: '' });

    try {
      const res = await api.post('/cold-email/bulk-generate', { jobIds: selectedJobIds });
      if (res.data.success) {
        setGeneratedEmails(
          res.data.emails.map((item) => ({
            ...item,
            isApproved: true,
          }))
        );
        setFeedback({
          type: 'success',
          msg: `Generated unique, personalized outreach emails for ${res.data.count} roles!`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to generate bulk emails',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkSend = async () => {
    const approved = generatedEmails.filter((e) => e.isApproved);
    if (approved.length === 0) {
      setFeedback({ type: 'error', msg: 'Please approve at least one email to send' });
      return;
    }

    setSending(true);
    setFeedback({ type: '', msg: '' });

    try {
      const res = await api.post('/cold-email/bulk-send', {
        emails: approved,
        senderEmail: selectedSenderEmail,
      });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          msg: res.data.message,
        });

        // Mark sent items in list
        const sentMap = new Set(res.data.results.filter((r) => r.status === 'sent').map((r) => r.jobId));
        setGeneratedEmails((prev) =>
          prev.map((item) =>
            sentMap.has(item.jobId) ? { ...item, status: 'sent', isApproved: false } : item
          )
        );
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err.response?.data?.message || 'Bulk dispatch failed',
      });
    } finally {
      setSending(false);
    }
  };

  const handleRemoveGenerated = (idx) => {
    const updated = [...generatedEmails];
    updated.splice(idx, 1);
    setGeneratedEmails(updated);
  };

  const handleToggleApprove = (idx) => {
    const updated = [...generatedEmails];
    updated[idx].isApproved = !updated[idx].isApproved;
    setGeneratedEmails(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Bulk Cold Outreach</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review top matched opportunities, generate tailored emails in batch, and send with built-in daily quota safety
          </p>
        </div>

        {/* Sender Email selector in header */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Sender Email</span>
            {senders.length > 0 ? (
              <select
                value={selectedSenderEmail}
                onChange={(e) => setSelectedSenderEmail(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-teal-800"
              >
                {senders.map((s) => (
                  <option key={s._id} value={s.emailAddress}>
                    {s.emailAddress}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-bold text-slate-800">{user?.email}</span>
            )}
          </div>

          {generatedEmails.length > 0 && (
            <button
              onClick={handleBulkSend}
              disabled={sending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
            >
              {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending Outreach...' : `Send Approved Emails (${generatedEmails.filter((e) => e.isApproved).length})`}
            </button>
          )}
        </div>
      </div>

      {feedback.msg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Step 1: Select Matching Jobs */}
      {generatedEmails.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Step 1: Select Opportunities</h3>
              <p className="text-xs text-slate-500">Pick which roles you want to target with personalized emails</p>
            </div>

            <button
              onClick={handleBulkGenerate}
              disabled={generating || selectedJobIds.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? 'Generating Unique Emails...' : `Generate Emails (${selectedJobIds.length})`}
            </button>
          </div>

          {loadingJobs ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading candidate jobs...</div>
          ) : jobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedJobIds.length === jobs.length && jobs.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedJobIds(jobs.map((j) => j.job?._id).filter(Boolean));
                          else setSelectedJobIds([]);
                        }}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                    <th className="p-3">Role & Company</th>
                    <th className="p-3">Location / Work Mode</th>
                    <th className="p-3">Recruiter</th>
                    <th className="p-3">Match Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((item) => {
                    const isSelected = selectedJobIds.includes(item.job?._id);
                    return (
                      <tr
                        key={item.matchId || item.job?._id}
                        className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-teal-50/30' : ''}`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(item.job?._id)}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                        </td>
                        <td className="p-3 font-semibold text-slate-900">
                          <div>{item.job?.title}</div>
                          <div className="text-[11px] font-normal text-slate-500">{item.job?.company}</div>
                        </td>
                        <td className="p-3 text-slate-600">
                          {item.job?.location} ({item.job?.workMode})
                        </td>
                        <td className="p-3 text-slate-600">
                          {item.job?.recruiterId?.name || 'Talent Acquisition Team'}
                        </td>
                        <td className="p-3">
                          <MatchScoreBadge score={item.score} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">No matching jobs found.</div>
          )}
        </div>
      )}

      {/* Step 2: Review Generated Queue */}
      {generatedEmails.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Step 2: Review & Approve Queue</h3>
              <p className="text-xs text-slate-500">
                Inspect, tweak, and approve each generated message before sending from <span className="font-bold text-teal-800">{selectedSenderEmail}</span>
              </p>
            </div>

            <button
              onClick={() => setGeneratedEmails([])}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ← Back to job selection
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="p-3 w-10">Approve</th>
                  <th className="p-3">Target Role & Company</th>
                  <th className="p-3">Recruiter Contact</th>
                  <th className="p-3">Subject Line Preview</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {generatedEmails.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={item.isApproved}
                        disabled={item.status === 'sent'}
                        onChange={() => handleToggleApprove(idx)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 disabled:opacity-40"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.company}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{item.recruiterName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.recruiterEmail}</div>
                    </td>
                    <td className="p-3 max-w-xs truncate text-slate-700 font-medium">
                      {item.subject}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'sent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.isApproved
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status === 'sent' ? 'Sent ✓' : item.isApproved ? 'Approved' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingItem({ ...item, index: idx })}
                          className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded-lg"
                          title="Preview & Edit Body"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveGenerated(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Single Message Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                Edit Email to {editingItem.recruiterName} ({editingItem.company})
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={editingItem.subject}
                  onChange={(e) => setEditingItem({ ...editingItem, subject: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Body</label>
                <textarea
                  rows={10}
                  value={editingItem.body}
                  onChange={(e) => setEditingItem({ ...editingItem, body: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-800"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const updated = [...generatedEmails];
                  updated[editingItem.index] = {
                    ...updated[editingItem.index],
                    subject: editingItem.subject,
                    body: editingItem.body,
                    isApproved: true,
                  };
                  setGeneratedEmails(updated);
                  setEditingItem(null);
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
