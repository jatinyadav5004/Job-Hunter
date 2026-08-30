import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import SavedSearches from './pages/SavedSearches';
import ResumeUpload from './pages/ResumeUpload';
import ColdEmailGenerator from './pages/ColdEmailGenerator';
import BulkApply from './pages/BulkApply';
import Applications from './pages/Applications';
import Recruiters from './pages/Recruiters';
import EmailSettings from './pages/EmailSettings';
import About from './pages/About';
import Settings from './pages/Settings';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold text-xs">
        Loading JobHunter AI...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/saved-searches" element={<SavedSearches />} />
            <Route path="/resume" element={<ResumeUpload />} />
            <Route path="/recruiters" element={<Recruiters />} />
            <Route path="/cold-email" element={<ColdEmailGenerator />} />
            <Route path="/bulk-apply" element={<BulkApply />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/email" element={<EmailSettings />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
