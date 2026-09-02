import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Play,
  Trash2,
  CheckCircle,
  Briefcase,
  MapPin,
  Sparkles,
  DollarSign,
  AlertCircle,
  X,
  RefreshCw,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../services/api';

const MAIN_ROLE_OPTIONS = [
  'Software Engineer / IT',
  'Human Resources (HR)',
  'Marketing & Growth',
  'Product Management',
  'Sales & Business Development',
  'Finance & Operations',
  'UI/UX & Design',
  'Data Science & Analytics',
  'Quality Assurance (QA)',
  'DevOps & Cloud',
];

const MAIN_LOCATION_OPTIONS = [
  'PAN India (All States / Any Location)',
  'Remote / Anywhere',
  'Bangalore (Karnataka)',
  'Delhi NCR (Delhi, Gurgaon, Noida)',
  'Mumbai / Pune (Maharashtra)',
  'Hyderabad (Telangana)',
  'Chennai (Tamil Nadu)',
  'Kolkata (West Bengal)',
  'Ahmedabad (Gujarat)',
  'Jaipur (Rajasthan)',
  'Chandigarh / Mohali',
  'Kochi / Trivandrum (Kerala)',
  'Andhra Pradesh',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Punjab / Haryana',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
  'Global Remote (Worldwide)',
  'USA / North America',
  'Europe / UK',
  'Singapore / Asia',
  'UAE / Middle East',
];

export default function SavedSearches() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [runningSearchId, setRunningSearchId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Selected Roles and Locations (Multi-select dropdown)
  const [selectedRoles, setSelectedRoles] = useState(['Software Engineer / IT']);
  const [selectedLocations, setSelectedLocations] = useState(['PAN India (All States / Any Location)']);

  const [formData, setFormData] = useState({
    skills: '',
    experienceMin: 0,
    experienceMax: 10,
    workModes: ['Remote', 'Hybrid', 'On-site'],
    minSalary: 0,
    currency: 'INR',
    minMatchScore: 60,
    targetCompanies: '',
    excludedCompanies: '',
    excludedKeywords: '',
  });

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/saved-searches');
      if (res.data.success) {
        setSearches(res.data.searches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add role from dropdown
  const handleAddRole = (role) => {
    if (!role) return;
    if (!selectedRoles.includes(role)) {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleRemoveRole = (role) => {
    const updated = selectedRoles.filter((r) => r !== role);
    setSelectedRoles(updated.length > 0 ? updated : ['Software Engineer / IT']);
  };

  // Add location from dropdown
  const handleAddLocation = (loc) => {
    if (!loc) return;
    if (loc.startsWith('PAN India')) {
      setSelectedLocations(['PAN India (All States / Any Location)']);
      return;
    }

    let updated = selectedLocations.filter((l) => !l.startsWith('PAN India'));
    if (!updated.includes(loc)) {
      updated.push(loc);
    }
    setSelectedLocations(updated.length > 0 ? updated : ['PAN India (All States / Any Location)']);
  };

  const handleRemoveLocation = (loc) => {
    const updated = selectedLocations.filter((l) => l !== loc);
    setSelectedLocations(updated.length > 0 ? updated : ['PAN India (All States / Any Location)']);
  };

  const handleCreateSearch = async (e) => {
    e.preventDefault();

    try {
      const profileName = `${selectedRoles.slice(0, 2).join(' & ')} Search`;
      const payload = {
        name: profileName,
        jobTitles: selectedRoles,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        experienceMin: Number(formData.experienceMin) || 0,
        experienceMax: Number(formData.experienceMax) || 15,
        locations: selectedLocations,
        workModes: formData.workModes,
        minSalary: Number(formData.minSalary) || 0,
        currency: formData.currency,
        minMatchScore: Number(formData.minMatchScore) || 60,
        targetCompanies: formData.targetCompanies ? formData.targetCompanies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        excludedCompanies: formData.excludedCompanies ? formData.excludedCompanies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        excludedKeywords: formData.excludedKeywords ? formData.excludedKeywords.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      const res = await api.post('/saved-searches', payload);
      if (res.data.success) {
        setModalOpen(false);
        setFeedbackMsg(`Saved search for [${selectedRoles.join(', ')}] created! Crawler scanning active jobs...`);
        setTimeout(() => setFeedbackMsg(''), 5000);
        fetchSearches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAutoFillFromResume = async () => {
    try {
      const res = await api.get('/resumes/current');
      if (res.data.success && res.data.resume?.parsedProfile) {
        const prof = res.data.resume.parsedProfile;
        
        const titleLower = (prof.title || '').toLowerCase();
        let matchedRole = 'Software Engineer / IT';
        if (titleLower.includes('hr') || titleLower.includes('human resources') || titleLower.includes('talent')) {
          matchedRole = 'Human Resources (HR)';
        } else if (titleLower.includes('market') || titleLower.includes('growth')) {
          matchedRole = 'Marketing & Growth';
        } else if (titleLower.includes('product')) {
          matchedRole = 'Product Management';
        } else if (titleLower.includes('sales') || titleLower.includes('business dev')) {
          matchedRole = 'Sales & Business Development';
        } else if (titleLower.includes('finance') || titleLower.includes('account')) {
          matchedRole = 'Finance & Accounting';
        } else if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux')) {
          matchedRole = 'UI/UX & Product Design';
        } else if (titleLower.includes('data') || titleLower.includes('ai') || titleLower.includes('machine learning')) {
          matchedRole = 'Data Science & AI';
        } else if (titleLower.includes('devops') || titleLower.includes('cloud')) {
          matchedRole = 'DevOps & Cloud Infrastructure';
        }

        setSelectedRoles([matchedRole]);
        
        const exp = prof.yearsOfExperience || 3;
        setFormData(prev => ({
          ...prev,
          skills: (prof.skills || []).slice(0, 8).join(', '),
          experienceMin: Math.max(0, exp - 1),
          experienceMax: exp + 3,
        }));

        setFeedbackMsg('✨ Auto-filled preferences from your uploaded resume!');
        setTimeout(() => setFeedbackMsg(''), 4000);
      } else {
        alert('No uploaded resume found. Please upload your resume on the Resume & Profile page first!');
      }
    } catch (err) {
      alert('Could not fetch resume. Please upload your resume first on the Resume & Profile tab.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this search profile?')) return;
    try {
      await api.delete(`/saved-searches/${id}`);
      fetchSearches();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunNow = async (id) => {
    setRunningSearchId(id);
    try {
      const res = await api.post(`/saved-searches/${id}/run`);
      if (res.data.success) {
        setFeedbackMsg(res.data.message);
        setTimeout(() => setFeedbackMsg(''), 5000);
        fetchSearches();
      }
    } catch (err) {
      setFeedbackMsg('Error running search: ' + err.message);
    } finally {
      setRunningSearchId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Saved Job Searches</h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated crawler runs daily sweeps for your selected roles across PAN India and worldwide
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Search Profile
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Searches List */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading search profiles...</p>
        </div>
      ) : searches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {searches.map((search) => (
            <div
              key={search._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{search.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Min Match: <span className="font-bold text-teal-700">{search.minMatchScore}%</span> • Total Found: <span className="font-bold text-slate-800">{search.totalMatchesFound || 0}</span>
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      search.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {search.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {(search.jobTitles || []).map((t, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-800 text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {(search.locations || []).map((l, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 text-[11px]">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {search.minSalary > 0 ? `Min ₹${(search.minSalary / 100000).toFixed(1)} LPA` : 'Any Salary'} • {search.experienceMin}-{search.experienceMax} yrs exp
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    disabled={runningSearchId === search._id}
                    onClick={() => handleRunNow(search._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold border border-teal-200 transition-colors disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${runningSearchId === search._id ? 'animate-spin' : ''}`} />
                    {runningSearchId === search._id ? 'Scanning Sources...' : 'Run Search Now'}
                  </button>

                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    <span>View Jobs ({search.totalMatchesFound || 0})</span>
                    <span>→</span>
                  </Link>
                </div>

                <button
                  onClick={() => handleDelete(search._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Search"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No saved search profiles</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Create your search profile to automatically crawl job boards across India or globally.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs"
          >
            Create Search Profile
          </button>
        </div>
      )}

      {/* Clean Dropdown Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">New Job Search Profile</h3>
                <p className="text-xs text-slate-500">Choose your role(s) and location(s)</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSearch} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
                {/* Auto-Fill from Resume Quick Button */}
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-xl p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-bold text-teal-950 text-xs">Have an uploaded resume?</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillFromResume}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors shrink-0"
                  >
                    ✨ Auto-Fill from Resume
                  </button>
                </div>

                {/* 1. Target Role Dropdown */}
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-teal-600" />
                      Target Role
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Add multiple if desired</span>
                  </label>

                  {/* Selected Role Tags */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[38px] mb-2">
                    {selectedRoles.map((role, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-teal-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-lg"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(role)}
                          className="text-teal-200 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Role Dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleAddRole(e.target.value);
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="" disabled>
                      -- Select Role to Add (Software Engineer, HR, Marketing...) --
                    </option>
                    {MAIN_ROLE_OPTIONS.map((r, idx) => (
                      <option key={idx} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Target Locations Dropdown with PAN India at Top */}
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      Preferred Location
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">PAN India / Metros</span>
                  </label>

                  {/* Selected Location Tags */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[38px] mb-2">
                    {selectedLocations.map((loc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-slate-800 text-white font-bold text-xs px-2.5 py-0.5 rounded-lg"
                      >
                        {loc}
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(loc)}
                          className="text-slate-400 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Location Dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleAddLocation(e.target.value);
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="" disabled>
                      -- Select Preferred Location (PAN India, Remote, Bangalore...) --
                    </option>
                    {MAIN_LOCATION_OPTIONS.map((loc, idx) => (
                      <option key={idx} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Optional Advanced Filters Toggle */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-700"
                  >
                    <span className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                      Additional Filters (Optional)
                    </span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 animate-in fade-in">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Specific Skills / Keywords (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.skills}
                          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                          placeholder="e.g. React, Node.js, HRIS, SEO, Figma"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Min Experience (yrs)</label>
                          <input
                            type="number"
                            value={formData.experienceMin}
                            onChange={(e) => setFormData({ ...formData, experienceMin: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Max Experience (yrs)</label>
                          <input
                            type="number"
                            value={formData.experienceMax}
                            onChange={(e) => setFormData({ ...formData, experienceMax: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky Mobile-Friendly Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 bg-white rounded-xl text-slate-700 font-bold hover:bg-slate-100 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-all"
                >
                  Save & Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
