import React, { useState } from 'react';
import { Card, Badge, Button } from '../components/UI.js';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Droplet,
  FileText,
  Heart,
  HelpCircle,
  CalendarDays
} from 'lucide-react';
import { User, CyclePrediction, JournalLog, ActivePage } from '../types.js';

interface CalendarViewProps {
  user: User | null;
  predictions: CyclePrediction[];
  journalLogs: JournalLog[];
  setActivePage: (page: ActivePage) => void;
  setSelectedJournalDate: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  user,
  predictions,
  journalLogs,
  setActivePage,
  setSelectedJournalDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const isSettingsSet = user?.cycleSettings && user.cycleSettings.lastPeriodStart;

  // Helper arrays
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthDaysCount = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, prevMonthDaysCount - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete full 42-cell grid
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  // Format Date Helper YYYY-MM-DD
  const formatDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Check date properties based on Predictions
  const getDayStatus = (d: Date) => {
    if (!isSettingsSet) return null;

    const dStr = formatDateString(d);

    // Loop through predictions to find matches
    for (const pred of predictions) {
      // 1. Ovulation
      if (pred.ovulationDate === dStr) {
        return 'ovulation';
      }
      // 2. Menstruation
      if (dStr >= pred.cycleStartDate && dStr <= pred.cycleEndDate) {
        return 'menstruation';
      }
      // 3. Fertile Window
      if (dStr >= pred.fertileWindowStart && dStr <= pred.fertileWindowEnd) {
        return 'fertility';
      }
    }

    return null;
  };

  // Check if a journal log exists for this date
  const getJournalForDate = (d: Date) => {
    const dStr = formatDateString(d);
    return journalLogs.find((log) => log.date === dStr);
  };

  // Format date range details for bottom description card
  const getSelectedDayLabel = () => {
    const dStr = formatDateString(selectedDate);
    const status = getDayStatus(selectedDate);
    const journal = getJournalForDate(selectedDate);

    const formattedSelected = selectedDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let statusLabel = 'Hari Normal (Tingkat Kesuburan Rendah)';
    let statusClass = 'text-slate-600 bg-slate-100';

    if (status === 'menstruation') {
      statusLabel = 'Estimasi Hari Menstruasi';
      statusClass = 'text-rose-700 bg-rose-50 border border-rose-100';
    } else if (status === 'fertility') {
      statusLabel = 'Masa Subur (Fertility Window)';
      statusClass = 'text-emerald-700 bg-emerald-50 border border-emerald-100';
    } else if (status === 'ovulation') {
      statusLabel = 'Hari Ovulasi (Kesuburan Tertinggi)';
      statusClass = 'text-purple-700 bg-purple-50 border border-purple-100 animate-pulse';
    }

    return {
      dateStr: dStr,
      formatted: formattedSelected,
      statusLabel,
      statusClass,
      journal,
    };
  };

  const selectedDetails = getSelectedDayLabel();

  const handleGoToLog = () => {
    setSelectedJournalDate(selectedDetails.dateStr);
    setActivePage('journal');
  };

  return (
    <div className="space-y-6">
      {/* Legend and Calendar Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Calendar Card */}
        <div className="lg:col-span-8">
          <Card className="p-4 md:p-6 select-none border-rose-50/60">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="text-rose-500" size={20} />
                <h4 className="font-extrabold text-slate-800 text-lg">
                  {monthNames[month]} {year}
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl border border-slate-150 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 border border-slate-150 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Bulan Ini
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl border border-slate-150 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Day labels header */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center">
              {dayNames.map((day, i) => (
                <span
                  key={i}
                  className={`text-xs font-bold uppercase tracking-wider py-1 ${
                    i === 0 ? 'text-red-500' : 'text-slate-400'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {calendarDays.map((cell, idx) => {
                const cellStr = formatDateString(cell.date);
                const isSelected = formatDateString(selectedDate) === cellStr;
                const status = getDayStatus(cell.date);
                const hasJournal = getJournalForDate(cell.date);
                const isToday = formatDateString(new Date()) === cellStr;

                // Color mappings based on menstrual phase status
                let cellClass = 'bg-white hover:bg-slate-50 border border-transparent';
                let textClass = 'text-slate-700';

                if (!cell.isCurrentMonth) {
                  cellClass = 'bg-slate-50/50 text-slate-300';
                  textClass = 'text-slate-300';
                }

                if (isToday) {
                  cellClass += ' ring-2 ring-slate-800 ring-offset-2';
                }

                if (status === 'menstruation') {
                  cellClass = 'bg-rose-500 text-white shadow-sm hover:bg-rose-600';
                  textClass = 'text-white font-bold';
                } else if (status === 'fertility') {
                  cellClass = 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50';
                  textClass = 'text-emerald-800 font-bold';
                } else if (status === 'ovulation') {
                  cellClass = 'bg-purple-500 text-white shadow-sm hover:bg-purple-600 ring-4 ring-purple-100';
                  textClass = 'text-white font-black';
                }

                if (isSelected) {
                  cellClass += ' ring-4 ring-rose-500/30 border border-rose-500 scale-[1.03] z-10';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`h-12 md:h-16 rounded-2xl flex flex-col items-center justify-between p-1.5 md:p-2 transition-all duration-250 relative cursor-pointer ${cellClass}`}
                  >
                    <span className={`text-xs md:text-sm font-semibold leading-none ${textClass}`}>
                      {cell.date.getDate()}
                    </span>

                    {/* Indicator markers */}
                    <div className="flex gap-1 items-center mt-auto">
                      {hasJournal && (
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            status === 'menstruation' || status === 'ovulation' ? 'bg-white' : 'bg-rose-500'
                          }`}
                        />
                      )}
                      {status === 'fertility' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Legend Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card title="Keterangan Fase" subtitle="Indikator warna kesuburan Anda.">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
                  <Droplet size={16} />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Fase Menstruasi</span>
                  <span className="text-[10px] text-slate-400">Prediksi jadwal haid harian</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/50 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Masa Subur</span>
                  <span className="text-[10px] text-slate-400">Peluang kehamilan tinggi</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-sm">
                  <Flame size={16} />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Hari Ovulasi</span>
                  <span className="text-[10px] text-slate-400">Kesuburan sel telur puncak</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-dashed border-slate-200 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Log Jurnal Tercatat</span>
                  <span className="text-[10px] text-slate-400">Hari dengan gejala/mood tercatat</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick tips */}
          <Card className="bg-rose-500 text-white shadow-lg shadow-rose-100 overflow-hidden relative">
            {/* Decorative background visual */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-rose-600/50 -mr-12 -mt-12 blur-xl pointer-events-none" />
            <div className="relative">
              <Heart className="text-rose-100 fill-rose-100/10 mb-3 animate-pulse" size={24} />
              <h5 className="font-extrabold text-sm tracking-tight">Kesehatan Selalu Terjaga</h5>
              <p className="text-[11px] text-rose-100 leading-relaxed mt-1 font-medium">
                Pencatatan gejala secara rutin membantu algoritma memetakan fluktuasi siklus bulanan Anda dengan tingkat akurasi yang lebih konsisten.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Selected Day Status Details Box */}
      <Card
        title={`Rincian Tanggal: ${selectedDetails.formatted}`}
        subtitle="Analisis kondisi kesehatan serta log medis harian Anda."
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-bold text-slate-500 block uppercase tracking-wide">Status Siklus</span>
            <div className={`px-4 py-3 rounded-2xl font-bold text-sm text-center ${selectedDetails.statusClass}`}>
              {selectedDetails.statusLabel}
            </div>
            <Button fullWidth variant="secondary" size="sm" onClick={handleGoToLog} className="gap-1.5">
              <FileText size={14} /> Tulis / Ubah Jurnal
            </Button>
          </div>

          <div className="md:col-span-8 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 space-y-4">
            <span className="text-xs font-bold text-slate-500 block uppercase tracking-wide">Pencatatan Gejala Harian</span>

            {selectedDetails.journal ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Intensitas Aliran</span>
                    <span className="text-sm font-bold text-slate-800 capitalize mt-1 block">
                      {selectedDetails.journal.flowIntensity === 'none' ? 'Tidak Ada' : selectedDetails.journal.flowIntensity}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Waktu Pencatatan</span>
                    <span className="text-sm font-medium text-slate-500 mt-1 block">
                      {selectedDetails.journal.loggedAt ? new Date(selectedDetails.journal.loggedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Suasana Hati (Mood)</span>
                    {selectedDetails.journal.mood && selectedDetails.journal.mood.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedDetails.journal.mood.map((m, i) => (
                          <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-lg border border-purple-100 font-semibold">
                            {m}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Tidak ada log suasana hati</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Gejala Fisik</span>
                    {selectedDetails.journal.physicalSymptoms && selectedDetails.journal.physicalSymptoms.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedDetails.journal.physicalSymptoms.map((s, i) => (
                          <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg border border-emerald-100 font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Tidak ada log gejala fisik</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Catatan Tambahan</span>
                  <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-3.5 rounded-xl mt-1.5 font-medium leading-relaxed italic">
                    {selectedDetails.journal.notes || 'Tidak ada catatan tertulis.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                ✍️ Belum ada catatan kesehatan untuk tanggal ini. Klik "Tulis / Ubah Jurnal" untuk mencatat.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
