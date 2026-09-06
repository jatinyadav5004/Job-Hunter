import React, { useState } from 'react';
import { Crown, Lock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import UpgradeModal from './UpgradeModal';

export default function ProFeatureLock({
  title = 'PRO Feature Locked',
  description = 'This feature is exclusively available for JobHunter PRO members.',
  featurePills = ['Bulk AI Cold Outreach', 'Live LinkedIn Recruiter Discovery', 'Corporate Inboxes'],
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm my-6 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
        <Crown className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black">
          <Lock className="w-3.5 h-3.5 text-amber-600" />
          <span>PRO SUBSCRIPTION REQUIRED</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {featurePills.map((pill, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>{pill}</span>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-teal-600/25 inline-flex items-center gap-2 transition-all hover:scale-102"
        >
          <Crown className="w-4 h-4 text-amber-300" />
          <span>Upgrade to PRO & Unlock</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <UpgradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} featureName={title} />
    </div>
  );
}
