import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Alert } from '../components/UI.js';
import { Settings, User as UserIcon, Calendar, Activity, Info } from 'lucide-react';
import { User } from '../types.js';

interface ProfileProps {
  user: User | null;
  onRefreshUser: (updatedUser: any) => void;
  onRefreshData: () => Promise<void>;
}

export const Profile: React.FC<ProfileProps> = ({ user, onRefreshUser, onRefreshData }) => {
  // Cycle settings states
  const [cycleLength, setCycleLength] = useState(user?.cycleSettings?.cycleLength || 28);
  const [periodLength, setPeriodLength] = useState(user?.cycleSettings?.periodLength || 5);
  const [lastPeriodStart, setLastPeriodStart] = useState(user?.cycleSettings?.lastPeriodStart || '');

  // Personal data states
  const [name, setName] = useState(user?.personalData?.name || user?.username || '');
  const [birthDate, setBirthDate] = useState(user?.personalData?.birthDate || '');
  const [weight, setWeight] = useState(user?.personalData?.weight || '');
  const [height, setHeight] = useState(user?.personalData?.height || '');

  const [cycleLoading, setCycleLoading] = useState(false);
  const [cycleStatus, setCycleStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [personalLoading, setPersonalLoading] = useState(false);
  const [personalStatus, setPersonalStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state with user data if it updates in background
  useEffect(() => {
    if (user) {
      if (user.cycleSettings) {
        setCycleLength(user.cycleSettings.cycleLength || 28);
        setPeriodLength(user.cycleSettings.periodLength || 5);
        setLastPeriodStart(user.cycleSettings.lastPeriodStart || '');
      }
      if (user.personalData) {
        setName(user.personalData.name || user.username || '');
        setBirthDate(user.personalData.birthDate || '');
        setWeight(user.personalData.weight || '');
        setHeight(user.personalData.height || '');
      }
    }
  }, [user]);

  const handleSaveCycleSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastPeriodStart) {
      setCycleStatus({ type: 'error', message: 'Harap masukkan tanggal hari pertama haid terakhir Anda.' });
      return;
    }

    setCycleLoading(true);
    setCycleStatus(null);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          cycleLength: Number(cycleLength),
          periodLength: Number(periodLength),
          lastPeriodStart,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui konfigurasi siklus.');
      }

      setCycleStatus({ type: 'success', message: 'Konfigurasi siklus haid berhasil disimpan! Kalender prediksi 6 bulan ke depan telah diperbarui.' });
      onRefreshUser(data.user);
      await onRefreshData(); // Sync parent prediction list immediately
    } catch (err: any) {
      setCycleStatus({ type: 'error', message: err.message || 'Gagal menyimpan.' });
    } finally {
      setCycleLoading(false);
    }
  };

  const handleSavePersonalData = async (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalLoading(true);
    setPersonalStatus(null);

    try {
      const response = await fetch('/api/user/personal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name,
          birthDate,
          weight: weight ? Number(weight) : undefined,
          height: height ? Number(height) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui data pribadi.');
      }

      setPersonalStatus({ type: 'success', message: 'Data profil pribadi berhasil diperbarui.' });
      onRefreshUser(data.user);
    } catch (err: any) {
      setPersonalStatus({ type: 'error', message: err.message || 'Gagal menyimpan.' });
    } finally {
      setPersonalLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Cycle settings card */}
      <Card
        title="Pengaturan Siklus Menstruasi"
        subtitle="Data siklus ini akan digunakan untuk menghasilkan kalender ovulasi & masa subur."
      >
        <form onSubmit={handleSaveCycleSettings} className="space-y-4">
          {cycleStatus && <Alert type={cycleStatus.type}>{cycleStatus.message}</Alert>}

          <div>
            <Input
              label="Hari Pertama Haid Terakhir"
              type="date"
              value={lastPeriodStart}
              onChange={(e) => setLastPeriodStart(e.target.value)}
              disabled={cycleLoading}
              helperText="Pilih hari pertama pendarahan menstruasi terakhir Anda."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Lama Haid (Hari)"
                value={String(periodLength)}
                onChange={(e) => setPeriodLength(Number(e.target.value))}
                options={[
                  { value: '3', label: '3 Hari' },
                  { value: '4', label: '4 Hari' },
                  { value: '5', label: '5 Hari (Default)' },
                  { value: '6', label: '6 Hari' },
                  { value: '7', label: '7 Hari' },
                  { value: '8', label: '8 Hari' },
                  { value: '9', label: '9 Hari' },
                  { value: '10', label: '10 Hari' },
                ]}
                disabled={cycleLoading}
              />
            </div>

            <div>
              <Select
                label="Panjang Siklus (Hari)"
                value={String(cycleLength)}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                options={[
                  { value: '21', label: '21 Hari' },
                  { value: '22', label: '22 Hari' },
                  { value: '23', label: '23 Hari' },
                  { value: '24', label: '24 Hari' },
                  { value: '25', label: '25 Hari' },
                  { value: '26', label: '26 Hari' },
                  { value: '27', label: '27 Hari' },
                  { value: '28', label: '28 Hari (Rata-rata)' },
                  { value: '29', label: '29 Hari' },
                  { value: '30', label: '30 Hari' },
                  { value: '31', label: '31 Hari' },
                  { value: '32', label: '32 Hari' },
                  { value: '33', label: '33 Hari' },
                  { value: '34', label: '34 Hari' },
                  { value: '35', label: '35 Hari' },
                ]}
                disabled={cycleLoading}
              />
            </div>
          </div>

          <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100/30 flex gap-2 items-start text-xs text-rose-800 leading-relaxed font-semibold">
            <Info size={14} className="mt-0.5 flex-shrink-0 text-rose-500" />
            <span>Mempunyai siklus teratur? Panjang rata-rata siklus adalah rentang waktu dari hari pertama menstruasi hingga hari pertama menstruasi berikutnya (biasanya 28 hari).</span>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={cycleLoading}>
              {cycleLoading ? 'Menyimpan...' : 'Simpan & Hitung Siklus'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Personal data card */}
      <Card
        title="Informasi Profil Pribadi"
        subtitle="Kelola detail biologis tubuh Anda untuk analisis kebugaran tubuh yang relevan."
      >
        <form onSubmit={handleSavePersonalData} className="space-y-4">
          {personalStatus && <Alert type={personalStatus.type}>{personalStatus.message}</Alert>}

          <div>
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Contoh: Sarah Angelina"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={personalLoading}
            />
          </div>

          <div>
            <Input
              label="Tanggal Lahir"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={personalLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Berat Badan (kg)"
                type="number"
                placeholder="Misal: 55"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled={personalLoading}
              />
            </div>
            <div>
              <Input
                label="Tinggi Badan (cm)"
                type="number"
                placeholder="Misal: 162"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                disabled={personalLoading}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={personalLoading}>
              {personalLoading ? 'Menyimpan...' : 'Perbarui Detail Profil'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
