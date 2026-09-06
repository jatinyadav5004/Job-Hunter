import React, { useState, useEffect } from 'react';
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
  Plus,
  Globe,
  RefreshCw,
  AlertCircle,
  Briefcase,
  UserCheck,
  X,
  Crown,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProFeatureLock from '../components/ProFeatureLock';

const POPULAR_COMPANIES = [
  'Razorpay',
  'Swiggy',
  'Google',
  'Microsoft',
  'Stripe',
  'Flipkart',
  'Zomato',
  'PhonePe',
  'CRED',
  'Groww',
  'TCS',
  'Infosys',
  'Marriott',
  'Taj Hotels',
];

export default function Recruiters() {
  const navigate = useNavigate();
  const { isPro } = useAuth();
  const [companyInput, setCompanyInput] = useState('Razorpay');
  const [roleInput, setRoleInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add Contact Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    companyName: '',
    name: '',
    title: 'Technical Recruiter',
    email: '',
    linkedinUrl: '',
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  useEffect(() => {
    if (isPro) {
      handleSearch('Razorpay');
    }
  }, [isPro]);

  if (!isPro) {
    return (
      <ProFeatureLock
        title="Recruiter & Hiring Lead Finder"
        description="Search active recruiters, talent acquisition leads, and hiring managers with live targeted LinkedIn searches and verified corporate inboxes."
        featurePills={[
          'Live LinkedIn Talent Launchers',
          'Official Corporate Inboxes',
          'Verified Contact Storage',
          '1-Click Cold Email Outreach',
        ]}
      />
    );
  }

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
        setData(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to search company recruiters');
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
          company: person.companyName || data?.company,
          title: person.title || 'Open Role',
          recruiterId: {
            name: person.name,
            email: person.email,
          },
        },
      },
    });
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.companyName) return;
    setSubmittingAdd(true);

    try {
      const res = await api.post('/recruiters', addForm);
      if (res.data.success) {
        setShowAddModal(false);
        setAddForm({
          companyName: data?.company || '',
          name: '',
          title: 'Technical Recruiter',
          email: '',
          linkedinUrl: '',
        });
        handleSearch(addForm.companyName);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save contact');
    } finally {
      setSubmittingAdd(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Recruiter & Hiring Lead Discovery
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Search active recruiters, talent acquisition leads, and hiring managers with live targeted LinkedIn searches
          </p>
        </div>

        <button
          onClick={() => {
            setAddForm((prev) => ({ ...prev, companyName: data?.company || companyInput }));
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Verified Recruiter
        </button>
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
                placeholder="e.g. Google, Razorpay, Swiggy, Marriott..."
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-4 relative">
            <label className="font-extrabold text-slate-700 block mb-1">Target Department / Role (Optional)</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Technical Recruiter, HRBP, Engineering Manager..."
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
              {loading ? 'Searching...' : 'Find Contacts'}
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

      {/* Results Container */}
      {data && (
        <div className="space-y-6">
          {/* Section 1: Live LinkedIn Recruiter Searches (Real People) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Live LinkedIn Recruiter Search Portals for {data.company}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Launch targeted real-time searches on LinkedIn to connect directly with active recruiters and decision-makers
                </p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-mono">
                {data.domain}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data.linkedinPortals || []).map((portal, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-300 shadow-sm flex flex-col justify-between space-y-3 group transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                        {portal.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {portal.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{portal.description}</p>
                  </div>

                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <span>Search on LinkedIn</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Official Corporate Inboxes */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-600" />
              <span>Official Talent & Careers Inboxes for {data.company}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(data.officialInboxes || []).map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-2"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {item.label}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-slate-800 break-all">{item.email}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.email)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                    >
                      {copiedEmail === item.email ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEmail === item.email ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleOutreach({
                          companyName: data.company,
                          name: `${data.company} Hiring Team`,
                          email: item.email,
                          title: item.label,
                        })
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Email</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Verified Saved Contacts */}
          {data.verifiedContacts && data.verifiedContacts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Contacts in Database ({data.verifiedContacts.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.verifiedContacts.map((person) => (
                  <div
                    key={person._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-extrabold text-sm text-slate-900">{person.name}</h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-teal-800">{person.title}</p>
                      <p className="text-xs text-slate-600 font-mono mt-1">{person.email}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <a
                        href={person.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>LinkedIn</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleOutreach(person)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Email</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Add Verified Recruiter Contact</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={addForm.companyName}
                  onChange={(e) => setAddForm({ ...addForm, companyName: e.target.value })}
                  placeholder="e.g. Swiggy, Google, Razorpay"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Recruiter / Manager Full Name</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Job Title</label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  placeholder="e.g. Lead Technical Recruiter"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Corporate Email Address (Optional)</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. rahul.sharma@company.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">LinkedIn Profile URL (Optional)</label>
                <input
                  type="url"
                  value={addForm.linkedinUrl}
                  onChange={(e) => setAddForm({ ...addForm, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-teal-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all disabled:opacity-50"
                >
                  {submittingAdd ? 'Saving...' : 'Save Recruiter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
