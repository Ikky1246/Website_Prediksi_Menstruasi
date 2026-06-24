import React, { useState } from 'react';
import { AuthLayout } from '../components/Layouts.js';
import { Button, Input, Alert } from '../components/UI.js';
import { Mail, Lock, Check } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !newPassword) {
      setError('Harap isi semua bidang email dan kata sandi baru.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan.');
      }

      setSuccess('Kata sandi berhasil diperbarui! Silakan kembali masuk.');
      setTimeout(() => {
        onNavigateToLogin();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Gagal mengatur ulang kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Atur Ulang Sandi"
      subtitle="Masukkan email akun terdaftar Anda dan buat kata sandi baru secara instan."
    >
      <form onSubmit={handleReset} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="relative">
          <Input
            label="Alamat Email Akun"
            type="email"
            placeholder="sarah@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <div className="absolute right-4 top-[38px] text-slate-400">
            <Mail size={16} />
          </div>
        </div>

        <div className="relative">
          <Input
            label="Kata Sandi Baru"
            type="password"
            placeholder="Masukkan kata sandi baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
          <div className="absolute right-4 top-[38px] text-slate-400">
            <Lock size={16} />
          </div>
        </div>

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Kembali ke{' '}
        <button
          onClick={onNavigateToLogin}
          className="font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
        >
          Halaman Masuk
        </button>
      </p>
    </AuthLayout>
  );
};
