import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Building2,
  Mail,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  UploadCloud,
  Layers,
  Crown,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from '../components/UpgradeModal';

export default function ColdEmailGenerator() {
  const { user, isPro } = useAuth();
  const location = useLocation();
  const passedJob = location.state?.selectedJob;

  const [senders, setSenders] = useState([]);
  const [selectedSenderEmail, setSelectedSenderEmail] = useState(user?.email || '');

  // Active Resume Profile State
  const [activeResume, setActiveResume] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const [jobTitle, setJobTitle] = useState(passedJob?.title || '');
  const [company, setCompany] = useState(passedJob?.company || '');
  const [recruiterName, setRecruiterName] = useState(passedJob?.recruiterId?.name || '');
  const [recruiterEmail, setRecruiterEmail] = useState(passedJob?.recruiterId?.email || '');
  const [context, setContext] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [versionTab, setVersionTab] = useState('normal'); // 'normal' | 'short'

  const [generatedData, setGeneratedData] = useState(null);
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchSenders();
    fetchCurrentResume();
    if (passedJob) {
      handleGenerate();
    }
  }, []);

  const fetchSenders = async () => {
    try {
      const res = await api.get('/email/senders');
      if (res.data.success && res.data.senders?.length > 0) {
        setSenders(res.data.senders);
        const def = res.data.senders.find((s) => s.isDefault) || res.data.senders[0];
        setSelectedSenderEmail(def.emailAddress);
      }
    } catch (err) {
      // ignore
    }
  };

  const fetchCurrentResume = async () => {
    try {
      const res = await api.get('/resumes/current');
      if (res.data.success && res.data.resume) {
        setActiveResume(res.data.resume);
      }
    } catch (err) {
      // No resume yet
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    setStatusMessage({ type: '', msg: '' });

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setActiveResume(res.data.resume);
        setStatusMessage({
          type: 'success',
          msg: `Resume "${res.data.resume.fileName}" parsed! Cold emails will now cite your projects & skills.`,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to upload and parse resume',
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: '', msg: '' });

    try {
      const res = await api.post('/cold-email/generate', {
        jobId: passedJob?._id,
        customJobTitle: jobTitle,
        customCompany: company,
        recruiterName,
        recruiterEmail,
        context,
      });

      if (res.data.success) {
        const data = res.data.data;
        setGeneratedData(data);
        setSubject(data.subject);
        setEmailBody(data.normalVersion);
        setVersionTab('normal');
      }
    } catch (err) {
      if (err.response?.data?.isProRequired || err.response?.data?.limitReached) {
        setUpgradeModalOpen(true);
      }
      setStatusMessage({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to generate cold email with AI',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setVersionTab(tab);
    if (generatedData) {
      setEmailBody(tab === 'normal' ? generatedData.normalVersion : generatedData.shortVersion);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = async () => {
    if (!recruiterEmail) {
      setStatusMessage({ type: 'error', msg: 'Please provide a valid recruiter email address' });
      return;
    }

    setSending(true);
    setStatusMessage({ type: '', msg: '' });

    try {
      const res = await api.post('/cold-email/send', {
        jobId: passedJob?._id,
        senderEmail: selectedSenderEmail,
        recipientEmail: recruiterEmail,
        recipientName,
        companyName: company,
        subject,
        body: emailBody,
        versionType: versionTab,
      });

      if (res.data.success) {
        setStatusMessage({
          type: 'success',
          msg: `Cold email sent from ${res.data.data.senderEmail} to ${recruiterEmail}! (Remaining quota today: ${res.data.data.remainingToday})`,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to send cold email',
      });
    } finally {
      setSending(false);
    }
  };

  const candidateProfile = activeResume?.parsedProfile;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Cold Email Generator</h2>
          <p className="text-xs text-slate-500 mt-1">
            Personalized, high-conversion outreach grounded directly in your uploaded resume
          </p>
        </div>
      </div>

      {/* Resume Integration Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm text-white">
                {activeResume ? `Resume: ${activeResume.fileName}` : 'No Resume Uploaded Yet'}
              </span>
              {activeResume && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  ✓ AI-Synced
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {candidateProfile
                ? `Writing as ${candidateProfile.name || user?.name} (${candidateProfile.title || 'Engineer'}) • Top skills: ${(candidateProfile.skills || []).slice(0, 4).join(', ')}`
                : 'Upload your resume so the AI can cite your real projects, skills, and background.'}
            </p>
          </div>
        </div>

        {/* Upload / Switch Resume Button */}
        <div className="shrink-0">
          <label className="cursor-pointer px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all inline-flex items-center gap-2">
            {uploadingResume ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>{uploadingResume ? 'Parsing...' : (activeResume ? 'Switch Resume' : 'Upload Resume')}</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              disabled={uploadingResume}
              onChange={handleResumeUpload}
            />
          </label>
        </div>
      </div>

      {statusMessage.msg && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.msg}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-teal-600" />
            Target Opportunity & Recruiter
          </h3>

          <form onSubmit={handleGenerate} className="space-y-3.5">
            {/* Sender Email Picker */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Send From (Your Email Address)
              </label>
              {senders.length > 0 ? (
                <select
                  value={selectedSenderEmail}
                  onChange={(e) => setSelectedSenderEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold text-teal-800"
                >
                  {senders.map((s) => (
                    <option key={s._id} value={s.emailAddress}>
                      {s.emailAddress} {s.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="email"
                  value={selectedSenderEmail}
                  onChange={(e) => setSelectedSenderEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold"
                />
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Job Title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Company</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Razorpay, Swiggy, Google"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Recruiter Name</label>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Recruiter Email</label>
                <input
                  type="email"
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  placeholder="sarah.jenkins@company.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Specific Hook or Custom Angle (Optional)
              </label>
              <textarea
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. I saw you just launched your payments SDK; I built a similar system at my last role..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-medium resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Drafting tailored outreach with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Personalized Cold Email</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-600" />
                Personalized Outreach Draft
              </h3>

              {generatedData && (
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => handleTabChange('normal')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      versionTab === 'normal'
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Standard (3-Para)
                  </button>
                  <button
                    onClick={() => handleTabChange('short')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      versionTab === 'short'
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Executive (Concise)
                  </button>
                </div>
              )}
            </div>

            {/* Generated Email Content */}
            {generatedData ? (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Body
                  </label>
                  <textarea
                    rows={11}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 leading-relaxed focus:bg-white resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-slate-400 space-y-3">
                <Sparkles className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="font-bold text-slate-700 text-sm">No email generated yet</h4>
                <p className="text-xs max-w-sm mx-auto text-slate-500">
                  Fill in your target opportunity details on the left and click "Generate" to create a custom cold email based on your resume.
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          {generatedData && (
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Email'}</span>
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !recruiterEmail}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{sending ? 'Sending...' : 'Send Outreach Email'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        featureName="Unlimited AI Cold Outreach"
      />
    </div>
  );
}
