"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Mail, Calendar, Shield, UserCheck, UserX } from "lucide-react";
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
  }, [user, router]);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || (roleFilter === 'staff' && u.is_staff) || (roleFilter === 'user' && !u.is_staff);
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && u.is_active) || (statusFilter === 'inactive' && !u.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest">Loading Users...</p>
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
          <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2">
            Manage User Accounts
          </p>
        </div>
      </div>

      {/* BULK ACTIONS BAR */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-blue-900">
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
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-black uppercase text-xs hover:bg-gray-300 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by email or name..."
            className="w-full bg-white border-2 border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border-2 border-gray-200 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm font-bold uppercase text-xs"
          >
            <option value="all">All Roles</option>
            <option value="staff">Staff</option>
            <option value="user">Users</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border-2 border-gray-200 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm font-bold uppercase text-xs"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">
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
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">User</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Email</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Role</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Joined</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold uppercase">No users found</p>
                    <p className="text-[9px] text-gray-400 mt-2">User management endpoint needs to be implemented</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black italic">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black">{user.first_name} {user.last_name}</p>
                          <p className="text-[9px] text-gray-400">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm font-bold">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        {user.email_verified ? (
                          <span className="text-[9px] font-black px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center gap-1">
                            <UserCheck size={12} />
                            Verified
                          </span>
                        ) : (
                          <span className="text-[9px] font-black px-2 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200">
                            Unverified
                          </span>
                        )}
                        {!user.is_active && (
                          <span className="text-[9px] font-black px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                            <UserX size={12} />
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      {user.is_staff ? (
                        <span className="text-[9px] font-black px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1 w-fit">
                          <Shield size={12} />
                          Admin
                        </span>
                      ) : (
                        <span className="text-[9px] font-black px-2 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                          User
                        </span>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-[9px] text-gray-400">
                          {new Date(user.date_joined).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-[9px] text-gray-400">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </span>
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

