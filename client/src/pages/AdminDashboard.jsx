import React, { useState, useEffect } from 'react';
import {
  Shield,
  Crown,
  Users,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  UserX,
  UserCheck,
  Zap,
  Trash2,
  RotateCcw,
  Mail,
  Send,
  FileText,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    proUsers: 0,
    basicUsers: 0,
    suspendedUsers: 0,
    deletedUsers: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchUsers();
  }, [planFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          search: searchTerm.trim() || undefined,
          plan: planFilter !== 'all' ? planFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
      });

      if (res.data.success) {
        setMetrics(res.data.metrics || {});
        setUsers(res.data.users || []);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to load users. Administrator access required.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (targetUser, newPlan) => {
    setActionLoadingId(targetUser._id);
    setFeedback({ type: '', msg: '' });
    try {
      const res = await api.post(`/admin/users/${encodeURIComponent(targetUser._id)}/plan`, {
        plan: newPlan,
      });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          msg: `User "${targetUser.email}" plan successfully updated to ${newPlan.toUpperCase()}`,
        });
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Failed to update user plan' });
    } finally {
      setActionLoadingId('');
    }
  };

  const handleRoleChange = async (targetUser, newRole) => {
    if (!window.confirm(`Are you sure you want to change role of ${targetUser.email} to ${newRole.toUpperCase()}?`)) return;
    setActionLoadingId(targetUser._id);
    try {
      const res = await api.post(`/admin/users/${encodeURIComponent(targetUser._id)}/role`, {
        role: newRole,
      });
      if (res.data.success) {
        setFeedback({ type: 'success', msg: `User "${targetUser.email}" role updated to ${newRole.toUpperCase()}` });
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Failed to update role' });
    } finally {
      setActionLoadingId('');
    }
  };

  const handleToggleSuspend = async (targetUser) => {
    const action = targetUser.isSuspended ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} user ${targetUser.email}?`)) return;

    setActionLoadingId(targetUser._id);
    try {
      const res = await api.post(`/admin/users/${encodeURIComponent(targetUser._id)}/suspend`);
      if (res.data.success) {
        setFeedback({ type: 'success', msg: res.data.message });
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Failed to change suspension' });
    } finally {
      setActionLoadingId('');
    }
  };

  const handleToggleSoftDelete = async (targetUser) => {
    const action = targetUser.isDeleted ? 'restore' : 'soft delete';
    if (!window.confirm(`Are you sure you want to ${action} user ${targetUser.email}?`)) return;

    setActionLoadingId(targetUser._id);
    try {
      const res = await api.post(`/admin/users/${encodeURIComponent(targetUser._id)}/soft-delete`);
      if (res.data.success) {
        setFeedback({ type: 'success', msg: res.data.message });
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Failed to toggle delete status' });
    } finally {
      setActionLoadingId('');
    }
  };

  const handleResetPreview = async (targetUser) => {
    setActionLoadingId(targetUser._id);
    try {
      const res = await api.post(`/admin/users/${encodeURIComponent(targetUser._id)}/reset-preview`);
      if (res.data.success) {
        setFeedback({ type: 'success', msg: `Preview quota reset for ${targetUser.email}` });
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Failed to reset preview quota' });
    } finally {
      setActionLoadingId('');
    }
  };

  const handleDismissUpgrade = async (targetUser) => {
    setActionLoadingId(targetUser._id);
    try {
      const res = await api.post(`/admin/users/${encodeURIComponent(targetUser._id)}/dismiss-upgrade`);
      if (res.data.success) {
        setFeedback({ type: 'success', msg: `Upgrade request from ${targetUser.email} dismissed.` });
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Failed to dismiss request' });
    } finally {
      setActionLoadingId('');
    }
  };

  const pendingUpgradeUsers = users.filter((u) => u.upgradeRequested && u.plan !== 'pro' && !u.isDeleted);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-black mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>ADMINISTRATOR CONTROL CENTER</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">User Management & Subscription Control</h2>
          <p className="text-xs text-slate-300 mt-1">
            Grant or revoke PRO access, review upgrade requests, suspend accounts, and inspect candidate activity
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback.msg && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', msg: '' })} className="text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Total Users</span>
          <div className="text-xl font-black text-slate-900 mt-1">{metrics.totalUsers || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">PRO Members</span>
            <Crown className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-900 mt-1">{metrics.proUsers || 0}</div>
        </div>

        {/* Upgrade Requests Metric Card */}
        <div
          onClick={() => setStatusFilter('upgrade_requested')}
          className="bg-white p-4 rounded-2xl border border-teal-300 bg-teal-50/30 shadow-xs cursor-pointer hover:border-teal-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">PRO Requests</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-black text-teal-900 mt-1 flex items-center gap-2">
            <span>{metrics.upgradeRequestsCount || 0}</span>
            {(metrics.upgradeRequestsCount || 0) > 0 && (
              <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full animate-pulse">
                PENDING
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Basic Users</span>
          <div className="text-xl font-black text-slate-800 mt-1">{metrics.basicUsers || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Suspended</span>
          <div className="text-xl font-black text-rose-800 mt-1">{metrics.suspendedUsers || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Soft-Deleted</span>
          <div className="text-xl font-black text-slate-500 mt-1">{metrics.deletedUsers || 0}</div>
        </div>
      </div>

      {/* Dedicated Section: Pending PRO Upgrade Requests */}
      {pendingUpgradeUsers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-emerald-500/10 border-2 border-amber-400/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500 text-slate-900 rounded-xl shadow-xs">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Pending PRO Upgrade Requests</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-xs">
                    {pendingUpgradeUsers.length} Action Required
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  These candidates submitted a request to unlock PRO features (Bulk Email, Recruiter Finder). Review & grant access below:
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingUpgradeUsers.map((reqUser) => {
              const isActionLoading = actionLoadingId === reqUser._id;
              const formattedDate = reqUser.upgradeRequestedAt
                ? new Date(reqUser.upgradeRequestedAt).toLocaleString()
                : 'Recently';

              return (
                <div
                  key={reqUser._id}
                  className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {reqUser.name ? reqUser.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{reqUser.name || 'Candidate'}</span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            Basic
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-500">{reqUser.email}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {formattedDate}
                    </span>
                  </div>

                  {reqUser.upgradeRequestNote && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 italic">
                      "{reqUser.upgradeRequestNote}"
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                    <span>
                      Resume: <strong>{reqUser.resumeTitle || 'No Resume'}</strong>
                    </span>
                    <span>
                      Sent: <strong>{reqUser.emailsSent || 0} emails</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => handlePlanChange(reqUser, 'pro')}
                      className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Crown className="w-3.5 h-3.5 text-slate-900" />
                      <span>{isActionLoading ? 'Upgrading...' : 'Grant PRO Access (1-Click)'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => handleDismissUpgrade(reqUser)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchUsers();
          }}
          className="relative flex-1"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-teal-500"
          />
        </form>

        <div className="flex items-center gap-2">
          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
          >
            <option value="all">All Plans</option>
            <option value="pro">PRO Only</option>
            <option value="basic">Basic Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="upgrade_requested">⭐ PRO Requests ({metrics.upgradeRequestsCount || 0})</option>
            <option value="active">Active Accounts</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Soft-Deleted</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role & Status</th>
                <th className="py-3 px-4">Current Plan</th>
                <th className="py-3 px-4">Activity & Limits</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
                    <span>Loading platform users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isLoading = actionLoadingId === u._id;
                  const isCurrentAdmin = u.role === 'admin';
                  const isSuspended = u.isSuspended || u.status === 'suspended';
                  const isDeleted = u.isDeleted || u.status === 'deleted';

                  return (
                    <tr
                      key={u._id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isDeleted ? 'bg-slate-50/50 opacity-60' : isSuspended ? 'bg-rose-50/20' : u.upgradeRequested ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-900 block truncate">{u.name || 'No Name'}</span>
                            <span className="text-[11px] text-slate-500 font-mono block truncate">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {isCurrentAdmin && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200">
                              <Shield className="w-3 h-3" />
                              ADMIN
                            </span>
                          )}

                          {u.upgradeRequested && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              PRO REQUESTED
                            </span>
                          )}

                          {isDeleted ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                              DELETED
                            </span>
                          ) : isSuspended ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                              SUSPENDED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Plan Column */}
                      <td className="py-3 px-4">
                        {u.plan === 'pro' || isCurrentAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                            <Crown className="w-3.5 h-3.5 text-amber-600" />
                            PRO PLAN
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            BASIC PLAN
                          </span>
                        )}
                      </td>

                      {/* Activity & Limits */}
                      <td className="py-3 px-4 text-[11px] text-slate-600 space-y-0.5">
                        <div>
                          <strong>Limit:</strong> {u.dailyEmailLimit || 5} emails/day
                        </div>
                        <div>
                          <strong>Sent:</strong> {u.emailsSent || 0} outreach logs
                        </div>
                        <div>
                          <strong>Previews Used:</strong> {u.aiGenerationsCount || 0} / 1
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Plan Toggle Button */}
                          {u.plan === 'pro' ? (
                            <button
                              type="button"
                              disabled={isLoading || isCurrentAdmin}
                              onClick={() => handlePlanChange(u, 'basic')}
                              title="Demote to Basic plan"
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors disabled:opacity-40"
                            >
                              Set Basic
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handlePlanChange(u, 'pro')}
                              title="Upgrade user to PRO"
                              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[11px] font-bold shadow-xs transition-all disabled:opacity-40"
                            >
                              ⭐ Make PRO
                            </button>
                          )}

                          {/* Suspend Toggle Button */}
                          <button
                            type="button"
                            disabled={isLoading || u._id === user?.id}
                            onClick={() => handleToggleSuspend(u)}
                            title={isSuspended ? 'Reactivate account' : 'Suspend account'}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-40 ${
                              isSuspended
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            {isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>

                          {/* Soft Delete Toggle Button */}
                          <button
                            type="button"
                            disabled={isLoading || u._id === user?.id}
                            onClick={() => handleToggleSoftDelete(u)}
                            title={isDeleted ? 'Restore account' : 'Soft delete account'}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
                          >
                            {isDeleted ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>

                          {/* Reset Preview Quota */}
                          {(u.aiGenerationsCount || 0) > 0 && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleResetPreview(u)}
                              title="Reset 1-preview quota"
                              className="px-2 py-1 rounded-lg bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200 hover:bg-teal-100"
                            >
                              Reset Preview
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
