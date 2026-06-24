import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/Layouts.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { ForgotPassword } from './pages/ForgotPassword.js';
import { UserDashboard } from './pages/UserDashboard.js';
import { Prediction } from './pages/Prediction.js';
import { History } from './pages/History.js';
import { CalendarView } from './pages/CalendarView.js';
import { Journal } from './pages/Journal.js';
import { Profile } from './pages/Profile.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { AdminUserManagement } from './pages/AdminUserManagement.js';
import { User, CyclePrediction, JournalLog, ActivePage } from './types.js';

export default function App() {
  // Session states
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot'>('login');
  const [sessionLoading, setSessionLoading] = useState(true);

  // App active tab states
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  // Business data states
  const [predictions, setPredictions] = useState<CyclePrediction[]>([]);
  const [journalLogs, setJournalLogs] = useState<JournalLog[]>([]);
  const [selectedJournalDate, setSelectedJournalDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Restore session on load
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setSessionLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(savedToken);
          // Set proper default view depending on role
          setActivePage(userData.role === 'admin' ? 'admin-dashboard' : 'dashboard');
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      } finally {
        setSessionLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Fetch predictions and journal logs when logged in
  const fetchAppData = async () => {
    if (!token) return;

    try {
      const [predRes, journalRes] = await Promise.all([
        fetch('/api/user/predictions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/user/journal', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (predRes.ok) {
        const predData = await predRes.json();
        setPredictions(predData);
      }

      if (journalRes.ok) {
        const journalData = await journalRes.json();
        setJournalLogs(journalData);
      }
    } catch (err) {
      console.error('Failed to load application logs:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppData();
    }
  }, [token]);

  // Auth Callbacks
  const handleLoginSuccess = (newToken: string, userData: any) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setActivePage(userData.role === 'admin' ? 'admin-dashboard' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthView('login');
    setPredictions([]);
    setJournalLogs([]);
  };

  // Sync user updates (profile or cycleSettings updates)
  const handleRefreshUser = (updatedUser: any) => {
    setUser(updatedUser);
  };

  // App content router
  const renderActiveContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <UserDashboard
            user={user}
            predictions={predictions}
            journalLogs={journalLogs}
            setActivePage={setActivePage}
            onRefreshData={fetchAppData}
          />
        );
      case 'prediction':
        return (
          <Prediction
            user={user}
            predictions={predictions}
            setActivePage={setActivePage}
          />
        );
      case 'history':
        return <History logs={journalLogs} setActivePage={setActivePage} />;
      case 'calendar':
        return (
          <CalendarView
            user={user}
            predictions={predictions}
            journalLogs={journalLogs}
            setActivePage={setActivePage}
            setSelectedJournalDate={setSelectedJournalDate}
          />
        );
      case 'journal':
        return (
          <Journal
            user={user}
            selectedDate={selectedJournalDate}
            setSelectedDate={setSelectedJournalDate}
            onRefreshData={fetchAppData}
          />
        );
      case 'profile':
        return (
          <Profile
            user={user}
            onRefreshUser={handleRefreshUser}
            onRefreshData={fetchAppData}
          />
        );
      case 'admin-dashboard':
        return <AdminDashboard onNavigateToUsers={() => setActivePage('admin-users')} />;
      case 'admin-users':
        return <AdminUserManagement />;
      default:
        return (
          <UserDashboard
            user={user}
            predictions={predictions}
            journalLogs={journalLogs}
            setActivePage={setActivePage}
            onRefreshData={fetchAppData}
          />
        );
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-rose-50/20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-rose-200 animate-bounce mb-4">
          <svg
            className="w-6 h-6 fill-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <span className="text-xs text-rose-600 font-bold tracking-widest uppercase animate-pulse">
          Memulihkan Sesi SiklusKu...
        </span>
      </div>
    );
  }

  // Auth pages rendering
  if (!token) {
    if (authView === 'register') {
      return (
        <Register
          onRegisterSuccess={() => setAuthView('login')}
          onNavigateToLogin={() => setAuthView('login')}
        />
      );
    }
    if (authView === 'forgot') {
      return <ForgotPassword onNavigateToLogin={() => setAuthView('login')} />;
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setAuthView('register')}
        onNavigateToForgot={() => setAuthView('forgot')}
      />
    );
  }

  // Main application workspace rendering
  return (
    <MainLayout
      user={user}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={handleLogout}
    >
      {renderActiveContent()}
    </MainLayout>
  );
}
