import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Configurable Inactivity Timeout via Environment Variable (defaults to 24 hours / 1 day)
const AUTO_LOGOUT_HOURS = Number(
  import.meta.env.VITE_AUTO_LOGOUT_HOURS ||
  import.meta.env.VITE_INACTIVITY_TIMEOUT_HOURS ||
  24
);
const INACTIVITY_TIMEOUT_MS = AUTO_LOGOUT_HOURS * 60 * 60 * 1000;
const ACTIVITY_THROTTLE_MS = 60 * 1000; // Throttle activity writes to localStorage

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastWriteRef = useRef(0);

  // Update activity timestamp in localStorage (synced across tabs)
  const recordActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastWriteRef.current > ACTIVITY_THROTTLE_MS) {
      lastWriteRef.current = now;
      localStorage.setItem('jh_last_activity', String(now));
    }
  }, []);

  const logout = useCallback(async (isAutoLogout = false) => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('jh_token');
    localStorage.removeItem('jh_last_activity');
    setUser(null);

    if (isAutoLogout) {
      const label =
        AUTO_LOGOUT_HOURS >= 24
          ? `${Math.round(AUTO_LOGOUT_HOURS / 24)} day(s)`
          : `${AUTO_LOGOUT_HOURS} hour(s)`;

      sessionStorage.setItem(
        'jh_session_notice',
        `You were automatically logged out due to ${label} of inactivity.`
      );
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
  }, []);

  // Check login on load
  const checkUserLoggedIn = async () => {
    try {
      const token = localStorage.getItem('jh_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        recordActivity();
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('jh_token');
      localStorage.removeItem('jh_last_activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserLoggedIn();

    // Auto-sync session when tab regains focus (e.g. when admin changes tier in another tab)
    const handleFocus = () => {
      if (localStorage.getItem('jh_token')) {
        checkUserLoggedIn();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Idle Inactivity Listener & Timer
  useEffect(() => {
    if (!user) return;

    recordActivity();

    // Event listeners to capture user interaction
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleUserActivity = () => {
      recordActivity();
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Periodic check every 30 seconds
    const interval = setInterval(() => {
      const storedLastActivity = Number(localStorage.getItem('jh_last_activity') || Date.now());
      const idleTime = Date.now() - storedLastActivity;

      if (idleTime > INACTIVITY_TIMEOUT_MS) {
        console.warn('[Auth] User inactive for > 30 mins. Triggering auto-logout.');
        logout(true);
      }
    }, 30000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      clearInterval(interval);
    };
  }, [user, recordActivity, logout]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('jh_token', res.data.token);
      localStorage.setItem('jh_last_activity', String(Date.now()));
      setUser(res.data.user);
      return res.data;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      localStorage.setItem('jh_token', res.data.token);
      localStorage.setItem('jh_last_activity', String(Date.now()));
      setUser(res.data.user);
      return res.data;
    }
  };

  const updateSettings = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const requestUpgrade = async (data = {}) => {
    const res = await api.post('/auth/request-upgrade', data);
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const isPro = Boolean(user?.plan === 'pro' || user?.role === 'admin' || user?.isAdmin);

  return (
    <AuthContext.Provider
      value={{
        user,
        isPro,
        loading,
        login,
        register,
        logout,
        updateSettings,
        requestUpgrade,
        refreshUser: checkUserLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
