import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Award,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchCurrentResume();
  }, []);

  const fetchCurrentResume = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resumes/current');
      if (res.data.success && res.data.resume) {
        setResumeData(res.data.resume);
        setProfile(res.data.resume.parsedProfile);
      }
    } catch (err) {
      // No resume yet
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0] || file;
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('resume', selectedFile);

    setUploading(true);
    setFeedback({ type: '', msg: '' });

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setResumeData(res.data.resume);
        setProfile(res.data.resume.parsedProfile);
        setFeedback({ type: 'success', msg: 'Resume successfully parsed by AI!' });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to parse resume file',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!resumeData?._id) return;
    try {
      const res = await api.put(`/resumes/${resumeData._id}`, { parsedProfile: profile });
      if (res.data.success) {
        setFeedback({ type: 'success', msg: 'Candidate profile updated successfully!' });
        setTimeout(() => setFeedback({ type: '', msg: '' }), 3000);
      }
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Failed to update profile' });
    }
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim() || !profile) return;
    setProfile({
      ...profile,
      skills: [...(profile.skills || []), newSkill.trim()],
    });
    setNewSkill('');
  };

  const removeSkill = (index) => {
    const updated = [...profile.skills];
    updated.splice(index, 1);
    setProfile({ ...profile, skills: updated });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Resume & Profile AI</h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload your resume (PDF or DOCX). AI will extract skills, experience, and structure your candidate profile.
          </p>
        </div>

        {profile && (
          <button
            onClick={handleSaveProfile}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Save Profile Changes
          </button>
        )}
      </div>

      {feedback.msg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-400 transition-colors text-center">
        <UploadCloud className="w-10 h-10 text-teal-600 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 text-sm">
          {resumeData ? `Active Resume: ${resumeData.fileName}` : 'Upload your Resume'}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
          Accepts PDF and DOCX files up to 10MB.
        </p>

        <div className="flex items-center justify-center gap-3">
          <label className="cursor-pointer px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Select Resume File</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {uploading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-teal-700 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Extracting text and analyzing candidate profile with AI...</span>
          </div>
        )}
      </div>

      {/* Structured Profile Editor */}
      {profile && (
        <div className="space-y-6">
          {/* Resume-Powered Flow Banner */}
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[10px] mb-2 border border-teal-400/30">
                <Sparkles className="w-3 h-3" />
                Resume Integrated with AI Engine
              </div>
              <h3 className="font-extrabold text-base text-white">Your Profile is Ready for Job Automation!</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                Your extracted skills ({profile.skills?.length || 0}), experience ({profile.yearsOfExperience || 0} yrs), and target role will now power your search sweeps and personalized cold emails.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                to="/saved-searches"
                className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all"
              >
                ✨ Set Up Search Sweeps
              </Link>
              <Link
                to="/jobs"
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs transition-all"
              >
                🔍 View Matched Jobs
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Structured Candidate Profile
              </h3>
              <span className="text-[11px] text-slate-400">All fields verified by AI</span>
            </div>

          {/* Primary details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone</label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Location</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Title</label>
              <input
                type="text"
                value={profile.title || 'Software Engineer'}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Years of Experience</label>
              <input
                type="number"
                value={profile.yearsOfExperience ?? 3}
                onChange={(e) => setProfile({ ...profile, yearsOfExperience: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-semibold"
              />
            </div>
          </div>

          {/* Skills chips */}
          <div>
            <label className="font-bold text-slate-700 block mb-2">Technical Skills & Tools</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(profile.skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 px-3 py-1 rounded-lg border border-teal-200 text-xs font-semibold"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="text-teal-500 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={addSkill} className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add skill (e.g. Kubernetes, Redis)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-900"
              >
                Add
              </button>
            </form>
          </div>

          {/* Experience Timeline */}
          <div>
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-500" />
              Work Experience
            </h4>
            <div className="space-y-3">
              {(profile.experience || []).map((exp, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{exp.title} at {exp.company}</span>
                    <span className="text-slate-500 font-medium">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-500" />
              Education
            </h4>
            <div className="space-y-2">
              {(profile.education || []).map((edu, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between">
                  <span className="font-bold text-slate-800">{edu.degree} — {edu.institution}</span>
                  <span className="text-slate-500">{edu.year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Projects & Achievements */}
          {profile.projects?.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-500" />
                Featured Projects
              </h4>
              <div className="space-y-2">
                {profile.projects.map((proj, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block">{proj.name}</span>
                    <p className="text-slate-600 mt-1">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
