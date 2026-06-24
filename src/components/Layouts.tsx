import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CalendarDays,
  History,
  FileText,
  User as UserIcon,
  LogOut,
  Sparkles,
  Menu,
  X,
  Users,
  ShieldAlert,
  Heart
} from 'lucide-react';
import { User, ActivePage } from '../types.js';

interface LayoutProps {
  user: User | null;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

// ==========================================
// NAVBAR (Mobile Header Navigation)
// ==========================================
export const Navbar: React.FC<{
  user: User | null;
  onMenuToggle: () => void;
  onLogout: () => void;
}> = ({ user, onMenuToggle, onLogout }) => {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4 border-b border-rose-50 lg:hidden">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-200">
          <Heart size={20} className="fill-white" />
        </div>
        <div>
          <span className="font-bold text-slate-800 tracking-tight text-base block">SiklusKu</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">tracker & journal</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
        >
          <Menu size={20} />
        </button>
      </div>
    </nav>
  );
};

// ==========================================
// SIDEBAR (Main Sidebar)
// ==========================================
interface SidebarProps {
  user: User | null;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onLogout: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activePage,
  setActivePage,
  onLogout,
  onCloseMobile,
}) => {
  const isAdmin = user?.role === 'admin';

  const userMenuItems = [
    { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'prediction' as ActivePage, label: 'Prediksi Siklus', icon: <Sparkles size={18} /> },
    { id: 'calendar' as ActivePage, label: 'Kalender Interaktif', icon: <CalendarDays size={18} /> },
    { id: 'journal' as ActivePage, label: 'Jurnal Harian', icon: <FileText size={18} /> },
    { id: 'history' as ActivePage, label: 'Riwayat Haid', icon: <History size={18} /> },
    { id: 'profile' as ActivePage, label: 'Profil & Pengaturan', icon: <UserIcon size={18} /> },
  ];

  const adminMenuItems = [
    { id: 'admin-dashboard' as ActivePage, label: 'Admin Dashboard', icon: <ShieldAlert size={18} /> },
    { id: 'admin-users' as ActivePage, label: 'Kelola Pengguna', icon: <Users size={18} /> },
    { id: 'profile' as ActivePage, label: 'Profil Admin', icon: <UserIcon size={18} /> },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleNav = (page: ActivePage) => {
    setActivePage(page);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-full overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-200">
            <Heart size={22} className="fill-white animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 tracking-tight text-lg block leading-none">SiklusKu</span>
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1 block">tracker & journal</span>
          </div>
        </div>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="lg:hidden p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X size={18} />
          </button>
        )}
      </div>

      {/* User Info Capsule */}
      <div className="mx-4 my-6 p-4 rounded-2xl bg-rose-50/40 border border-rose-100/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 font-bold text-sm flex items-center justify-center uppercase shadow-inner">
          {user?.username?.substring(0, 2) || 'US'}
        </div>
        <div className="flex-grow overflow-hidden">
          <span className="font-semibold text-slate-800 text-sm block truncate">
            {user?.personalData?.name || user?.username || 'Pengguna'}
          </span>
          <span className="text-[10px] bg-rose-100/80 text-rose-700 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            {user?.role === 'admin' ? 'Administrator' : 'Anggota'}
          </span>
        </div>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-grow px-4 space-y-1.5">
        <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Menu Utama</span>
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Logout Action */}
      <div className="p-4 border-t border-slate-50 mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
        >
          <LogOut size={18} />
          Keluar Sesi
        </button>
      </div>
    </aside>
  );
};

// ==========================================
// HEADER (Dashboard Inner Header)
// ==========================================
export const Header: React.FC<{
  title: string;
  subtitle?: string;
  user: User | null;
}> = ({ title, subtitle, user }) => {
  return (
    <header className="hidden lg:flex items-center justify-between border-b border-slate-100/50 bg-white px-8 py-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="font-semibold text-slate-800 text-sm block">
            {user?.personalData?.name || user?.username || 'Pengguna'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {user?.email}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white font-bold flex items-center justify-center shadow-md shadow-rose-100 uppercase">
          {user?.username?.substring(0, 1) || 'U'}
        </div>
      </div>
    </header>
  );
};

// ==========================================
// FOOTER (Copyright Info)
// ==========================================
export const Footer: React.FC = () => {
  return (
    <footer className="py-6 px-8 border-t border-slate-50/50 bg-white text-center text-xs text-slate-400 mt-auto">
      <p>© {new Date().getFullYear()} SiklusKu Tracker & Journal. Semua hak dilindungi.</p>
      <p className="mt-1 text-[10px] text-slate-300">Desain visual presisi & interaktif untuk pemantauan kesehatan reproduksi wanita.</p>
    </footer>
  );
};

// ==========================================
// MAIN LAYOUT
// ==========================================
export const MainLayout: React.FC<LayoutProps> = ({
  user,
  activePage,
  setActivePage,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Map pages to titles
  const pageTitles: Record<ActivePage, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Kesehatan', subtitle: 'Statistik siklus, hitung mundur, dan tips kesehatan terkini.' },
    prediction: { title: 'Prediksi Siklus', subtitle: 'Informasi perkiraan masa menstruasi, masa subur, dan ovulasi Anda.' },
    calendar: { title: 'Kalender Kesehatan', subtitle: 'Visualisasi interaktif kalender kesuburan dan riwayat gejala.' },
    journal: { title: 'Jurnal & Gejala Harian', subtitle: 'Catat gejala fisik, suasana hati, dan intensitas aliran darah harian.' },
    history: { title: 'Riwayat Menstruasi', subtitle: 'Daftar riwayat lengkap log menstruasi yang telah Anda catat.' },
    profile: { title: 'Profil & Pengaturan', subtitle: 'Perbarui info personal dan kelola konfigurasi siklus bulanan.' },
    'admin-dashboard': { title: 'Panel Admin Dashboard', subtitle: 'Analitik metrik platform, pengguna aktif, dan umpan balik.' },
    'admin-users': { title: 'Kelola Pengguna', subtitle: 'Lakukan pemantauan dan pengelolaan (CRUD) semua pengguna platform.' },
  };

  const currentHeaderInfo = pageTitles[activePage] || { title: 'SiklusKu', subtitle: '' };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50/30 text-slate-800 font-sans">
      {/* Mobile Header Navbar */}
      <Navbar user={user} onMenuToggle={() => setMobileMenuOpen(true)} onLogout={onLogout} />

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            {/* Sidebar content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              className="relative z-10 h-full w-72"
            >
              <Sidebar
                user={user}
                activePage={activePage}
                setActivePage={setActivePage}
                onLogout={onLogout}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden lg:block lg:flex-shrink-0 w-72 h-screen sticky top-0">
        <Sidebar
          user={user}
          activePage={activePage}
          setActivePage={setActivePage}
          onLogout={onLogout}
        />
      </div>

      {/* Main Content Pane */}
      <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        {/* Desktop Header */}
        <Header title={currentHeaderInfo.title} subtitle={currentHeaderInfo.subtitle} user={user} />

        {/* Dynamic Mobile Banner */}
        <div className="lg:hidden bg-white p-6 border-b border-rose-50">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{currentHeaderInfo.title}</h2>
          {currentHeaderInfo.subtitle && <p className="text-xs text-slate-400 mt-1">{currentHeaderInfo.subtitle}</p>}
        </div>

        {/* Content Body */}
        <main className="flex-grow p-4 md:p-6 lg:p-8">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

// ==========================================
// AUTH LAYOUT
// ==========================================
interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-rose-50/20 flex flex-col items-center justify-center p-4 md:p-8 selection:bg-rose-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-rose-100/30"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-rose-200 mb-4">
            <Heart size={30} className="fill-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium max-w-xs">{subtitle}</p>
        </div>

        {children}
      </motion.div>
    </div>
  );
};
