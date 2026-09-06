import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  User,
  Save,
  CheckCircle2,
  Crown,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from '../components/UpgradeModal';

export default function Settings() {
  const { user, isPro, updateSettings } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [dailyLimit, setDailyLimit] = useState(user?.dailyEmailLimit || (isPro ? 50 : 5));
  const [autoSend, setAutoSend] = useState(user?.autoSendEnabled || false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await updateSettings({
        name,
        dailyEmailLimit: Number(dailyLimit),
        autoSendEnabled: autoSend,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Account & Platform Settings</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your candidate profile details, subscription plan, and outreach preferences
          </p>
        </div>

        <button
          type="button"
          onClick={() => setUpgradeModalOpen(true)}
          className={`px-4 py-2 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all ${
            isPro
              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20'
          }`}
        >
          <Crown className={`w-3.5 h-3.5 ${isPro ? 'text-amber-600' : 'text-amber-300'}`} />
          <span>{isPro ? 'Manage PRO Plan' : 'Upgrade to PRO'}</span>
        </button>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Subscription Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Crown className={`w-4 h-4 ${isPro ? 'text-amber-500' : 'text-slate-400'}`} />
            Subscription & Membership Tier
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isPro
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {isPro ? '👑 PRO Tier Active' : 'Basic Tier (Free)'}
          </span>
        </div>

        <p className="text-slate-500 leading-relaxed">
          {isPro
            ? 'You have unrestricted access to Bulk AI Cold Outreach, Live LinkedIn Recruiter Discovery, and priority job indexing.'
            : 'You are currently on the Basic plan. Upgrade to unlock bulk mail applications, live recruiter discovery, and corporate inboxes.'}
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setUpgradeModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isPro ? 'Switch or Review Plan' : 'View PRO Benefits & Upgrade'}</span>
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-teal-600" />
            User Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-teal-600" />
            Outreach Safety Controls
          </h3>

          <div className="max-w-sm">
            <label className="font-bold text-slate-700 block mb-1">
              Max Daily Cold Emails (Quota Limit)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-bold"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {isPro
                ? 'PRO limit: up to 100 emails/day.'
                : 'Basic limit: recommended 5 emails/day.'}
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="autoSendCheck"
              checked={autoSend}
              onChange={(e) => setAutoSend(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="autoSendCheck" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-bold text-slate-900 block">Optional Automatic Outreach Sending</span>
              Automatically send generated emails when a job match exceeds 90%, subject to your daily sending limit.
              (Default: Manual review required).
            </label>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-teal-600" />
            AI & Automation Engine
          </h3>

          <div className="p-4 bg-teal-50/60 border border-teal-100 rounded-xl space-y-1.5 text-xs text-teal-950">
            <p className="font-bold">✓ AI Engine: Configured with Gemini 1.5 Flash / OpenAI</p>
            <p className="text-slate-600">✓ Job Discovery: RapidAPI JSearch, Greenhouse, Lever</p>
            <p className="text-slate-600">✓ Inactivity Auto-Logout: Configured with 24-hour limit</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      <UpgradeModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
    </div>
  );
}
