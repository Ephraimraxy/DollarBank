import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { api } from '../src/lib/api';
import { 
  ArrowLeft, Edit2, Trash2, Save, X, Shield, Users, CheckCircle, XCircle, 
  AlertTriangle, TrendingUp, CreditCard, FileText, DollarSign, Activity,
  Search, Filter, RefreshCw, Eye, Lock, Unlock, ArrowUpRight, ArrowDownLeft,
  Calendar, BarChart3, PieChart, AlertCircle, Clock, CheckCircle2
} from 'lucide-react';

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

interface Account {
  id: number;
  account_number: string;
  type: string;
  balance: number;
  user_id: number;
  full_name: string;
  email: string;
  is_verified: boolean;
  created_at: string;
}

interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  description: string;
  status: string;
  category: string;
  recipient_name: string;
  reference: string;
  created_at: string;
  full_name: string;
  email: string;
  account_number: string;
}

type Tab = 'dashboard' | 'users' | 'accounts' | 'transactions' | 'analytics';

export default function Admin({ onBack, darkMode, user }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // User management
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', isAdmin: false, isVerified: false });
  const [showPasswordForm, setShowPasswordForm] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  
  // Account management
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [balanceAdjustment, setBalanceAdjustment] = useState({ balance: '', reason: '' });
  
  // Transaction management
  const [transactionFilters, setTransactionFilters] = useState({ status: '', type: '', userId: '' });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'accounts') loadAccounts();
    if (activeTab === 'transactions') loadTransactions();
    if (activeTab === 'dashboard') loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  
  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionFilters]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const statsData = await api.admin.getStats();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const usersData = await api.admin.getUsers();
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccounts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const accountsData = await api.admin.getAccounts();
      setAccounts(accountsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (transactionFilters.status) filters.status = transactionFilters.status;
      if (transactionFilters.type) filters.type = transactionFilters.type;
      if (transactionFilters.userId) filters.userId = transactionFilters.userId;
      
      const transactionsData = await api.admin.getTransactions(filters);
      setTransactions(transactionsData.transactions || transactionsData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // User management handlers
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.full_name,
      email: user.email,
      isAdmin: user.is_admin,
      isVerified: user.is_verified,
    });
    setShowPasswordForm(null);
    setError('');
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setError('');
    setIsLoading(true);
    try {
      const updated = await api.admin.updateUser(editingUser.id, editForm);
      setUsers(users.map(u => u.id === updated.id ? { ...u, ...updated, full_name: updated.full_name || updated.fullName } : u));
      setInfo('User updated successfully');
      setTimeout(() => {
        setInfo('');
        setEditingUser(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    setError('');
    setIsLoading(true);
    try {
      await api.admin.deleteUser(deleteConfirm.id);
      setUsers(users.filter(u => u.id !== deleteConfirm.id));
      setInfo('User deleted successfully');
      setDeleteConfirm(null);
      setTimeout(() => setInfo(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
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
    } finally {
      setIsLoading(false);
    }
  };

  // Account management handlers
  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setBalanceAdjustment({ balance: account.balance.toString(), reason: '' });
    setError('');
  };

  const handleSaveAccount = async () => {
    if (!editingAccount) return;
    setError('');
    setIsLoading(true);
    try {
      await api.admin.updateAccountBalance(editingAccount.id, {
        balance: parseFloat(balanceAdjustment.balance),
        reason: balanceAdjustment.reason || 'Admin balance adjustment'
      });
      setInfo('Account balance updated successfully');
      await loadAccounts();
      setEditingAccount(null);
      setTimeout(() => setInfo(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update account balance');
    } finally {
      setIsLoading(false);
    }
  };

  // Transaction management handlers
  const handleUpdateTransactionStatus = async (txnId: number, status: string) => {
    setError('');
    setIsLoading(true);
    try {
      await api.admin.updateTransactionStatus(txnId, status);
      setInfo('Transaction status updated');
      await loadTransactions();
      setTimeout(() => setInfo(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundTransaction = async (txnId: number, reason: string) => {
    setError('');
    setIsLoading(true);
    try {
      await api.admin.refundTransaction(txnId, reason);
      setInfo('Refund processed successfully');
      await loadTransactions();
      setSelectedTransaction(null);
      setTimeout(() => setInfo(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to process refund');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    !searchQuery || 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAccounts = accounts.filter(a =>
    !searchQuery ||
    a.account_number.includes(searchQuery) ||
    a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t =>
    !searchQuery ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.reference?.includes(searchQuery)
  );

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
            <h1 className="text-sm font-black uppercase tracking-widest">Admin Control Center</h1>
          </div>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'dashboard') loadDashboardData();
            if (activeTab === 'users') loadUsers();
            if (activeTab === 'accounts') loadAccounts();
            if (activeTab === 'transactions') loadTransactions();
          }}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${
            darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <RefreshCw size={12} className="inline mr-1" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className={`px-4 pt-3 pb-2 flex gap-1 overflow-x-auto ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
        {(['dashboard', 'users', 'accounts', 'transactions', 'analytics'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab
                ? darkMode ? 'bg-red-600 text-white' : 'bg-red-600 text-white'
                : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab === 'dashboard' && <BarChart3 size={12} className="inline mr-1" />}
            {tab === 'users' && <Users size={12} className="inline mr-1" />}
            {tab === 'accounts' && <CreditCard size={12} className="inline mr-1" />}
            {tab === 'transactions' && <FileText size={12} className="inline mr-1" />}
            {tab === 'analytics' && <PieChart size={12} className="inline mr-1" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="px-4 py-2 min-h-[20px]">
        {error && <p className="text-[9px] font-black uppercase text-red-500">{error}</p>}
        {info && <p className="text-[9px] font-black uppercase text-emerald-500">{info}</p>}
      </div>

      {/* Content */}
      <div className="px-4">
        {activeTab === 'dashboard' && <DashboardTab stats={stats} darkMode={darkMode} isLoading={isLoading} />}
        {activeTab === 'users' && (
          <UsersTab
            users={filteredUsers}
            editingUser={editingUser}
            editForm={editForm}
            setEditForm={setEditForm}
            showPasswordForm={showPasswordForm}
            setShowPasswordForm={setShowPasswordForm}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            deleteConfirm={deleteConfirm}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onEdit={handleEditUser}
            onSave={handleSaveUser}
            onCancel={() => { setEditingUser(null); setShowPasswordForm(null); }}
            onDeleteClick={setDeleteConfirm}
            onPasswordUpdate={handlePasswordUpdate}
            darkMode={darkMode}
            currentUserId={user.id}
          />
        )}
        {activeTab === 'accounts' && (
          <AccountsTab
            accounts={filteredAccounts}
            editingAccount={editingAccount}
            balanceAdjustment={balanceAdjustment}
            setBalanceAdjustment={setBalanceAdjustment}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onEdit={handleEditAccount}
            onSave={handleSaveAccount}
            onCancel={() => setEditingAccount(null)}
            darkMode={darkMode}
          />
        )}
        {activeTab === 'transactions' && (
          <>
            <TransactionsTab
              transactions={filteredTransactions}
              filters={transactionFilters}
              setFilters={setTransactionFilters}
              selectedTransaction={selectedTransaction}
              setSelectedTransaction={setSelectedTransaction}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onStatusUpdate={handleUpdateTransactionStatus}
              onRefund={handleRefundTransaction}
              darkMode={darkMode}
            />
            {selectedTransaction && (
              <TransactionDetailModal
                transaction={selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                onStatusUpdate={handleUpdateTransactionStatus}
                onRefund={(reason) => {
                  handleRefundTransaction(selectedTransaction.id, reason);
                  setSelectedTransaction(null);
                }}
                darkMode={darkMode}
              />
            )}
          </>
        )}
        {activeTab === 'analytics' && <AnalyticsTab stats={stats} transactions={transactions} darkMode={darkMode} />}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          user={deleteConfirm}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteConfirm(null)}
          darkMode={darkMode}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// Dashboard Tab Component
const DashboardTab = ({ stats, darkMode, isLoading }: any) => {
  if (isLoading) {
    return <div className="py-8 text-center text-gray-500 text-xs">Loading dashboard...</div>;
  }

  if (!stats) return null;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="py-4 space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          icon={<DollarSign className="text-emerald-600" size={20} />}
          label="Total Assets"
          value={formatCurrency(stats.accounts?.totalBalance || 0)}
          darkMode={darkMode}
        />
        <MetricCard
          icon={<Users className="text-blue-600" size={20} />}
          label="Active Users"
          value={stats.users?.total || 0}
          darkMode={darkMode}
        />
        <MetricCard
          icon={<CreditCard className="text-purple-600" size={20} />}
          label="Total Accounts"
          value={stats.accounts?.total || 0}
          darkMode={darkMode}
        />
        <MetricCard
          icon={<Activity className="text-orange-600" size={20} />}
          label="Today's Transactions"
          value={stats.transactions?.today || 0}
          darkMode={darkMode}
        />
      </div>

      {/* Financial Overview */}
      <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <h3 className="text-xs font-black uppercase tracking-widest mb-3 text-gray-500">Financial Overview</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500">Total Deposits</span>
            <span className="text-sm font-black text-emerald-600">{formatCurrency(stats.transactions?.totalDeposits || 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500">Total Withdrawals</span>
            <span className="text-sm font-black text-red-600">{formatCurrency(stats.transactions?.totalWithdrawals || 0)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-800">
            <span className="text-[10px] font-black uppercase">Net Flow</span>
            <span className={`text-sm font-black ${(stats.transactions?.totalDeposits || 0) - (stats.transactions?.totalWithdrawals || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency((stats.transactions?.totalDeposits || 0) - (stats.transactions?.totalWithdrawals || 0))}
            </span>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <h3 className="text-xs font-black uppercase tracking-widest mb-3 text-gray-500">User Statistics</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-black">{stats.users?.total || 0}</p>
            <p className="text-[9px] text-gray-500 uppercase">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-emerald-600">{stats.users?.verified || 0}</p>
            <p className="text-[9px] text-gray-500 uppercase">Verified</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-red-600">{stats.users?.admins || 0}</p>
            <p className="text-[9px] text-gray-500 uppercase">Admins</p>
          </div>
        </div>
      </div>

      {/* Pending Items Alert */}
      {stats.transactions?.pending > 0 && (
        <div className={`rounded-xl p-4 border-2 ${darkMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="text-yellow-600" size={18} />
            <div>
              <p className="text-xs font-black text-yellow-600">{stats.transactions.pending} Pending Transactions</p>
              <p className="text-[9px] text-gray-500">Requires review</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ icon, label, value, darkMode }: any) => (
  <div className={`rounded-xl p-3 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-[8px] font-black uppercase text-gray-500">{label}</span>
    </div>
    <p className="text-lg font-black">{value}</p>
  </div>
);

// Users Tab Component
const UsersTab = ({
  users, editingUser, editForm, setEditForm, showPasswordForm, setShowPasswordForm,
  newPassword, setNewPassword, deleteConfirm, searchQuery, setSearchQuery,
  onEdit, onSave, onCancel, onDeleteClick, onPasswordUpdate, darkMode, currentUserId
}: any) => (
  <div className="py-4 space-y-3">
    {/* Search */}
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs ${darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} border`}
      />
    </div>

    {users.map((u: User) => (
      <div key={u.id} className={`rounded-xl p-3 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        {editingUser?.id === u.id ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'} border`}
              placeholder="Full Name"
            />
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'} border`}
              placeholder="Email"
            />
            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 text-[9px]">
                <input type="checkbox" checked={editForm.isAdmin} onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })} className="w-3 h-3" />
                <span className="font-black uppercase">Admin</span>
              </label>
              <label className="flex items-center gap-1.5 text-[9px]">
                <input type="checkbox" checked={editForm.isVerified} onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })} className="w-3 h-3" />
                <span className="font-black uppercase">Verified</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={onSave} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-[9px] font-black uppercase">
                <Save size={12} className="inline mr-1" />
                Save
              </button>
              <button onClick={onCancel} className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-[9px] font-black uppercase">
                <X size={12} className="inline mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-sm font-black">{u.full_name}</p>
                  {u.is_admin && <Shield size={12} className="text-red-600" />}
                  {u.is_verified ? <CheckCircle size={12} className="text-emerald-600" /> : <XCircle size={12} className="text-gray-400" />}
                </div>
                <p className="text-[10px] text-gray-500">{u.email}</p>
                <p className="text-[8px] text-gray-400 mt-1">ID: {u.id} • Joined: {new Date(u.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onEdit(u)} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                  <Edit2 size={14} className="text-blue-600" />
                </button>
                {u.id !== currentUserId && (
                  <button onClick={() => onDeleteClick(u)} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
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
                  <button onClick={() => onPasswordUpdate(u.id)} className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-[9px] font-black uppercase">
                    Update
                  </button>
                  <button onClick={() => setShowPasswordForm(null)} className="px-3 bg-gray-600 text-white py-1.5 rounded-lg text-[9px] font-black uppercase">
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
);

// Accounts Tab Component
const AccountsTab = ({
  accounts, editingAccount, balanceAdjustment, setBalanceAdjustment,
  searchQuery, setSearchQuery, onEdit, onSave, onCancel, darkMode
}: any) => {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="py-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs ${darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} border`}
        />
      </div>

      {accounts.map((acc: Account) => (
        <div key={acc.id} className={`rounded-xl p-3 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
          {editingAccount?.id === acc.id ? (
            <div className="space-y-2">
              <div>
                <label className="text-[8px] font-black uppercase text-gray-500 mb-1 block">New Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={balanceAdjustment.balance}
                  onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, balance: e.target.value })}
                  className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'} border`}
                />
              </div>
              <div>
                <label className="text-[8px] font-black uppercase text-gray-500 mb-1 block">Reason</label>
                <input
                  type="text"
                  value={balanceAdjustment.reason}
                  onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, reason: e.target.value })}
                  placeholder="Reason for adjustment"
                  className={`w-full px-2 py-1.5 rounded-lg text-xs font-bold ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'} border`}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={onSave} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-[9px] font-black uppercase">
                  <Save size={12} className="inline mr-1" />
                  Update Balance
                </button>
                <button onClick={onCancel} className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-[9px] font-black uppercase">
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
                    <p className="text-sm font-black">{acc.type} Account</p>
                    {acc.is_verified ? <CheckCircle size={12} className="text-emerald-600" /> : <XCircle size={12} className="text-gray-400" />}
                  </div>
                  <p className="text-[10px] text-gray-500">#{acc.account_number}</p>
                  <p className="text-lg font-black mt-1">{formatCurrency(acc.balance)}</p>
                  <p className="text-[8px] text-gray-400 mt-1">{acc.full_name} • {acc.email}</p>
                </div>
                <button onClick={() => onEdit(acc)} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                  <Edit2 size={14} className="text-blue-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Transactions Tab Component
const TransactionsTab = ({
  transactions, filters, setFilters, selectedTransaction, setSelectedTransaction,
  searchQuery, setSearchQuery, onStatusUpdate, onRefund, darkMode
}: any) => {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="py-4 space-y-3">
      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className={`flex-1 px-2 py-1.5 rounded-lg text-xs ${darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} border`}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className={`flex-1 px-2 py-1.5 rounded-lg text-xs ${darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} border`}
          >
            <option value="">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs ${darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} border`}
          />
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-xs">No transactions found</div>
      ) : (
        transactions.map((txn: Transaction) => (
          <div
            key={txn.id}
            onClick={() => setSelectedTransaction(txn)}
            className={`rounded-xl p-3 cursor-pointer ${darkMode ? 'bg-gray-900 border border-gray-800 hover:border-gray-700' : 'bg-white border border-gray-200 hover:border-gray-300'} transition-colors`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {txn.type === 'credit' ? (
                    <ArrowDownLeft size={14} className="text-emerald-600" />
                  ) : (
                    <ArrowUpRight size={14} className="text-red-600" />
                  )}
                  <p className="text-sm font-black">{formatCurrency(txn.amount)}</p>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                    txn.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' :
                    txn.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {txn.status}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">{txn.description}</p>
                <p className="text-[9px] text-gray-400 mt-1">{txn.full_name} • {new Date(txn.created_at).toLocaleString()}</p>
                {txn.reference && <p className="text-[8px] text-gray-400">Ref: {txn.reference}</p>}
              </div>
              {txn.status === 'pending' && (
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onStatusUpdate(txn.id, 'completed'); }}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white"
                  >
                    <CheckCircle2 size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onStatusUpdate(txn.id, 'failed'); }}
                    className="p-1.5 rounded-lg bg-red-600 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ stats, transactions, darkMode }: any) => {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="py-4 space-y-4">
      <div className={`rounded-xl p-4 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <h3 className="text-xs font-black uppercase tracking-widest mb-3 text-gray-500">Transaction Analysis</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-[10px] text-gray-500">Total Volume</span>
            <span className="text-sm font-black">{formatCurrency((stats?.transactions?.totalDeposits || 0) + (stats?.transactions?.totalWithdrawals || 0))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-gray-500">Average Transaction</span>
            <span className="text-sm font-black">
              {stats?.transactions?.total > 0
                ? formatCurrency(((stats?.transactions?.totalDeposits || 0) + (stats?.transactions?.totalWithdrawals || 0)) / stats.transactions.total)
                : formatCurrency(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Transaction Detail Modal
const TransactionDetailModal = ({ transaction, onClose, onStatusUpdate, onRefund, darkMode }: any) => {
  const [refundReason, setRefundReason] = useState('');
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-sm rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Transaction Details</h3>
            <button onClick={onClose} className={`p-1 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Amount</span>
              <span className={`text-lg font-black ${transaction.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Status</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                transaction.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' :
                transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {transaction.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500">Type</span>
              <span className="text-xs font-bold uppercase">{transaction.type}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500">Description</span>
              <p className="text-xs font-bold mt-1">{transaction.description}</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-500">User</span>
              <p className="text-xs font-bold mt-1">{transaction.full_name} ({transaction.email})</p>
            </div>
            <div>
              <span className="text-[10px] text-gray-500">Date</span>
              <p className="text-xs font-bold mt-1">{new Date(transaction.created_at).toLocaleString()}</p>
            </div>
            {transaction.reference && (
              <div>
                <span className="text-[10px] text-gray-500">Reference</span>
                <p className="text-xs font-bold mt-1">{transaction.reference}</p>
              </div>
            )}
          </div>

          {transaction.status === 'pending' && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { onStatusUpdate(transaction.id, 'completed'); onClose(); }}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-[9px] font-black uppercase"
              >
                Approve
              </button>
              <button
                onClick={() => { onStatusUpdate(transaction.id, 'failed'); onClose(); }}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-[9px] font-black uppercase"
              >
                Reject
              </button>
            </div>
          )}

          {transaction.status === 'completed' && transaction.type === 'debit' && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Refund reason (optional)"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-xs ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-900 border-gray-200'} border`}
              />
              <button
                onClick={() => onRefund(refundReason || 'Admin refund')}
                className="w-full bg-orange-600 text-white py-2 rounded-lg text-[9px] font-black uppercase"
              >
                Process Refund
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ user, onConfirm, onCancel, darkMode, isLoading }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className={`w-full max-w-sm rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Delete User</h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>

        <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-gray-800' : 'bg-red-50'}`}>
          <p className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {user.full_name}
          </p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>

        <p className={`text-xs mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          This will permanently delete the user account, all associated accounts, and transaction history. This action cannot be reversed.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
              darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={12} />
                Delete User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);
