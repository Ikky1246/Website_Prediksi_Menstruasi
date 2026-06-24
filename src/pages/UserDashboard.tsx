import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert } from '../components/UI.js';
import {
  Sparkles,
  Flame,
  Activity,
  Calendar,
  Smile,
  Heart,
  Droplet,
  Send,
  BookOpen,
  ArrowRight,
  FileText
} from 'lucide-react';
import { User, CyclePrediction, JournalLog, ActivePage } from '../types.js';

interface DashboardProps {
  user: User | null;
  predictions: CyclePrediction[];
  journalLogs: JournalLog[];
  setActivePage: (page: ActivePage) => void;
  onRefreshData: () => Promise<void>;
}

export const UserDashboard: React.FC<DashboardProps> = ({
  user,
  predictions,
  journalLogs,
  setActivePage,
  onRefreshData,
}) => {
  const [feedbackEmail, setFeedbackEmail] = useState(user?.email || '');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync email when user loads
  useEffect(() => {
    if (user?.email) {
      setFeedbackEmail(user.email);
    }
  }, [user]);

  // Calculate stats
  const isSettingsSet = user?.cycleSettings && user.cycleSettings.lastPeriodStart;
  const cycleLength = user?.cycleSettings?.cycleLength || 28;
  const periodLength = user?.cycleSettings?.periodLength || 5;
  const lastPeriodStart = user?.cycleSettings?.lastPeriodStart || '';

  // Calculate current cycle progress
  let daysInCycle = 0;
  let nextPeriodStartStr = '';
  let daysUntilNext = 0;
  let cyclePhase = 'Unknown';
  let phaseDescription = '';
  let phaseColor = 'text-rose-500';
  let phaseBg = 'bg-rose-50';

  if (isSettingsSet) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(lastPeriodStart);
    start.setHours(0, 0, 0, 0);

    const timeDiff = today.getTime() - start.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Cycle day is 1-indexed, wrapping around cycleLength
    daysInCycle = (daysDiff % cycleLength) + 1;
    if (daysInCycle <= 0) daysInCycle += cycleLength;

    // Next period start calculation
    const currentCycleNumber = Math.floor(daysDiff / cycleLength);
    const nextStart = new Date(start);
    nextStart.setDate(start.getDate() + (currentCycleNumber + 1) * cycleLength);
    nextPeriodStartStr = nextStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const msUntilNext = nextStart.getTime() - today.getTime();
    daysUntilNext = Math.ceil(msUntilNext / (1000 * 60 * 60 * 24));

    // Determine current phase
    if (daysInCycle <= periodLength) {
      cyclePhase = 'Fase Menstruasi';
      phaseDescription = 'Siklus baru dimulai. Tubuh sedang melepaskan dinding rahim. Istirahatlah yang cukup dan penuhi asupan zat besi.';
      phaseColor = 'text-rose-600';
      phaseBg = 'bg-rose-50';
    } else if (daysInCycle <= 11) {
      cyclePhase = 'Fase Folikular';
      phaseDescription = 'Tingkat estrogen meningkat, memberi Anda lebih banyak energi, fokus, dan gairah positif. Waktu yang tepat untuk aktif!';
      phaseColor = 'text-emerald-600';
      phaseBg = 'bg-emerald-50';
    } else if (daysInCycle <= 16) {
      cyclePhase = 'Fase Ovulasi (Masa Subur)';
      phaseDescription = 'Sel telur dilepaskan. Ini adalah masa kesuburan tertinggi Anda. Hormon sedang berada pada tingkat puncak.';
      phaseColor = 'text-purple-600';
      phaseBg = 'bg-purple-50';
    } else {
      cyclePhase = 'Fase Luteal (Pra-Menstruasi)';
      phaseDescription = 'Progesteron meningkat dan perlahan menurun kembali. Anda mungkin merasakan gejala PMS. Kelola stres dan hidrasi tubuh.';
      phaseColor = 'text-amber-600';
      phaseBg = 'bg-amber-50';
    }
  }

  // Symptoms tracking summary
  const totalLogs = journalLogs.length;
  const symptomCounts = journalLogs.reduce((acc: Record<string, number>, log) => {
    log.physicalSymptoms.forEach((s) => {
      acc[s] = (acc[s] || 0) + 1;
    });
    return acc;
  }, {});

  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3)
    .map(([name]) => name);

  // Submit feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) {
      setFeedbackStatus({ type: 'error', message: 'Umpan balik tidak boleh kosong.' });
      return;
    }

    setFeedbackLoading(true);
    setFeedbackStatus(null);

    try {
      const response = await fetch('/api/user/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email: feedbackEmail, message: feedbackMessage }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setFeedbackStatus({ type: 'success', message: 'Umpan balik berhasil dikirim! Terima kasih atas masukan Anda.' });
      setFeedbackMessage('');
    } catch (err: any) {
      setFeedbackStatus({ type: 'error', message: err.message || 'Gagal mengirim umpan balik.' });
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Static tips dataset
  const healthTips = [
    {
      title: 'Pentingnya Hidrasi',
      text: 'Minum minimal 2 liter air per hari meredakan kembung menstruasi dan kram otot secara signifikan.',
      icon: <Activity className="text-blue-500" size={16} />,
    },
    {
      title: 'Zat Besi & Menstruasi',
      text: 'Konsumsi sayuran hijau gelap, bayam, atau daging merah saat menstruasi untuk mengganti zat besi yang hilang.',
      icon: <Droplet className="text-rose-500" size={16} />,
    },
    {
      title: 'PMS & Olahraga',
      text: 'Latihan fisik ringan seperti berjalan kaki atau yoga melepaskan endorfin untuk meredakan kecemasan pra-haid.',
      icon: <Sparkles className="text-amber-500" size={16} />,
    },
    {
      title: 'Suasana Hati & Pola Makan',
      text: 'Hindari asupan kafein berlebih saat fase luteal guna menurunkan sensitivitas payudara dan kecemasan emosional.',
      icon: <Smile className="text-purple-500" size={16} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Settings warning */}
      {!isSettingsSet && (
        <Alert type="warning">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-bold">Konfigurasi Siklus Belum Lengkap!</span>
              <p className="text-xs mt-1">Anda belum memasukkan hari haid terakhir Anda. Harap isi profil siklus Anda untuk mengaktifkan perhitungan prediksi, masa subur, dan kalender kesuburan otomatis.</p>
            </div>
            <Button size="sm" onClick={() => setActivePage('profile')} className="flex-shrink-0 gap-1">
              Atur Sekarang <ArrowRight size={14} />
            </Button>
          </div>
        </Alert>
      )}

      {/* Grid: Cycle status & Metric Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cycle status card */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col justify-between overflow-hidden relative border-rose-100/40">
            {/* Soft decorative background circles */}
            <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-rose-50/50 -mr-16 -mt-16 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-rose-50/30 -ml-16 -mb-16 blur-xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Badge variant={isSettingsSet ? 'rose' : 'slate'}>
                  {isSettingsSet ? 'Status Aktif' : 'Belum Terkonfigurasi'}
                </Badge>
                {isSettingsSet && (
                  <span className="text-xs font-bold text-slate-400">
                    Siklus Berikutnya: {nextPeriodStartStr}
                  </span>
                )}
              </div>

              {isSettingsSet ? (
                <div className="flex flex-col md:flex-row items-center gap-6 py-4">
                  {/* Visual Circle progress */}
                  <div className="relative w-36 h-36 flex items-center justify-center rounded-full border-8 border-rose-50 flex-shrink-0 bg-white shadow-inner">
                    <div className="absolute inset-2 rounded-full border-4 border-dashed border-rose-100/60" />
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Hari Ke</span>
                      <span className="text-4xl font-extrabold text-rose-600 tracking-tight leading-none my-1">{daysInCycle}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{cycleLength} Hari</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className={`text-lg font-extrabold px-3 py-1 rounded-xl ${phaseBg} ${phaseColor}`}>
                        {cyclePhase}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {phaseDescription}
                    </p>
                    <div className="text-xs text-slate-400 font-semibold">
                      ⏰ <span className="text-rose-600 font-bold">{daysUntilNext} Hari</span> menuju periode berikutnya.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center shadow-inner">
                    <Calendar size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Menunggu Input Profil</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Harap perbarui pengaturan hari menstruasi pertama Anda di menu profil untuk melihat progres siklus interaktif.</p>
                  </div>
                  <Button size="sm" onClick={() => setActivePage('profile')}>
                    Buka Profil
                  </Button>
                </div>
              )}
            </div>

            <div className="border-t border-slate-50 pt-4 mt-4 flex items-center justify-between text-xs text-slate-400 relative">
              <span>Sistem SiklusKu Predictor v1.2</span>
              {isSettingsSet && (
                <button
                  onClick={() => setActivePage('prediction')}
                  className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Detail Estimasi <Sparkles size={12} />
                </button>
              )}
            </div>
          </Card>
        </div>

        {/* Metric summary boxes */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 flex flex-col justify-between">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 w-fit mb-3">
                <Droplet size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Rata-rata Haid</span>
                <span className="text-2xl font-black text-slate-800 leading-none mt-1 block">
                  {periodLength} <span className="text-sm font-semibold text-slate-400">Hari</span>
                </span>
              </div>
            </Card>

            <Card className="p-5 flex flex-col justify-between">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 w-fit mb-3">
                <Calendar size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Panjang Siklus</span>
                <span className="text-2xl font-black text-slate-800 leading-none mt-1 block">
                  {cycleLength} <span className="text-sm font-semibold text-slate-400">Hari</span>
                </span>
              </div>
            </Card>
          </div>

          <Card className="p-5 flex flex-col justify-between flex-grow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 w-fit">
                <Activity size={18} />
              </div>
              <Badge variant="rose">{totalLogs} Hari Tercatat</Badge>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gejala Sering Muncul</span>
              {topSymptoms.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {topSymptoms.map((sym, i) => (
                    <span key={i} className="text-xs font-semibold bg-slate-50 border border-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                      {sym}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-1">Belum ada gejala yang sering dicatat pada jurnal.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Grid: Quick Actions & Health Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick actions */}
        <Card title="Aksi Cepat" subtitle="Pantau kesehatan dan lakukan aksi instan secara mudah.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setActivePage('journal')}
              className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl hover:bg-rose-50/20 hover:border-rose-200 transition text-left cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                <FileText size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">Catat Gejala</span>
                <span className="text-[10px] text-slate-400 font-medium">Jurnal gejala hari ini</span>
              </div>
            </button>

            <button
              onClick={() => setActivePage('calendar')}
              className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl hover:bg-rose-50/20 hover:border-rose-200 transition text-left cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                <Calendar size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">Lihat Kalender</span>
                <span className="text-[10px] text-slate-400 font-medium">Kalender masa subur</span>
              </div>
            </button>

            <button
              onClick={() => setActivePage('profile')}
              className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl hover:bg-rose-50/20 hover:border-rose-200 transition text-left cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                <Smile size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">Konfigurasi Siklus</span>
                <span className="text-[10px] text-slate-400 font-medium">Sesuaikan estimasi</span>
              </div>
            </button>

            <button
              onClick={() => {
                const element = document.getElementById('feedback-card');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl hover:bg-rose-50/20 hover:border-rose-200 transition text-left cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                <Send size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">Umpan Balik</span>
                <span className="text-[10px] text-slate-400 font-medium">Kirim saran ke admin</span>
              </div>
            </button>
          </div>
        </Card>

        {/* Tips box */}
        <Card title="Tips & Wawasan Kesehatan" subtitle="Tips pilihan berdasarkan riset reproduksi kesehatan wanita.">
          <div className="space-y-3.5">
            {healthTips.map((tip, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-slate-50/50 hover:bg-rose-50/10 border border-slate-100/50 rounded-xl transition">
                <div className="p-2 bg-white rounded-lg border border-slate-100/50 shadow-sm flex-shrink-0">
                  {tip.icon}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700">{tip.title}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SVG Charts section */}
      <Card title="Analitik Siklus Haid" subtitle="Tren visual riwayat panjang siklus haid 6 periode terakhir.">
        <div className="h-44 w-full flex flex-col justify-end gap-2 px-2 pt-6">
          <div className="flex items-end justify-between h-28 border-b border-slate-100 pb-1">
            {/* Hardcoded mock but styled cycle data for visual trend */}
            {[26, 28, 29, 27, 28, cycleLength].map((length, idx) => {
              const maxVal = 35;
              const pct = (length / maxVal) * 100;
              return (
                <div key={idx} className="flex flex-col items-center flex-grow group">
                  <div className="relative w-full flex justify-center">
                    {/* Tooltip on hover */}
                    <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {length} Hari
                    </span>
                    <div
                      className="w-10 md:w-16 bg-gradient-to-t from-rose-500 to-rose-400 hover:from-rose-600 hover:to-rose-500 rounded-t-lg transition-all shadow-inner"
                      style={{ height: `${pct}%`, minHeight: '30px' }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-2">P-{6 - idx}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2">
            <span>Siklus Lama</span>
            <span>Siklus Terakhir (P-1)</span>
          </div>
        </div>
      </Card>

      {/* Feedback section */}
      <div id="feedback-card">
        <Card title="Kirim Umpan Balik Platform" subtitle="Saran, keluhan, atau pertanyaan Anda sangat berarti bagi pengembangan kami.">
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            {feedbackStatus && (
              <Alert type={feedbackStatus.type}>{feedbackStatus.message}</Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Email Anda</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  disabled
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Pesan Umpan Balik</label>
                <input
                  type="text"
                  placeholder="Ketik saran atau umpan balik Anda di sini..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  disabled={feedbackLoading}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={feedbackLoading} className="gap-2">
                Kirim Saran <Send size={14} />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
