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
  ChevronDown,
  User,
  Crown,
  Zap,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UpgradeModal from '../components/UpgradeModal';

const BASE_NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', path: '/jobs', icon: Briefcase },
  { name: 'Saved Searches', path: '/saved-searches', icon: SearchCode },
  { name: 'Recruiter Finder', path: '/recruiters', icon: Users, isProOnly: true },
  { name: 'Application History', path: '/applications', icon: History },
  { name: 'Cold Email', path: '/cold-email', icon: Mail },
  { name: 'Bulk Apply', path: '/bulk-apply', icon: Send, isProOnly: true },
  { name: 'Resume & Profile', path: '/resume', icon: FileText },
  { name: 'Email Accounts', path: '/email', icon: MailCheck },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function DashboardLayout() {
  const { user, isPro, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = user?.role === 'admin' || Boolean(user?.isAdmin);

  const navItems = isAdmin
    ? [...BASE_NAV_ITEMS, { name: 'Admin Panel', path: '/admin', icon: Shield, isAdminOnly: true }]
    : BASE_NAV_ITEMS;

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
        <div className="flex flex-col h-full justify-between">
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
            <nav className="p-3 sm:p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? item.isAdminOnly
                          ? 'bg-purple-50 text-purple-800 font-bold shadow-xs'
                          : 'bg-teal-50 text-teal-700 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? item.isAdminOnly
                              ? 'text-purple-600'
                              : 'text-teal-600'
                            : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.isAdminOnly && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                        ADMIN
                      </span>
                    )}

                    {item.isProOnly && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                          isPro
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        PRO
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Plan Banner */}
          <div className="p-3 sm:p-4 border-t border-slate-100">
            {isAdmin ? (
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <span className="text-xs font-black text-purple-950 block leading-tight">Admin Master</span>
                    <span className="text-[10px] text-purple-700">Full system control</span>
                  </div>
                </div>
                <NavLink
                  to="/admin"
                  className="text-[10px] text-purple-800 font-extrabold hover:underline"
                >
                  Manage
                </NavLink>
              </div>
            ) : isPro ? (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-teal-500/10 border border-amber-300/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-xs font-black text-slate-900 block leading-tight">PRO Member</span>
                    <span className="text-[10px] text-slate-500">All features unlocked</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUpgradeModalOpen(true)}
                  className="text-[10px] text-teal-700 font-extrabold hover:underline"
                >
                  View Perks
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950 text-white space-y-2 shadow-md">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                    Basic Plan Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Unlock Bulk AI outreach and Recruiter discovery with PRO.
                </p>
                <button
                  type="button"
                  onClick={() => setUpgradeModalOpen(true)}
                  className="w-full py-1.5 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 text-slate-950 font-black text-[11px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                >
                  <Zap className="w-3 h-3 text-slate-950" />
                  Request PRO Access
                </button>
              </div>
            )}
          </div>
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
              {navItems.find((i) => i.path === location.pathname)?.name || 'JobHunter AI'}
            </h1>
          </div>

          {/* Right Side Header Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin or Plan Pill */}
            {isAdmin ? (
              <NavLink
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-800 border border-purple-300 hover:bg-purple-100 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin Panel</span>
              </NavLink>
            ) : (
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isPro
                    ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                    : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                }`}
              >
                <Crown className={`w-3.5 h-3.5 ${isPro ? 'text-amber-500' : 'text-teal-600'}`} />
                <span>{isPro ? 'PRO Member' : 'Basic Plan'}</span>
              </button>
            )}

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
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
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
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            isAdmin
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : isPro
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isAdmin ? '👑 Administrator' : isPro ? '👑 PRO Member' : 'Basic Plan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Menu Items */}
                  <div className="p-1.5 space-y-0.5 text-xs">
                    {isAdmin ? (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-800 hover:bg-purple-50 font-bold transition-colors text-left"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span>Admin Control Panel</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setUpgradeModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-700 hover:bg-amber-50 font-bold transition-colors text-left"
                      >
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span>{isPro ? 'Manage PRO Membership' : 'Request PRO Access'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors text-left font-semibold"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <UpgradeModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
    </div>
  );
}
