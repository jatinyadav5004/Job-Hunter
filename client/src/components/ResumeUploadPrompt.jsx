import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ResumeUploadPrompt({ className = '' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // If user already has an active uploaded resume, don't show the prompt
  if (user?.hasResume || user?.activeResumeId || dismissed) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 sm:p-7 text-white shadow-xl border border-teal-500/30 animate-in fade-in zoom-in-95 duration-200 ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      {/* Dismiss Button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
        title="Dismiss reminder"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACTION RECOMMENDED: NO RESUME UPLOADED</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Upload Your Resume for Accurate AI Job Matching
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You haven't uploaded your resume yet. Upload your <strong>PDF or DOCX</strong> so our AI can automatically extract your core skills, calculate 90%+ match scores on discovered jobs, and auto-generate personalized cold emails.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-semibold text-teal-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Automated Skill Extraction
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Accurate Job Match Scoring
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              AI Cold Email Tailoring
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <UploadCloud className="w-4 h-4 text-slate-950 shrink-0" />
            <span>Upload Resume Now (1-Click)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/saved-searches')}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-300" />
            <span>Set Search Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
