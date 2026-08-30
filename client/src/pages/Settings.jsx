import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sparkles, User, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateSettings } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [dailyLimit, setDailyLimit] = useState(user?.dailyEmailLimit || 20);
  const [autoSend, setAutoSend] = useState(user?.autoSendEnabled || false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

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
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Account & Platform Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your candidate profile details, outreach preferences, and safety limits
        </p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

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
            <p className="text-[11px] text-slate-400 mt-1">Recommended: 15-25 emails/day for safety.</p>
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
            <p className="text-slate-600">✓ Job Sources: Greenhouse, Lever, Career Portals & Aggregators</p>
            <p className="text-slate-600">✓ Node-Cron Scheduler: Runs sweeps daily at 8:00 AM</p>
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
    </div>
  );
}
