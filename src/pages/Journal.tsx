import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert } from '../components/UI.js';
import { Save, Calendar, Smile, Activity, MessageSquare, Droplet, HelpCircle, Heart } from 'lucide-react';
import { User, JournalLog } from '../types.js';

interface JournalProps {
  user: User | null;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  onRefreshData: () => Promise<void>;
}

export const Journal: React.FC<JournalProps> = ({
  user,
  selectedDate,
  setSelectedDate,
  onRefreshData,
}) => {
  const [flowIntensity, setFlowIntensity] = useState<'light' | 'medium' | 'heavy' | 'spotting' | 'none'>('none');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Available options
  const moodOptions = [
    'Bahagia/Senang', 'Biasa Saja', 'Sensitif/Moody', 'Sedih/Murung',
    'Cemas/Khawatir', 'Cepat Marah/Iritabel', 'Lelah/Tidak Berenergi', 'Tenang'
  ];

  const symptomOptions = [
    'Kram Perut', 'Sakit Kepala', 'Kembung', 'Nyeri Payudara',
    'Nyeri Punggung Bawah', 'Sembelit/Diare', 'Jerawat/Kulit Berminyak',
    'Mengidam Makanan (Cravings)', 'Sulit Tidur (Insomnia)', 'Mual'
  ];

  // Fetch log whenever selectedDate changes
  useEffect(() => {
    const fetchLogForDate = async () => {
      setFetching(true);
      setStatus(null);
      try {
        const response = await fetch(`/api/user/journal/${selectedDate}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        
        if (response.ok) {
          setFlowIntensity(data.flowIntensity || 'none');
          setSelectedMoods(data.mood || []);
          setSelectedSymptoms(data.physicalSymptoms || []);
          setNotes(data.notes || '');
        }
      } catch (err) {
        console.error('Error fetching journal for date:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchLogForDate();
  }, [selectedDate]);

  const handleToggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const handleToggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/user/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          flowIntensity,
          mood: selectedMoods,
          physicalSymptoms: selectedSymptoms,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan log jurnal.');
      }

      setStatus({ type: 'success', message: 'Log kesehatan berhasil disimpan ke database!' });
      await onRefreshData(); // Trigger App refresh to sync state across dashboard & history
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setLoading(false);
    }
  };

  const formatDateLong = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <Card title="Pilih Tanggal Log Jurnal" subtitle="Anda bisa mencatatkan riwayat kemarin atau merencanakan catatan hari esok.">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-72">
            <input
              type="date"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-rose-400 focus:ring-rose-100 focus:ring-4 rounded-xl text-sm text-slate-800 transition focus:outline-none"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={loading || fetching}
            />
          </div>
          <div className="text-xs text-slate-400 font-semibold">
            📅 Menampilkan catatan kesehatan untuk: <span className="text-rose-600 font-bold">{formatDateLong(selectedDate)}</span>
          </div>
        </div>
      </Card>

      {fetching ? (
        <Card className="py-16 text-center text-sm font-semibold text-slate-400">
          🔄 Memuat catatan harian tanggal {selectedDate}...
        </Card>
      ) : (
        <form onSubmit={handleSaveLog} className="space-y-6">
          {status && <Alert type={status.type}>{status.message}</Alert>}

          {/* Grid for Flow & Quick Helpers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Menstrual Flow Selection */}
            <div className="lg:col-span-8">
              <Card title="Intensitas Aliran Darah Menstruasi" subtitle="Pilih tingkat aliran darah haid Anda hari ini.">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { value: 'none', label: 'Tidak Ada', desc: 'Bersih/Kering', bg: 'hover:bg-slate-50', activeBg: 'bg-slate-100 border-slate-400 text-slate-800', icon: <HelpCircle size={16} /> },
                    { value: 'spotting', label: 'Flek (Spotting)', desc: 'Tetesan sedikit', bg: 'hover:bg-yellow-50/50', activeBg: 'bg-yellow-50 border-yellow-300 text-yellow-800', icon: <Droplet size={16} className="text-yellow-600" /> },
                    { value: 'light', label: 'Sedikit (Light)', desc: 'Ganti pembalut 1-2x', bg: 'hover:bg-rose-50/50', activeBg: 'bg-rose-50 border-rose-200 text-rose-800', icon: <Droplet size={16} className="text-rose-500" /> },
                    { value: 'medium', label: 'Sedang (Medium)', desc: 'Ganti pembalut 3-4x', bg: 'hover:bg-rose-50', activeBg: 'bg-rose-100 border-rose-300 text-rose-800', icon: <Droplet size={18} className="text-rose-600" /> },
                    { value: 'heavy', label: 'Deras (Heavy)', desc: 'Sangat deras / penuh', bg: 'hover:bg-red-50', activeBg: 'bg-red-50 border-red-300 text-red-800', icon: <Droplet size={20} className="text-red-600" /> },
                  ].map((flow) => {
                    const isActive = flowIntensity === flow.value;
                    return (
                      <button
                        key={flow.value}
                        type="button"
                        onClick={() => setFlowIntensity(flow.value as any)}
                        className={`p-4 border border-slate-150 rounded-2xl text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          isActive ? flow.activeBg + ' scale-[1.03] shadow-md' : flow.bg + ' text-slate-700'
                        }`}
                      >
                        <div className="mb-1">{flow.icon}</div>
                        <span className="text-xs font-bold leading-none">{flow.label}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{flow.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Side summary banner */}
            <div className="lg:col-span-4 bg-gradient-to-tr from-rose-500 to-rose-400 text-white p-6 rounded-2xl shadow-lg shadow-rose-100 flex flex-col justify-between">
              <div className="space-y-2">
                <Heart className="fill-white/10 text-rose-100" size={24} />
                <h4 className="font-extrabold text-sm tracking-tight">Pencatatan Mandiri</h4>
                <p className="text-[11px] text-rose-100 leading-relaxed font-medium">
                  Gejala fisik dan perubahan psikologis Anda adalah bagian alami dari siklus hormonal bulanan. SiklusKu memetakan riwayat ini agar Anda bisa mengonsultasikannya ke dokter spesialis secara akurat jika dibutuhkan.
                </p>
              </div>
              <span className="text-[9px] text-rose-200 font-bold uppercase tracking-widest mt-4">siklusku health advisor</span>
            </div>
          </div>

          {/* Mood Selection Card */}
          <Card title="Suasana Hati & Kondisi Emosional" subtitle="Pilih semua kondisi perasaan yang Anda rasakan hari ini.">
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((mood) => {
                const isSelected = selectedMoods.includes(mood);
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => handleToggleMood(mood)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 border-purple-300 text-purple-700 scale-[1.02] shadow-sm font-bold'
                        : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Smile size={13} className={isSelected ? 'text-purple-600' : 'text-slate-400'} />
                      {mood}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Physical Symptoms Card */}
          <Card title="Gejala Fisik Tubuh" subtitle="Pilih semua gejala fisik yang dirasakan tubuh Anda hari ini.">
            <div className="flex flex-wrap gap-2">
              {symptomOptions.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => handleToggleSymptom(symptom)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 scale-[1.02] shadow-sm font-bold'
                        : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Activity size={13} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />
                      {symptom}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Notes Card */}
          <Card title="Catatan & Jurnal Tambahan" subtitle="Tuliskan pengalaman pribadi Anda secara detail (opsional).">
            <div className="relative">
              <textarea
                placeholder="Tuliskan catatan harian Anda di sini... (Misal: rasa lelah setelah bekerja, tidur terganggu, asupan nutrisi hari ini, dll.)"
                className="w-full h-28 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-400 transition"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="absolute right-4 bottom-4 text-slate-300">
                <MessageSquare size={16} />
              </div>
            </div>
          </Card>

          {/* Form Action Controls */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
              Reset Hari Ini
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Save size={16} /> {loading ? 'Menyimpan...' : 'Simpan Log Jurnal'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
