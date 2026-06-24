import React, { useState, useEffect } from 'react';
import { Card, Badge, Table, Alert } from '../components/UI.js';
import { Users, Sparkles, FileText, Send, Mail, Calendar, Heart, ShieldAlert } from 'lucide-react';

interface AdminDashboardProps {
  onNavigateToUsers: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateToUsers }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat statistik admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card className="py-16 text-center text-sm font-semibold text-slate-400">
        🔄 Memuat data analitik sistem...
      </Card>
    );
  }

  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  return (
    <div className="space-y-6">
      {/* Metric row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4 hover:translate-y-[-2px] transition">
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 flex-shrink-0">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Pengguna</span>
            <span className="text-2xl font-black text-slate-800 leading-none mt-1 block">{stats?.totalUsers || 0}</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 hover:translate-y-[-2px] transition">
          <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600 flex-shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Prediksi</span>
            <span className="text-2xl font-black text-slate-800 leading-none mt-1 block">{stats?.totalPredictions || 0}</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 hover:translate-y-[-2px] transition">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 flex-shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Log Jurnal</span>
            <span className="text-2xl font-black text-slate-800 leading-none mt-1 block">{stats?.totalJournalEntries || 0}</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 hover:translate-y-[-2px] transition">
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 flex-shrink-0">
            <Send size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Umpan Balik</span>
            <span className="text-2xl font-black text-slate-800 leading-none mt-1 block">{stats?.totalFeedback || 0}</span>
          </div>
        </Card>
      </div>

      {/* Grid: Recent Users & Support Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent users */}
        <div className="lg:col-span-5">
          <Card
            title="Pengguna Baru"
            subtitle="Daftar 5 pendaftar terbaru platform."
            action={
              <button
                onClick={onNavigateToUsers}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Kelola Semua
              </button>
            }
          >
            <div className="space-y-4">
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100/50 transition">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 text-xs font-bold flex items-center justify-center uppercase">
                        {u.username?.substring(0, 2) || 'US'}
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-slate-800 text-xs block truncate">{u.username}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{u.email}</span>
                      </div>
                    </div>
                    <Badge variant={u.role === 'admin' ? 'red' : 'rose'}>
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 font-semibold">Belum ada pengguna terdaftar.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Support Box / Feedback Inbox */}
        <div className="lg:col-span-7">
          <Card title="Kotak Masuk Umpan Balik" subtitle="Pesan, saran, dan umpan balik yang dikirim pengguna.">
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {stats?.recentFeedback && stats.recentFeedback.length > 0 ? (
                stats.recentFeedback.map((fb: any, i: number) => (
                  <div key={fb._id || i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Mail size={12} /> {fb.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {formatDateShort(fb.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 bg-white border border-slate-100/80 p-3 rounded-xl italic leading-relaxed">
                      "{fb.message}"
                    </p>
                    <div className="flex justify-end">
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider flex items-center gap-1">
                        ● Diterima
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-10 font-semibold">✍️ Kotak masuk kosong. Belum ada saran yang dikirim.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
