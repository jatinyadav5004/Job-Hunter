import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  Users,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Send,
  Sparkles,
  ShieldCheck,
  Globe,
  RefreshCw,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import api from '../services/api';

const POPULAR_COMPANIES = [
  'Google',
  'Microsoft',
  'Razorpay',
  'Swiggy',
  'Stripe',
  'Flipkart',
  'Zomato',
  'PhonePe',
  'CRED',
  'Groww',
  'TCS',
  'Infosys',
  'Amazon',
];

export default function Recruiters() {
  const navigate = useNavigate();
  const [companyInput, setCompanyInput] = useState('Razorpay');
  const [roleInput, setRoleInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [companyDomain, setCompanyDomain] = useState('');
  const [copiedEmail, setCopiedEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (targetCompany = companyInput) => {
    if (!targetCompany.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.get('/recruiters/search', {
        params: {
          company: targetCompany.trim(),
          role: roleInput.trim() || undefined,
        },
      });

      if (res.data.success) {
        setEmployees(res.data.employees || []);
        setCompanyDomain(res.data.domain || '');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to search employee emails');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(''), 2000);
  };

  const handleOutreach = (person) => {
    navigate('/cold-email', {
      state: {
        selectedJob: {
          company: person.companyName,
          title: person.title.includes('Recruiter') ? 'Open Position' : person.title,
          recruiterId: {
            name: person.name,
            email: person.email,
          },
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Recruiter & Employee Email Finder
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Search any company to discover employee names, corporate email addresses, and LinkedIn profiles for direct outreach
          </p>
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          {/* Company Input */}
          <div className="sm:col-span-6 relative">
            <label className="font-extrabold text-slate-700 block mb-1">Company Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Google, Razorpay, Stripe, Swiggy..."
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-4 relative">
            <label className="font-extrabold text-slate-700 block mb-1">Target Position / Title (Optional)</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Recruiter, Talent Acquisition, CTO..."
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? 'Finding...' : 'Find Emails'}
            </button>
          </div>
        </form>

        {/* Quick Company Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Popular companies:</span>
          {POPULAR_COMPANIES.map((comp) => (
            <button
              key={comp}
              type="button"
              onClick={() => {
                setCompanyInput(comp);
                handleSearch(comp);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-slate-200 text-slate-600 text-[11px] font-medium transition-colors"
            >
              {comp}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Header */}
      {employees.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">
              {employees.length} Verified Roles at {companyInput}
            </span>
            {companyDomain && (
              <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
                Domain: {companyDomain}
              </span>
            )}
          </div>

          <a
            href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${companyInput} (recruiter OR "talent acquisition" OR "human resources")`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold hover:bg-blue-100 text-xs transition-colors shrink-0"
          >
            <span>Search All Live {companyInput} Recruiters on LinkedIn</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Employee & Recruiter Cards Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">
            Searching LinkedIn, Google index & corporate email records for {companyInput}...
          </p>
        </div>
      ) : employees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((person) => (
            <div
              key={person._id || person.email}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{person.name}</h3>
                    <p className="text-xs font-semibold text-teal-800">{person.title}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{person.companyName}</p>
                  </div>

                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    {person.confidenceScore}% Valid
                  </span>
                </div>

                {/* Email Chip */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 my-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-mono text-xs font-bold text-slate-800 truncate">{person.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(person.email)}
                    className="text-slate-400 hover:text-slate-700 shrink-0"
                    title="Copy Email"
                  >
                    {copiedEmail === person.email ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${person.companyName || companyInput} ${person.title || 'Recruiter'}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <span>View on LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => handleOutreach(person)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Cold Email</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Search any company to find employee emails</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Type any target company above (e.g. Razorpay, Swiggy, Google) to discover talent leads and corporate email addresses.
          </p>
          <button
            type="button"
            onClick={() => handleSearch('Razorpay')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs"
          >
            Search Example (Razorpay)
          </button>
        </div>
      )}
    </div>
  );
}
