import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Input, Select, Alert } from '../components/UI.js';
import { UserPlus, Edit2, Trash2, Search, Mail, ShieldAlert, Key } from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null); // Null means adding new user

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriodStart, setLastPeriodStart] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('user');
    setCycleLength(28);
    setPeriodLength(5);
    setLastPeriodStart('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: any) => {
    setEditingUser(user);
    setUsername(user.username || '');
    setEmail(user.email || '');
    setPassword(''); // Leave password blank on edit unless they want to reset it (or keep it as is)
    setRole(user.role || 'user');
    setCycleLength(user.cycleSettings?.cycleLength || 28);
    setPeriodLength(user.cycleSettings?.periodLength || 5);
    setLastPeriodStart(user.cycleSettings?.lastPeriodStart || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email) {
      setFormError('Nama pengguna dan email wajib diisi.');
      return;
    }
    if (!editingUser && !password) {
      setFormError('Kata sandi wajib diisi untuk pengguna baru.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      let response;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      };

      if (editingUser) {
        // Edit User details
        response = await fetch(`/api/admin/users/${editingUser._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            username,
            email,
            role,
            cycleSettings: {
              cycleLength,
              periodLength,
              lastPeriodStart,
            },
          }),
        });
      } else {
        // Create new User
        response = await fetch('/api/admin/users', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            username,
            email,
            password,
            role,
            cycleLength,
            periodLength,
            lastPeriodStart,
          }),
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccessMsg(editingUser ? 'Detail pengguna berhasil diperbarui!' : 'Pengguna baru berhasil ditambahkan!');
      setIsModalOpen(false);
      fetchUsers();
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      setFormError(err.message || 'Sistem gagal menyimpan data.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}" dari sistem secara permanen? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmDelete) return;

    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccessMsg(`Pengguna "${name}" telah dihapus.`);
      fetchUsers();

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus pengguna.');
    }
  };

  // Filter users based on query
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Table header & control panel */}
      <Card className="border-rose-100/40">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Cari pengguna berdasarkan nama atau email..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-rose-400 focus:ring-rose-100 focus:ring-4 rounded-xl text-sm focus:outline-none transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-4 top-3.5 text-slate-400">
              <Search size={16} />
            </div>
          </div>

          <Button onClick={handleOpenAddModal} className="gap-2 shrink-0">
            <UserPlus size={16} /> Tambah Pengguna
          </Button>
        </div>
      </Card>

      {successMsg && <Alert type="success">{successMsg}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      {/* Main Users Table */}
      {loading ? (
        <Card className="py-16 text-center text-sm font-semibold text-slate-400">
          🔄 Memproses data pengguna dari database...
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card className="py-16 text-center text-slate-400 text-sm font-semibold">
          🔍 Tidak ditemukan data pengguna yang cocok dengan kriteria pencarian Anda.
        </Card>
      ) : (
        <Card title="Daftar Anggota Aktif" subtitle={`Menampilkan ${filteredUsers.length} total pengguna platform.`}>
          <Table headers={['Nama Pengguna', 'Email', 'Peran', 'Pendaftaran', 'Pengaturan Siklus', 'Aksi']}>
            {filteredUsers.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center uppercase">
                      {u.username?.substring(0, 2) || 'US'}
                    </div>
                    <span>{u.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">
                  {u.email}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={u.role === 'admin' ? 'red' : 'rose'}>
                    {u.role === 'admin' ? 'Administrator' : 'User'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-400 whitespace-nowrap">
                  {formatDateShort(u.createdAt)}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                  {u.cycleSettings?.lastPeriodStart ? (
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                      Aktif: {u.cycleSettings.cycleLength}d / {u.cycleSettings.periodLength}d
                    </span>
                  ) : (
                    <span className="text-slate-300 italic">Belum diset</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(u)}
                      className="p-1.5 rounded-lg border border-slate-150 text-slate-500 hover:text-rose-600 hover:bg-slate-50 transition cursor-pointer"
                      title="Edit Pengguna"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id, u.username)}
                      className="p-1.5 rounded-lg border border-slate-150 text-slate-500 hover:text-red-600 hover:bg-slate-50 transition cursor-pointer"
                      title="Hapus Pengguna"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Ubah Detail: ${editingUser.username}` : 'Tambah Pengguna Baru'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          {formError && <Alert type="error">{formError}</Alert>}

          <Input
            label="Nama Pengguna"
            type="text"
            placeholder="Misal: Sarah Angelina"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={formLoading}
          />

          <Input
            label="Alamat Email"
            type="email"
            placeholder="sarah@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={formLoading}
          />

          {!editingUser && (
            <Input
              label="Kata Sandi Awal"
              type="text"
              placeholder="Masukkan kata sandi awal (Misal: user123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={formLoading}
            />
          )}

          <Select
            label="Peran Akun (Role)"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            options={[
              { value: 'user', label: 'Pengguna Umum (User)' },
              { value: 'admin', label: 'Administrator (Admin)' },
            ]}
            disabled={formLoading}
          />

          <div className="border-t border-slate-100 pt-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">
              Konfigurasi Siklus Awal (Opsional)
            </span>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input
                label="Lama Haid (Hari)"
                type="number"
                min={3}
                max={15}
                value={periodLength}
                onChange={(e) => setPeriodLength(Number(e.target.value))}
                disabled={formLoading}
              />
              <Input
                label="Panjang Siklus (Hari)"
                type="number"
                min={15}
                max={45}
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                disabled={formLoading}
              />
            </div>

            <Input
              label="Hari Pertama Haid Terakhir"
              type="date"
              value={lastPeriodStart}
              onChange={(e) => setLastPeriodStart(e.target.value)}
              disabled={formLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={formLoading}
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Memproses...' : 'Simpan Pengguna'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
