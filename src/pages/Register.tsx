import React, { useState } from 'react';
import { AuthLayout } from '../components/Layouts.js';
import { Button, Input, Select, Alert } from '../components/UI.js';
import { Mail, Lock, User } from 'lucide-react';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Silakan lengkapi semua kolom pendaftaran.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Pendaftaran gagal.');
      }

      setSuccess('Pendaftaran berhasil! Mengalihkan ke halaman masuk...');
      setTimeout(() => {
        onRegisterSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Koneksi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Daftar Akun"
      subtitle="Mulai pantau kesehatan haid Anda secara akurat dengan mendaftarkan akun baru SiklusKu."
    >
      <form onSubmit={handleRegister} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="relative">
          <Input
            label="Nama Pengguna"
            type="text"
            placeholder="Contoh: Sarah"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <div className="absolute right-4 top-[38px] text-slate-400">
            <User size={16} />
          </div>
        </div>

        <div className="relative">
          <Input
            label="Alamat Email"
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
            label="Kata Sandi"
            type="password"
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <div className="absolute right-4 top-[38px] text-slate-400">
            <Lock size={16} />
          </div>
        </div>

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Sudah memiliki akun?{' '}
        <button
          onClick={onNavigateToLogin}
          className="font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
        >
          Masuk Sini
        </button>
      </p>
    </AuthLayout>
  );
};
