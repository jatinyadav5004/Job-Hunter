import React, { useState } from 'react';
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  Users,
  Send,
  ShieldCheck,
  X,
  Flame,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UpgradeModal({ isOpen, onClose, featureName = 'This feature' }) {
  const { user, isPro, requestUpgrade } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleRequest = async () => {
    setLoading(true);
    try {
      await requestUpgrade();
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit request. Please contact your administrator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with gradient banner */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-extrabold mb-3">
            <Crown className="w-3.5 h-3.5" />
            <span>PREMIUM MEMBERSHIP</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Unlock Full Access with JobHunter PRO
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md">
            {featureName} is exclusive to PRO members. PRO access is granted and managed by the platform administrator.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-black text-emerald-800 text-sm">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Request Submitted to Administrator</span>
              </div>
              <p className="leading-relaxed text-emerald-700">
                Your PRO activation request has been logged. The platform administrator will review your account ({user?.email}) and assign PRO privileges.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Basic Tier Card */}
              <div className={`p-4 rounded-2xl border ${!isPro ? 'border-teal-500 bg-teal-50/20 ring-2 ring-teal-500/20' : 'border-slate-200 bg-slate-50/50'} flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Basic Plan</span>
                    {!isPro && (
                      <span className="text-[10px] font-black bg-teal-600 text-white px-2 py-0.5 rounded-full">
                        CURRENT (DEFAULT)
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black text-slate-900 mb-3">Free</div>

                  <ul className="space-y-2 text-[11px] text-slate-600 font-medium">
                    <li className="flex items-center gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Live Job Search & Matching</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>AI Resume Parsing</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Single Cold Email Preview (5/day)</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-400 line-through">
                      <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <span>Bulk AI Email Outreach</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-400 line-through">
                      <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <span>Recruiter & LinkedIn Discovery</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* PRO Tier Card */}
              <div className={`p-4 rounded-2xl border ${isPro ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20' : 'border-teal-600 bg-gradient-to-b from-teal-50/40 to-emerald-50/30'} flex flex-col justify-between relative shadow-sm`}>
                <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-xs">
                  ADMIN ASSIGNED
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-xs text-teal-900 uppercase tracking-wider flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      PRO Plan
                    </span>
                    {isPro && (
                      <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black text-slate-900 mb-3 flex items-baseline gap-1">
                    <span>Full Suite</span>
                    <span className="text-xs text-slate-500 font-normal">access</span>
                  </div>

                  <ul className="space-y-2 text-[11px] text-slate-700 font-semibold">
                    <li className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span><strong>Bulk AI Outreach</strong> (50+ at once)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span><strong>Live LinkedIn Recruiter Discovery</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span><strong>Corporate Domain Inboxes</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span><strong>Unlimited AI Generations</strong></span>
                    </li>
                  </ul>
                </div>

                {!isPro ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleRequest}
                    className="mt-4 w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-300" />
                    {loading ? 'Submitting Request...' : 'Request PRO Activation'}
                  </button>
                ) : (
                  <div className="mt-4 w-full py-2 bg-emerald-100 text-emerald-800 text-center text-xs font-bold rounded-xl">
                    ✓ PRO Plan Active
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-400 text-center">
            🔐 User tiers are managed directly by the platform administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
