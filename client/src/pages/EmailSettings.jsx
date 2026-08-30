import React, { useState, useEffect } from 'react';
import {
  MailCheck,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  Star,
  Send,
  User,
  Mail,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EmailSettings() {
  const { user } = useAuth();
  const [senders, setSenders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const [newEmail, setNewEmail] = useState('');
  const [newSenderName, setNewSenderName] = useState(user?.name || '');
  const [newLimit, setNewLimit] = useState(20);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sendersRes, logsRes] = await Promise.all([
        api.get('/email/senders'),
        api.get('/cold-email/logs'),
      ]);

      if (sendersRes.data.success) {
        setSenders(sendersRes.data.senders || []);
      }
      if (logsRes.data.success) {
        setLogs(logsRes.data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSender = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      const res = await api.post('/email/senders', {
        emailAddress: newEmail.trim(),
        senderName: newSenderName.trim() || user?.name,
        dailyLimit: Number(newLimit),
        setAsDefault,
      });

      if (res.data.success) {
        setFeedback({ type: 'success', msg: `Sender email ${newEmail} added successfully!` });
        setNewEmail('');
        setShowAddForm(false);
        fetchData();
        setTimeout(() => setFeedback({ type: '', msg: '' }), 4000);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to add sender email',
      });
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await api.put(`/email/senders/${id}/default`);
      if (res.data.success) {
        setFeedback({ type: 'success', msg: res.data.message });
        fetchData();
        setTimeout(() => setFeedback({ type: '', msg: '' }), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this sender email address?')) return;
    try {
      await api.delete(`/email/senders/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Sender Email Accounts</h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose which email addresses you want to use for outreach. Add as many personal or work addresses as you like.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Hide Form' : 'Add Another Email Address'}
        </button>
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Add New Sender Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSender}
          className="bg-white p-6 rounded-2xl border-2 border-teal-200/80 shadow-md space-y-4 text-xs animate-in fade-in"
        >
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-teal-600" />
            Add Sender Email Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sender Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. john.work@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Display Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={newSenderName}
                onChange={(e) => setNewSenderName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Daily Limit (Safety)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Set as primary default sender for cold emails</span>
            </label>

            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
            >
              Save Email Address
            </button>
          </div>
        </form>
      )}

      {/* Configured Sender Email List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900">Configured Sender Identities</h3>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 text-teal-600 animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-500">Loading sender accounts...</span>
          </div>
        ) : senders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {senders.map((sender) => (
              <div
                key={sender._id}
                className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between space-y-3 transition-all ${
                  sender.isDefault
                    ? 'bg-gradient-to-br from-white to-teal-50/40 border-teal-300 ring-2 ring-teal-600/10'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{sender.emailAddress}</h4>
                        <p className="text-xs text-slate-500 font-medium">Display Name: {sender.senderName}</p>
                      </div>
                    </div>

                    {sender.isDefault ? (
                      <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Default Sender
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(sender._id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Make Default
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-semibold">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Daily Limit</span>
                      <span className="text-slate-900 font-extrabold">{sender.dailyLimit}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sent Today</span>
                      <span className="text-teal-700 font-extrabold">{sender.sentToday}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Remaining</span>
                      <span className="text-emerald-700 font-extrabold">{sender.remainingToday}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Ready for automated outreach</span>
                  {senders.length > 1 && (
                    <button
                      onClick={() => handleDelete(sender._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">No sender email added yet.</div>
        )}
      </div>

      {/* Outbox Send Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Outbox & Send History</h3>
            <p className="text-xs text-slate-500">Audit log of all cold emails dispatched by JobHunter AI</p>
          </div>
        </div>

        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{log.recipientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{log.recipientEmail}</div>
                    </td>
                    <td className="p-3 max-w-sm truncate text-slate-700 font-medium">
                      {log.subject}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          log.status === 'sent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {log.status === 'sent' ? 'Sent ✓' : 'Failed'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      {new Date(log.sentAt || log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">No outreach emails sent yet.</div>
        )}
      </div>
    </div>
  );
}
