import React from 'react';
import { Card, Badge, Button } from '../components/UI.js';
import { Sparkles, Calendar, Droplets, Flame, Shield, ArrowRight } from 'lucide-react';
import { User, CyclePrediction, ActivePage } from '../types.js';

interface PredictionProps {
  user: User | null;
  predictions: CyclePrediction[];
  setActivePage: (page: ActivePage) => void;
}

export const Prediction: React.FC<PredictionProps> = ({ user, predictions, setActivePage }) => {
  const isSettingsSet = user?.cycleSettings && user.cycleSettings.lastPeriodStart;

  const formatDateLong = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateRange = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return '';
    const start = new Date(startStr);
    const end = new Date(endStr);
    const startDay = start.getDate();
    const startMonth = start.toLocaleDateString('id-ID', { month: 'short' });
    const endDay = end.getDate();
    const endMonth = end.toLocaleDateString('id-ID', { month: 'short' });
    const endYear = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth} ${endYear}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endYear}`;
  };

  return (
    <div className="space-y-6">
      {/* Intro card */}
      <Card className="border-rose-100/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Estimasi AI & Medis
            </span>
            <h3 className="text-lg font-extrabold text-slate-800">Bagaimana Prediksi Kami Bekerja?</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl font-medium">
              SiklusKu menggunakan metode kalender standar klinis (Ogino-Knaus) untuk menghitung estimasi siklus Anda berikutnya. Algoritma memperkirakan hari pelepasan telur (ovulation) jatuh pada 14 hari sebelum hari menstruasi berikutnya, dengan rentang subur 5 hari pra-ovulasi dan 1 hari pasca-ovulasi.
            </p>
          </div>
          <div className="flex-shrink-0 p-4 bg-rose-50 rounded-2xl text-rose-600">
            <Sparkles size={32} className="animate-pulse" />
          </div>
        </div>
      </Card>

      {/* Predictions list */}
      {!isSettingsSet ? (
        <Card className="py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} />
          </div>
          <h4 className="font-bold text-slate-800 text-lg">Prediksi Belum Tersedia</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 mb-6">
            Lengkapi data hari menstruasi pertama Anda serta panjang rata-rata siklus untuk menghitung jadwal prediksi 6 bulan ke depan.
          </p>
          <Button size="md" onClick={() => setActivePage('profile')} className="gap-2">
            Lengkapi Pengaturan <ArrowRight size={16} />
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Jadwal Estimasi 6 Periode Mendatang
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictions.map((pred, i) => (
              <Card
                key={i}
                className="hover:translate-y-[-4px] transition-all relative border-t-4 border-t-rose-500"
              >
                {/* Index badge */}
                <div className="absolute top-4 right-4 text-xs font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded-lg">
                  P-{i + 1}
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Estimasi Menstruasi
                    </span>
                    <span className="text-lg font-black text-rose-600 tracking-tight block mt-0.5">
                      {formatDateRange(pred.cycleStartDate, pred.cycleEndDate)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">
                      Durasi perkiraan: {pred.periodDuration} hari
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  <div className="space-y-3.5">
                    {/* Ovulation prediction */}
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 mt-0.5 flex-shrink-0">
                        <Flame size={14} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                          Hari Ovulasi
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 leading-none">
                          {formatDateLong(pred.ovulationDate)}
                        </span>
                      </div>
                    </div>

                    {/* Fertile window */}
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5 flex-shrink-0">
                        <Sparkles size={14} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                          Masa Subur Tertinggi
                        </span>
                        <span className="text-xs font-bold text-emerald-700 block">
                          {formatDateRange(pred.fertileWindowStart, pred.fertileWindowEnd)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom indicator */}
                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                    <span>Akurasi estimasi</span>
                    <span className="text-emerald-600 font-bold">Tinggi</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
