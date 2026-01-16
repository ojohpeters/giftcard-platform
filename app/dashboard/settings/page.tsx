"use client";
import React, { useState, useEffect } from 'react';
import { User, CreditCard, ChevronRight, LogOut, Fingerprint, Mail, Phone, Save, Lock } from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhoneNumber(user.phone_number || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await userAPI.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
      });
      updateUser(response.data);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== newPasswordConfirm) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await userAPI.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      setSuccess('Password changed successfully');
      setShowPasswordChange(false);
      setOldPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.old_password?.[0] || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="w-full flex flex-col items-center py-4 md:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-x-hidden">
      
      <div className="w-full max-w-md md:max-w-2xl space-y-6 md:space-y-12">
        
        {/* HEADER */}
        <div className="space-y-1 text-center px-2">
          <h1 className="text-2xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            Settings<span className="text-blue-600">/</span>Config
          </h1>
          <p className="text-[8px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            System Preferences
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-xs text-red-600 font-bold">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
            <p className="text-xs text-green-600 font-bold">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:gap-8 px-2 md:px-0">
          
          {/* SECTION 01: IDENTITY */}
          <section className="space-y-2">
            <h3 className="text-[8px] font-black text-blue-600 uppercase tracking-widest px-1">01. Identity</h3>
            <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[32px] overflow-hidden">
              <div className="p-4 md:p-8 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black italic shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] md:text-sm font-black uppercase truncate">
                      {firstName && lastName ? `${firstName} ${lastName}` : 'User'}
                    </p>
                    <p className="text-[8px] md:text-[10px] text-gray-400">#{user?.id || 'N/A'}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
              
              <div className="p-4 md:p-8 space-y-4">
                <div>
                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 block">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-sm font-black uppercase">Email</p>
                      <p className="text-[9px] text-gray-400 truncate">{email}</p>
                    </div>
                  </div>
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full border ${
                    user?.email_verified 
                      ? 'bg-green-50 text-green-600 border-green-100' 
                      : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                  }`}>
                    {user?.email_verified ? 'VERIFIED' : 'UNVERIFIED'}
                  </span>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 02: SECURITY */}
          <section className="space-y-2">
            <h3 className="text-[8px] font-black text-blue-600 uppercase tracking-widest px-1">02. Security</h3>
            <div className="bg-[#0A0A0B] rounded-2xl md:rounded-[32px] p-1 border border-white/5">
              {!showPasswordChange ? (
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="w-full p-3 md:p-7 flex items-center justify-between bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-blue-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-white">Change Password</p>
                      <p className="text-[8px] font-bold text-gray-500 uppercase">Update your password</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              ) : (
                <div className="p-3 md:p-7 bg-white/5 rounded-xl space-y-4">
                  <div>
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2 block">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Confirm New Password</label>
                    <input
                      type="password"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordChange(false);
                        setOldPassword('');
                        setNewPassword('');
                        setNewPasswordConfirm('');
                        setError('');
                      }}
                      className="px-4 py-3 bg-white/10 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 03: BANKING */}
          <section className="space-y-2">
            <h3 className="text-[8px] font-black text-blue-600 uppercase tracking-widest px-1">03. Banking</h3>
            <div className="bg-white border border-gray-100 rounded-2xl md:rounded-[32px] p-4 md:p-10 space-y-4">
              <p className="text-[9px] text-gray-400 text-center">Payment methods coming soon</p>
              <button className="w-full py-3 border border-dashed border-gray-200 rounded-xl text-[9px] font-black uppercase text-gray-400 hover:border-blue-600 hover:text-blue-600 transition-all">
                + Add Payment Method
              </button>
            </div>
          </section>

          {/* TERMINATE */}
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl active:scale-95 shadow-lg shadow-red-100 hover:bg-red-600 transition-all"
          >
            Terminate Session
          </button>

        </div>
      </div>
    </div>
  );
}
