import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { api } from '../src/lib/api';
import { ArrowLeft, Edit2, Trash2, Save, X, Shield, Users, CheckCircle, XCircle, Eye, EyeOff, TrendingUp, CreditCard, FileText } from 'lucide-react';

interface Props {
  onBack: () => void;
  darkMode: boolean;
  user: any;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  is_admin: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export default function Admin({ onBack, darkMode, user }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', isAdmin: false, isVerified: false });
  const [showPasswordForm, setShowPasswordForm] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [usersData, statsData] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.full_name,
      email: user.email,
      isAdmin: user.is_admin,
      isVerified: user.is_verified,
    });
    setShowPasswordForm(null);
    setError('');
    setInfo('');
  };

  const handleCancel = () => {
    setEditingUser(null);
    setShowPasswordForm(null);
    setNewPassword('');
    setError('');
    setInfo('');
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setError('');
    setIsLoading(true);
    try {
      const updated = await api.admin.updateUser(editingUser.id, editForm);
      setUsers(users.map(u => u.id === updated.id ? { ...u, ...updated, full_name: updated.full_name || updated.fullName } : u));
      setInfo('User updated successfully');
      setTimeout(() => {
        setInfo('');
        handleCancel();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await api.admin.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setInfo('User deleted successfully');
      setTimeout(() => setInfo(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (userId: number) => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await api.admin.updateUserPassword(userId, newPassword);
      setInfo('Password updated successfully');
      setNewPassword('');
      setShowPasswordForm(null);
      setTimeout(() => setInfo(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !users.length) {
    return (
      <div className={`min-h-full p-4 flex items-center justify-center ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-full pb-4 transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40 border-b`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <h1 className="text-sm font-black uppercase tracking-widest">Admin Panel</h1>
          </div>
        </div>
        <button
          onClick={loadData}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${
            darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="px-4 pt-4 pb-2 grid grid-cols-2 gap-2">
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-red-600" />
              <span className="text-[8px] font-black uppercase text-gray-500">Total Users</span>
            </div>
            <p className="text-xl font-black">{stats.totalUsers}</p>
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-emerald-600" />
              <span className="text-[8px] font-black uppercase text-gray-500">Verified</span>
            </div>
            <p className="text-xl font-black">{stats.verifiedUsers}</p>
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-blue-600" />
              <span className="text-[8px] font-black uppercase text-gray-500">Admins</span>
            </div>
            <p className="text-xl font-black">{stats.adminUsers}</p>
          </div>
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={14} className="text-purple-600" />
              <span className="text-[8px] font-black uppercase text-gray-500">Accounts</span>
            </div>
            <p className="text-xl font-black">{stats.totalAccounts}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="px-4 py-2 min-h-[20px]">
        {error && <p className="text-[9px] font-black uppercase text-red-500">{error}</p>}
        {info && <p className="text-[9px] font-black uppercase text-emerald-500">{info}</p>}
      </div>

      {/* Users List */}
      <div className="px-4 space-y-2">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">User Management</h2>
        {users.map((u) => (
          <div
            key={u.id}
            className={`p-3 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}
          >
            {editingUser?.id === u.id ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[8px] font-black uppercase text-gray-500 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'} border`}
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase text-gray-500 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'} border`}
                  />
                </div>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5 text-[9px]">
                    <input
                      type="checkbox"
                      checked={editForm.isAdmin}
                      onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                      className="w-3 h-3"
                    />
                    <span className="font-black uppercase">Admin</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[9px]">
                    <input
                      type="checkbox"
                      checked={editForm.isVerified}
                      onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                      className="w-3 h-3"
                    />
                    <span className="font-black uppercase">Verified</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    <Save size={12} className="inline mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest"
                  >
                    <X size={12} className="inline mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-black">{u.full_name}</p>
                      {u.is_admin && <Shield size={12} className="text-red-600" />}
                      {u.is_verified ? (
                        <CheckCircle size={12} className="text-emerald-600" />
                      ) : (
                        <XCircle size={12} className="text-gray-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500">{u.email}</p>
                    <p className="text-[8px] text-gray-400 mt-1">
                      Joined: {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(u)}
                      className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 size={14} className="text-blue-600" />
                    </button>
                    {u.id !== user.id && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
                {showPasswordForm === u.id ? (
                  <div className="mt-2 p-2 rounded-lg bg-gray-800/50 space-y-2">
                    <input
                      type="password"
                      placeholder="New password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-2 py-1.5 rounded-lg text-xs ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border border-gray-700`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePasswordUpdate(u.id)}
                        className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-[9px] font-black uppercase"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setShowPasswordForm(null)}
                        className="px-3 bg-gray-600 text-white py-1.5 rounded-lg text-[9px] font-black uppercase"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPasswordForm(u.id)}
                    className={`w-full mt-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    Change Password
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

