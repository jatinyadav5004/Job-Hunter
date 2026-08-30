import React from 'react';

export default function MatchScoreBadge({ score, size = 'md', showLabel = true }) {
  const getBadgeStyle = (val) => {
    if (val >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
    if (val >= 80) return 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-600/20';
    if (val >= 70) return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
    if (val >= 60) return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
    return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1 font-semibold',
    lg: 'text-base px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ring-inset ${getBadgeStyle(
        score
      )} ${sizeClasses[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {score}% {showLabel && 'Match'}
    </span>
  );
}
