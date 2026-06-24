import React from 'react';
import { Card, Table, Badge, Button } from '../components/UI.js';
import { History as HistoryIcon, Smile, Activity, Heart, Calendar } from 'lucide-react';
import { JournalLog, ActivePage } from '../types.js';

interface HistoryProps {
  logs: JournalLog[];
  setActivePage: (page: ActivePage) => void;
}

export const History: React.FC<HistoryProps> = ({ logs, setActivePage }) => {
  // Only keep logs with a valid flowIntensity (meaning periods actually logged)
  const periodLogs = logs
    .filter((log) => log.flowIntensity && log.flowIntensity !== 'none')
    .sort((a, b) => b.date.localeCompare(a.date));

  const getFlowBadge = (intensity: string) => {
    switch (intensity) {
      case 'heavy':
        return <Badge variant="red">Sangat Deras (Heavy)</Badge>;
      case 'medium':
        return <Badge variant="rose">Sedang (Medium)</Badge>;
      case 'light':
        return <Badge variant="rose">Sedikit (Light)</Badge>;
      case 'spotting':
        return <Badge variant="yellow">Flek (Spotting)</Badge>;
      default:
        return <Badge variant="slate">Tidak Ada</Badge>;
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
      {/* Intro info */}
      <Card className="border-rose-100/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 text-lg">Riwayat Pencatatan Haid</h3>
            <p className="text-sm text-slate-500 font-medium">
              Riwayat lengkap log aliran darah haid, gejala fisik, serta kondisi emosional yang Anda catat pada aplikasi.
            </p>
          </div>
          <Button size="sm" onClick={() => setActivePage('journal')} className="flex-shrink-0 gap-1.5">
            <Calendar size={14} /> Tambah Log Baru
          </Button>
        </div>
      </Card>

      {/* Table & Logs */}
      {periodLogs.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50/60 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <HistoryIcon size={32} />
          </div>
          <h4 className="font-bold text-slate-800">Belum Ada Riwayat Tercatat</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 mb-6">
            Anda belum pernah mengisi log aliran darah haid di Jurnal Harian. Mulai catat hari menstruasi Anda sekarang.
          </p>
          <Button size="sm" onClick={() => setActivePage('journal')}>
            Buka Jurnal Harian
          </Button>
        </Card>
      ) : (
        <Card title="Daftar Log Aliran Darah Menstruasi" subtitle={`Ditemukan ${periodLogs.length} hari dengan catatan haid.`}>
          <div className="space-y-6">
            <Table headers={['Tanggal', 'Intensitas Aliran', 'Suasana Hati', 'Gejala Fisik', 'Catatan Tambahan']}>
              {periodLogs.map((log) => (
                <tr key={log._id || log.date} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                    {formatDateLong(log.date)}
                  </td>
                  <td className="px-6 py-4">
                    {getFlowBadge(log.flowIntensity)}
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    {log.mood && log.mood.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {log.mood.map((m, i) => (
                          <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-100/50 font-semibold flex items-center gap-1">
                            <Smile size={11} /> {m}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    {log.physicalSymptoms && log.physicalSymptoms.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {log.physicalSymptoms.map((s, i) => (
                          <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-100/50 font-semibold flex items-center gap-1">
                            <Activity size={11} /> {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500 max-w-xs truncate">
                    {log.notes || <span className="text-slate-300">Tidak ada catatan</span>}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};
