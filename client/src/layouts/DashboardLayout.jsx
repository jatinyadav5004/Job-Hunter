import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  SearchCode,
  History,
  Mail,
  Send,
  Users,
  FileText,
  MailCheck,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  Bell,
  ChevronDown,
  User,
  ShieldCheck,
  HelpCircle,
  Heart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', path: '/jobs', icon: Briefcase },
  { name: 'Saved Searches', path: '/saved-searches', icon: SearchCode },
  { name: 'Recruiter Finder', path: '/recruiters', icon: Users },
  { name: 'Application History', path: '/applications', icon: History },
  { name: 'Cold Email', path: '/cold-email', icon: Mail },
  { name: 'Bulk Apply', path: '/bulk-apply', icon: Send },
  { name: 'Resume & Profile', path: '/resume', icon: FileText },
  { name: 'Email Accounts', path: '/email', icon: MailCheck },
  { name: 'About & Guide', path: '/about', icon: HelpCircle },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = user?.name ? user.name[0].toUpperCase() : 'U';
  const userName = user?.name || 'Candidate';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 shadow-xl lg:shadow-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 sm:px-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                  JobHunter <span className="text-teal-600">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Outreach Platform
                </span>
              </div>
            </div>
            <button
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 sm:p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 tracking-tight truncate max-w-[160px] sm:max-w-none">
              {NAV_ITEMS.find((i) => i.path === location.pathname)?.name || 'JobHunter AI'}
            </h1>
          </div>

          {/* Right Side Header Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auto Search Pill */}
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-3 py-1 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Auto-Search Active
            </div>

            {/* Profile Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 sm:pr-3 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  {userInitial}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-800 max-w-[110px] truncate">
                  {userName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Modal Card */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-extrabold text-sm flex items-center justify-center shadow-sm shrink-0">
                        {userInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-900 truncate">{userName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200/60 text-teal-700 font-bold text-[10px]">
                          Candidate Pro
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Menu Items */}
                  <div className="p-1.5 space-y-0.5 text-xs">
                    <NavLink
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-bold transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Platform Settings</span>
                    </NavLink>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            <Outlet />
          </div>

          {/* Platform Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse inline-block" />
              <span>by <strong className="text-slate-800 font-extrabold">Jatin</strong></span>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-400 font-medium">
              <NavLink to="/about" className="hover:text-teal-700 transition-colors">
                About & Guide
              </NavLink>
              <span>•</span>
              <NavLink to="/jobs" className="hover:text-teal-700 transition-colors">
                Opportunities
              </NavLink>
              <span>•</span>
              <NavLink to="/recruiters" className="hover:text-teal-700 transition-colors">
                Recruiter Finder
              </NavLink>
              <span>•</span>
              <span>© {new Date().getFullYear()} JobHunter AI</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
