import React, { useState } from 'react';
import { AuthLayout } from '../components/Layouts.js';
import { Button, Input, Alert } from '../components/UI.js';
import { Mail, Lock } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, userData: any) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgot: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToForgot,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Silakan masukkan email dan kata sandi Anda.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login gagal.');
      }

      setSuccess('Login sukses! Mengalihkan...');
      setTimeout(() => {
        onLoginSuccess(data.token, data.user);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Koneksi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Selamat Datang"
      subtitle="Masuk ke akun SiklusKu Anda untuk memantau siklus haid, kesuburan, dan kesehatan harian Anda."
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="relative">
          <Input
            label="Alamat Email"
            type="email"
            placeholder="nama@email.com"
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
            placeholder="Masukkan kata sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <div className="absolute right-4 top-[38px] text-slate-400">
            <Lock size={16} />
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onNavigateToForgot}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
          >
            Lupa Kata Sandi?
          </button>
        </div>

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Memproses Masuk...' : 'Masuk ke Akun'}
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Belum punya akun?{' '}
        <button
          onClick={onNavigateToRegister}
          className="font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
        >
          Daftar Sekarang
        </button>
      </p>
    </AuthLayout>
  );
};
