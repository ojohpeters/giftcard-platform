"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Mail, Calendar, Shield, UserCheck, UserX, Filter } from "lucide-react";
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  email_verified: boolean;
  date_joined: string;
  last_login?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!user?.is_staff) {
      router.push('/dashboard');
      return;
    }
    loadUsers();
  }, [user, router, roleFilter, statusFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        loadUsers();
      } else if (searchTerm === '') {
        loadUsers();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await adminAPI.getAllUsers(params);
      setUsers(response.data.results || response.data || []);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      if (error.response?.status === 400) {
        console.error('Bad request error:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  const handleToggleBan = async (target: User) => {
    const banning = target.is_active;
    const label = `${target.first_name || ''} ${target.last_name || ''}`.trim() || target.email;
    if (!confirm(`${banning ? 'Ban' : 'Unban'} ${label}? ${banning ? 'They will be logged out and unable to sign in.' : 'They will be able to sign in again.'}`)) return;
    setBusyUserId(target.id);
    try {
      await adminAPI.setUserActive(target.id, !target.is_active);
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, is_active: !u.is_active } : u)));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update account status');
    } finally {
      setBusyUserId(null);
    }
  };

  // Users are already filtered by the backend
  const filteredUsers = users;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-widest">Loading Users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            Users<span className="text-blue-600">.</span>
          </h1>
          <p className="text-[10px] md:text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-[0.4em] mt-2">
            Manage User Accounts
          </p>
        </div>
      </div>

      {/* BULK ACTIONS BAR */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-blue-900 dark:text-blue-200">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert(`Activating ${selectedUsers.length} users`);
                setSelectedUsers([]);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-xl font-black uppercase text-xs hover:bg-green-700 transition-all"
            >
              Activate
            </button>
            <button
              onClick={() => {
                alert(`Deactivating ${selectedUsers.length} users`);
                setSelectedUsers([]);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-xl font-black uppercase text-xs hover:bg-yellow-700 transition-all"
            >
              Deactivate
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="px-4 py-2 bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-xl font-black uppercase text-xs hover:bg-gray-300 dark:hover:bg-neutral-700 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by email or name..."
            className="w-full bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 text-sm dark:text-neutral-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400 dark:text-neutral-500" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm font-bold uppercase text-xs dark:text-neutral-100"
          >
            <option value="all">All Roles</option>
            <option value="staff">Staff</option>
            <option value="user">Users</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm font-bold uppercase text-xs dark:text-neutral-100"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-[32px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-800 border-b-2 border-gray-200 dark:border-neutral-700">
              <tr>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="w-5 h-5 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">User</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Email</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Status</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Role</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Joined</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Last Login</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
                    <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase">No users found</p>
                    <p className="text-[9px] text-gray-400 dark:text-neutral-500 mt-2">User management endpoint needs to be implemented</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                    <td className="p-6">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black italic">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black">{user.first_name} {user.last_name}</p>
                          <p className="text-[9px] text-gray-400 dark:text-neutral-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400 dark:text-neutral-500" />
                        <span className="text-sm font-bold">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        {user.email_verified ? (
                          <span className="text-[9px] font-black px-2 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300 border border-green-200 dark:border-green-900 flex items-center gap-1">
                            <UserCheck size={12} />
                            Verified
                          </span>
                        ) : (
                          <span className="text-[9px] font-black px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-900">
                            Unverified
                          </span>
                        )}
                        {!user.is_active && (
                          <span className="text-[9px] font-black px-2 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-center gap-1">
                            <UserX size={12} />
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      {user.is_staff ? (
                        <span className="text-[9px] font-black px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900 flex items-center gap-1 w-fit">
                          <Shield size={12} />
                          Admin
                        </span>
                      ) : (
                        <span className="text-[9px] font-black px-2 py-1 rounded-full bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700">
                          User
                        </span>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400 dark:text-neutral-500" />
                        <span className="text-[9px] text-gray-400 dark:text-neutral-500">
                          {new Date(user.date_joined).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-[9px] text-gray-400 dark:text-neutral-500">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td className="p-6">
                      {user.is_staff ? (
                        <span className="text-[9px] text-gray-300 dark:text-neutral-600">—</span>
                      ) : (
                        <button
                          onClick={() => handleToggleBan(user)}
                          disabled={busyUserId === user.id}
                          className={`text-[9px] font-black px-3 py-1.5 rounded-full border transition-all disabled:opacity-50 flex items-center gap-1 ${
                            user.is_active
                              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-950/60'
                              : 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300 border-green-200 dark:border-green-900 hover:bg-green-100 dark:hover:bg-green-950/60'
                          }`}
                        >
                          <UserX size={11} />
                          {busyUserId === user.id ? '…' : user.is_active ? 'Ban' : 'Unban'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

