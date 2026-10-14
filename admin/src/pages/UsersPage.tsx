import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Shield,
  Trash2,
  AlertCircle,
  UserCheck,
  UserX,
  Smartphone,
  Search,
  Crown,
  BookOpen,
  RefreshCw,
  Users as UsersIcon,
} from 'lucide-react';
import { userApi, readerApi } from '../services/api.js';
import { AdminUser, ReaderUser, UserRole } from '../types/index.js';
import { Modal } from '../components/Modal.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { useAuth } from '../context/AuthContext.js';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'readers' | 'staff'>('readers');

  // Readers State
  const [readers, setReaders] = useState<ReaderUser[]>([]);
  const [readerStats, setReaderStats] = useState({
    totalReaders: 0,
    activeReaders: 0,
    premiumReaders: 0,
  });
  const [readerSearch, setReaderSearch] = useState('');
  const [readerStatusFilter, setReaderStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isReadersLoading, setIsReadersLoading] = useState(true);
  const [deleteReaderTarget, setDeleteReaderTarget] = useState<ReaderUser | null>(null);
  const [isDeletingReader, setIsDeletingReader] = useState(false);

  // Staff State
  const [staffUsers, setStaffUsers] = useState<AdminUser[]>([]);
  const [isStaffLoading, setIsStaffLoading] = useState(true);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('editor');
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);
  const [deleteStaffTarget, setDeleteStaffTarget] = useState<AdminUser | null>(null);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Fetch Readers
  const fetchReaders = useCallback(async () => {
    setIsReadersLoading(true);
    try {
      const res = await readerApi.getReaders({
        search: readerSearch.trim() || undefined,
        status: readerStatusFilter !== 'all' ? readerStatusFilter : undefined,
      });
      if (res.success) {
        setReaders(res.data);
        if (res.stats) {
          setReaderStats(res.stats);
        }
      }
    } catch (err: any) {
      console.error('Failed to load readers:', err);
      setError('Failed to fetch mobile app readers.');
    } finally {
      setIsReadersLoading(false);
    }
  }, [readerSearch, readerStatusFilter]);

  // Fetch Staff
  const fetchStaff = useCallback(async () => {
    setIsStaffLoading(true);
    try {
      const res = await userApi.getUsers();
      if (res.success) {
        setStaffUsers(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load staff users:', err);
      setError('Failed to fetch editorial staff.');
    } finally {
      setIsStaffLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReaders();
  }, [fetchReaders]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Handle Reader Toggle Status
  const handleToggleReaderStatus = async (id: string) => {
    try {
      await readerApi.toggleReaderStatus(id);
      fetchReaders();
    } catch (err: any) {
      console.error('Failed to toggle reader status:', err);
      setError(err.response?.data?.message || 'Failed to toggle reader status.');
    }
  };

  // Handle Delete Reader
  const handleDeleteReader = async () => {
    if (!deleteReaderTarget) return;
    setIsDeletingReader(true);
    try {
      await readerApi.deleteReader(deleteReaderTarget.id || deleteReaderTarget._id!);
      setDeleteReaderTarget(null);
      fetchReaders();
    } catch (err: any) {
      console.error('Failed to delete reader:', err);
      setError(err.response?.data?.message || 'Failed to delete reader account.');
    } finally {
      setIsDeletingReader(false);
    }
  };

  // Handle Create Staff User
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    setIsSubmittingStaff(true);
    setError(null);

    try {
      await userApi.createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      setIsStaffModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('editor');
      fetchStaff();
    } catch (err: any) {
      console.error('Create user failed:', err);
      setError(err.response?.data?.message || 'Failed to create admin user.');
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  // Handle Staff Role Change
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await userApi.updateUserRole(userId, newRole);
      fetchStaff();
    } catch (err: any) {
      console.error('Failed to change user role:', err);
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  // Handle Toggle Staff Status
  const handleToggleStaffStatus = async (userId: string) => {
    try {
      await userApi.toggleUserStatus(userId);
      fetchStaff();
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      setError(err.response?.data?.message || 'Failed to toggle account status.');
    }
  };

  // Handle Delete Staff User
  const handleDeleteStaff = async () => {
    if (!deleteStaffTarget) return;
    setIsDeletingStaff(true);
    try {
      await userApi.deleteUser(deleteStaffTarget.id || deleteStaffTarget._id!);
      setDeleteStaffTarget(null);
      fetchStaff();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setIsDeletingStaff(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Users & Audience
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Manage mobile app readers, subscriber accounts, and editorial staff
          </p>
        </div>

        {activeTab === 'staff' ? (
          <button
            onClick={() => setIsStaffModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#050505] hover:bg-neutral-800 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Admin User</span>
          </button>
        ) : (
          <button
            onClick={fetchReaders}
            disabled={isReadersLoading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-medium rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReadersLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Readers</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('readers')}
          className={`flex items-center space-x-2.5 py-3 px-5 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'readers'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Mobile App Readers</span>
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-neutral-100 text-neutral-700 font-mono">
            {readerStats.totalReaders || readers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center space-x-2.5 py-3 px-5 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'staff'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Editorial Staff & Roles</span>
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-neutral-100 text-neutral-700 font-mono">
            {staffUsers.length}
          </span>
        </button>
      </div>

      {/* ==================== TAB 1: MOBILE APP READERS ==================== */}
      {activeTab === 'readers' && (
        <div className="space-y-4">
          {/* Reader Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white border border-neutral-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Total Readers</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{readerStats.totalReaders || readers.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UsersIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-neutral-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Active Accounts</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{readerStats.activeReaders}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-neutral-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Premium Subscribers</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{readerStats.premiumReaders}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-neutral-200/90">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reader name or email..."
                value={readerSearch}
                onChange={(e) => setReaderSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-neutral-500 font-medium">Status:</span>
              <select
                value={readerStatusFilter}
                onChange={(e) => setReaderStatusFilter(e.target.value as any)}
                className="text-xs bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-neutral-900"
              >
                <option value="all">All Readers</option>
                <option value="active">Active Only</option>
                <option value="inactive">Suspended Only</option>
              </select>
            </div>
          </div>

          {/* Readers Table */}
          <div className="bg-white rounded-xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold border-b border-neutral-100">
                  <tr>
                    <th className="py-3 px-5">Reader</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Subscription</th>
                    <th className="py-3 px-4 text-center">Account Status</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Joined</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Last Login</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {isReadersLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                        <div className="inline-block w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mb-2"></div>
                        <p>Loading mobile readers...</p>
                      </td>
                    </tr>
                  ) : readers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs">
                        <Smartphone className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="font-semibold text-neutral-700">No readers found</p>
                        <p className="text-neutral-400 mt-0.5">
                          {readerSearch ? 'Try adjusting your search criteria.' : 'When readers register on the mobile app, they will appear here.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    readers.map((r) => {
                      const readerId = r.id || r._id!;
                      return (
                        <tr key={readerId} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {r.avatar ? (
                                  <img
                                    src={r.avatar}
                                    alt={r.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  r.name ? r.name.slice(0, 2).toUpperCase() : 'RD'
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-neutral-900 text-sm">
                                  {r.name || 'Anonymous Reader'}
                                </div>
                                <div className="text-[11px] text-neutral-400 flex items-center space-x-1.5 mt-0.5">
                                  <BookOpen className="w-3 h-3 text-neutral-400" />
                                  <span>{r.bookmarksCount || 0} bookmarks</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-xs text-neutral-700">
                            {r.email}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {r.isPremium ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <Crown className="w-3 h-3" />
                                <span>Premium</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-600">
                                Standard
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleReaderStatus(readerId)}
                              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                r.isActive
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              }`}
                              title={r.isActive ? 'Click to suspend reader' : 'Click to activate reader'}
                            >
                              {r.isActive ? (
                                <>
                                  <UserCheck className="w-3 h-3" />
                                  <span>Active</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3 h-3" />
                                  <span>Suspended</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 hidden sm:table-cell text-xs text-neutral-500 font-mono">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                          </td>

                          <td className="py-3.5 px-4 hidden sm:table-cell text-xs text-neutral-500 font-mono">
                            {r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleDateString() : 'Never'}
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => setDeleteReaderTarget(r)}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete reader account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: EDITORIAL STAFF & ROLES ==================== */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold border-b border-neutral-100">
                <tr>
                  <th className="py-3 px-5">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Last Login</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {isStaffLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-neutral-400">
                      <div className="inline-block w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mb-2"></div>
                      <p>Loading staff...</p>
                    </td>
                  </tr>
                ) : (
                  staffUsers.map((u) => {
                    const targetId = u.id || u._id!;
                    const isCurrent = currentUser?.id === targetId || currentUser?.email === u.email;

                    return (
                      <tr key={targetId} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                u.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-neutral-900 text-sm flex items-center space-x-1.5">
                                <span>{u.name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-neutral-500 font-mono">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={u.role}
                            disabled={isCurrent}
                            onChange={(e) => handleRoleChange(targetId, e.target.value as UserRole)}
                            className="px-2.5 py-1 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 disabled:opacity-60 capitalize font-medium"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="editor">Editor</option>
                            <option value="author">Author</option>
                            <option value="moderator">Moderator</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => !isCurrent && handleToggleStaffStatus(targetId)}
                            disabled={isCurrent}
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                              u.isActive
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            } disabled:cursor-not-allowed`}
                          >
                            {u.isActive ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3" />
                                <span>Inactive</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 hidden sm:table-cell text-xs text-neutral-500 font-mono">
                          {u.lastLoginAt
                            ? new Date(u.lastLoginAt).toLocaleDateString()
                            : 'Never'}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          {!isCurrent && (
                            <button
                              onClick={() => setDeleteStaffTarget(u)}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Add Admin User"
        subtitle="Create credentials and assign an editorial role"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samuel Adekunle"
              required
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="samuel@techquo.news"
              required
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Initial Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Assigned Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-neutral-900 capitalize"
            >
              <option value="editor">Editor (Publish & Review Content)</option>
              <option value="author">Author (Draft Articles)</option>
              <option value="moderator">Moderator (Manage Comments)</option>
              <option value="super_admin">Super Admin (Full Access)</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsStaffModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingStaff}
              className="px-4 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmittingStaff ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Staff Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteStaffTarget}
        onClose={() => setDeleteStaffTarget(null)}
        onConfirm={handleDeleteStaff}
        title="Revoke Admin User"
        message={`Are you sure you want to delete administrator "${deleteStaffTarget?.name}"? They will immediately lose access to the TechQuo Admin Portal.`}
        confirmLabel="Revoke User"
        isDestructive={true}
        isLoading={isDeletingStaff}
      />

      {/* Delete Reader Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteReaderTarget}
        onClose={() => setDeleteReaderTarget(null)}
        onConfirm={handleDeleteReader}
        title="Delete Reader Account"
        message={`Are you sure you want to delete mobile reader "${deleteReaderTarget?.name}" (${deleteReaderTarget?.email})? Their bookmarks, reading history, and saved data will be removed.`}
        confirmLabel="Delete Reader"
        isDestructive={true}
        isLoading={isDeletingReader}
      />
    </div>
  );
};
