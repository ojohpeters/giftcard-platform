"use client";
import React, { useState, useEffect } from 'react';
import {
  ChevronRight, Mail, Save, Lock, ShieldCheck, CheckCircle2, Clock,
  AlertCircle, CreditCard, Upload
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { userAPI, kycAPI, walletAPI, authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

const DOCUMENT_TYPES = [
  { value: 'national_id', label: 'National ID Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'residence_card', label: 'Residence Permit / Card' },
  { value: 'drivers_license', label: "Driver's License" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  // Email-login setup for phone-created accounts
  const [linkEmailValue, setLinkEmailValue] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [linkSaving, setLinkSaving] = useState(false);
  const [linkMsg, setLinkMsg] = useState('');
  const [linkErr, setLinkErr] = useState('');

  const handleLinkEmail = async () => {
    setLinkErr(''); setLinkMsg('');
    if (!linkEmailValue.trim() || !linkPassword) { setLinkErr(t('dashSettings.emailLoginNeed')); return; }
    setLinkSaving(true);
    try {
      const res = await authAPI.linkEmail(linkEmailValue.trim(), linkPassword);
      if (res.data?.user) updateUser(res.data.user);
      setLinkMsg(res.data?.message || t('dashSettings.emailLoginSaved'));
      setLinkPassword('');
    } catch (e: any) {
      setLinkErr(e.response?.data?.error || t('dashSettings.emailLoginFailed'));
    } finally {
      setLinkSaving(false);
    }
  };

  // ---- KYC state ----
  const [kyc, setKyc] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<string>('loading'); // loading | not_submitted | pending | approved | rejected
  const [kycForm, setKycForm] = useState({
    first_name: '', last_name: '', date_of_birth: '', country: '',
    document_type: 'national_id', document_number: '',
  });
  const [docFront, setDocFront] = useState<File | null>(null);
  const [docBack, setDocBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycError, setKycError] = useState('');

  // ---- Banking state ----
  const [bank, setBank] = useState({
    bank_name: '', account_holder_first_name: '', account_holder_last_name: '',
    account_number: '', card_number: '', iban: '', swift_code: '',
  });
  const [maskedCard, setMaskedCard] = useState('');
  const [bankSaving, setBankSaving] = useState(false);
  const [bankMsg, setBankMsg] = useState('');
  const [bankError, setBankError] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhoneNumber(user.phone_number || '');
      setEmail(user.email || '');
      // Pre-fill KYC legal name from the profile as a convenience.
      setKycForm((f) => ({ ...f, first_name: user.first_name || '', last_name: user.last_name || '' }));
    }
  }, [user]);

  useEffect(() => {
    // Load KYC status
    kycAPI.getStatus()
      .then((r) => {
        const s = r.data?.status || 'not_submitted';
        setKycStatus(s);
        if (s !== 'not_submitted') setKyc(r.data);
      })
      .catch(() => setKycStatus('not_submitted'));

    // Load existing bank detail (404 = none yet)
    walletAPI.getBankDetail()
      .then((r) => {
        const d = r.data || {};
        setBank({
          bank_name: d.bank_name || '',
          account_holder_first_name: d.account_holder_first_name || '',
          account_holder_last_name: d.account_holder_last_name || '',
          account_number: d.account_number || '',
          card_number: '', // never prefilled — API returns it masked
          iban: d.iban || '',
          swift_code: d.swift_code || '',
        });
        setMaskedCard(d.card_number || '');
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const response = await userAPI.updateProfile({
        first_name: firstName, last_name: lastName, phone_number: phoneNumber,
      });
      updateUser(response.data);
      setSuccess(t('dashSettings.profileUpdated'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('dashSettings.profileUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== newPasswordConfirm) { setError(t('dashSettings.passwordsNoMatch')); return; }
    if (newPassword.length < 8) { setError(t('dashSettings.passwordMinLength')); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await userAPI.changePassword({
        old_password: oldPassword, new_password: newPassword, new_password_confirm: newPasswordConfirm,
      });
      setSuccess(t('dashSettings.passwordChanged'));
      setShowPasswordChange(false);
      setOldPassword(''); setNewPassword(''); setNewPasswordConfirm('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.old_password?.[0] || t('dashSettings.passwordChangeFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitKyc = async () => {
    setKycError('');
    if (!kycForm.first_name || !kycForm.last_name || !kycForm.date_of_birth || !kycForm.country || !kycForm.document_number) {
      setKycError(t('dashSettings.fillAllFields')); return;
    }
    if (!docFront || !selfie) {
      setKycError(t('dashSettings.uploadFrontAndSelfie')); return;
    }
    setKycSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(kycForm).forEach(([k, v]) => fd.append(k, v));
      fd.append('document_front', docFront);
      if (docBack) fd.append('document_back', docBack);
      fd.append('selfie', selfie);
      const r = await kycAPI.submit(fd);
      setKyc(r.data);
      setKycStatus('pending');
    } catch (err: any) {
      const d = err.response?.data;
      setKycError(d?.error || (d && typeof d === 'object' ? String(Object.values(d)[0]) : t('dashSettings.submissionFailed')));
    } finally {
      setKycSubmitting(false);
    }
  };

  const handleSaveBank = async () => {
    setBankError(''); setBankMsg('');
    if (!bank.bank_name) { setBankError(t('dashSettings.bankNameRequired')); return; }
    if (!bank.account_number && !bank.card_number && !bank.iban) {
      setBankError(t('dashSettings.provideOnePayment')); return;
    }
    setBankSaving(true);
    try {
      const r = await walletAPI.saveBankDetail(bank);
      setMaskedCard(r.data?.card_number || maskedCard);
      setBank((b) => ({ ...b, card_number: '' }));
      setBankMsg(t('dashSettings.paymentMethodSaved'));
      setTimeout(() => setBankMsg(''), 3000);
    } catch (err: any) {
      const d = err.response?.data;
      setBankError(d?.error || (d && typeof d === 'object' ? String(Object.values(d)[0]) : t('dashSettings.saveFailed')));
    } finally {
      setBankSaving(false);
    }
  };

  const handleLogout = async () => { await logout(); router.push('/'); };

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';

  const inputCls = "w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl py-3.5 px-4 outline-none focus:border-blue-600 text-sm dark:text-neutral-100";
  const labelCls = "text-[11px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-2 block";

  const FileField = ({ label, file, onPick, required }: { label: string; file: File | null; onPick: (f: File | null) => void; required?: boolean }) => (
    <div>
      <label className={labelCls}>{label}{required && ' *'}</label>
      <label className="flex items-center gap-3 w-full bg-gray-50 dark:bg-neutral-800 border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl py-3.5 px-4 cursor-pointer hover:border-blue-600 transition-colors">
        <Upload size={18} className="text-gray-400 dark:text-neutral-500 shrink-0" />
        <span className="text-sm text-gray-600 dark:text-neutral-300 truncate">{file ? file.name : t('dashSettings.tapToUpload')}</span>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0] || null)} />
      </label>
    </div>
  );

  const kycFormBlock = (
    <div className="p-4 md:p-8 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>{t('dashSettings.legalFirstName')}</label>
          <input className={inputCls} value={kycForm.first_name} onChange={(e) => setKycForm({ ...kycForm, first_name: e.target.value })} /></div>
        <div><label className={labelCls}>{t('dashSettings.legalLastName')}</label>
          <input className={inputCls} value={kycForm.last_name} onChange={(e) => setKycForm({ ...kycForm, last_name: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>{t('dashSettings.dateOfBirth')}</label>
          <input type="date" className={inputCls} value={kycForm.date_of_birth} onChange={(e) => setKycForm({ ...kycForm, date_of_birth: e.target.value })} /></div>
        <div><label className={labelCls}>{t('dashSettings.country')}</label>
          <input className={inputCls} value={kycForm.country} onChange={(e) => setKycForm({ ...kycForm, country: e.target.value })} placeholder={t('dashSettings.countryPlaceholder')} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>{t('dashSettings.documentType')}</label>
          <select className={inputCls} value={kycForm.document_type} onChange={(e) => setKycForm({ ...kycForm, document_type: e.target.value })}>
            {DOCUMENT_TYPES.map((d) => <option key={d.value} value={d.value}>{t('dashSettings.docType_' + d.value)}</option>)}
          </select></div>
        <div><label className={labelCls}>{t('dashSettings.documentNumber')}</label>
          <input className={inputCls} value={kycForm.document_number} onChange={(e) => setKycForm({ ...kycForm, document_number: e.target.value })} /></div>
      </div>
      <FileField label={t('dashSettings.docFront')} file={docFront} onPick={setDocFront} required />
      <FileField label={t('dashSettings.docBack')} file={docBack} onPick={setDocBack} />
      <FileField label={t('dashSettings.selfie')} file={selfie} onPick={setSelfie} required />
      {kycError && <p role="alert" className="text-xs font-bold text-red-600">{kycError}</p>}
      <button onClick={handleSubmitKyc} disabled={kycSubmitting}
        className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
        <ShieldCheck size={16} />{kycSubmitting ? t('dashSettings.submitting') : t('dashSettings.submitForVerification')}
      </button>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center py-4 md:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-x-hidden">
      <div className="w-full max-w-md md:max-w-2xl space-y-6 md:space-y-12">

        <div className="space-y-1 text-center px-2">
          <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            {t('dashSettings.headingSettings')}<span className="text-blue-600">/</span>{t('dashSettings.headingConfig')}
          </h1>
          <p className="text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-[0.2em]">{t('dashSettings.systemPreferences')}</p>
        </div>

        {error && <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl"><p className="text-xs text-red-600 dark:text-red-300 font-bold">{error}</p></div>}
        {success && <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-2xl"><p className="text-xs text-green-600 dark:text-green-300 font-bold">{success}</p></div>}

        <div className="grid grid-cols-1 gap-4 md:gap-8 px-2 md:px-0">

          {/* 01. IDENTITY */}
          <section className="space-y-2">
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest px-1">{t('dashSettings.section01')}</h3>
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl md:rounded-[32px] overflow-hidden">
              <div className="p-5 md:p-6 flex items-center justify-between border-b border-gray-50 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black italic shrink-0">{initials}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-black uppercase truncate">{firstName && lastName ? `${firstName} ${lastName}` : t('dashSettings.userFallback')}</p>
                    <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">#{user?.id || 'N/A'}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 dark:text-neutral-600 rtl:rotate-180 shrink-0" />
              </div>
              <div className="p-5 md:p-6 space-y-4">
                <div><label className={labelCls}>{t('dashSettings.firstName')}</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>{t('dashSettings.lastName')}</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>{t('dashSettings.phoneNumber')}</label>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputCls} /></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 bg-gray-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-gray-400 dark:text-neutral-500 shrink-0"><Mail size={18} /></div>
                    <div className="min-w-0"><p className="text-sm font-black uppercase">{t('dashSettings.email')}</p><p className="text-xs text-gray-400 dark:text-neutral-500 truncate">{email}</p></div>
                  </div>
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border shrink-0 ms-2 ${user?.email_verified ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300 border-green-100' : 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-300 border-yellow-100'}`}>
                    {user?.email_verified ? t('dashSettings.verified') : t('dashSettings.unverified')}
                  </span>
                </div>
                <button onClick={handleSaveProfile} disabled={saving}
                  className="w-full md:w-auto py-3.5 md:px-8 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  <Save size={16} />{saving ? t('dashSettings.saving') : t('dashSettings.saveChanges')}
                </button>
              </div>
            </div>
          </section>

          {/* Email login setup — only for phone-created accounts */}
          {(user as any)?.is_phone_account && (
            <section className="space-y-2">
              <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest px-1">{t('dashSettings.emailLoginTitle')}</h3>
              <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl md:rounded-[32px] p-5 md:p-6 space-y-4">
                <p className="text-sm text-gray-500 dark:text-neutral-400">{t('dashSettings.emailLoginHint')}</p>
                {linkMsg && <p className="text-xs text-green-600 dark:text-green-400 font-bold">{linkMsg}</p>}
                {linkErr && <p className="text-xs text-red-600 dark:text-red-400 font-bold">{linkErr}</p>}
                <div className="space-y-3">
                  <input type="email" dir="ltr" value={linkEmailValue} onChange={(e) => setLinkEmailValue(e.target.value)} placeholder="you@example.com"
                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 dark:text-neutral-100 rounded-xl py-3.5 px-4 outline-none focus:border-blue-600 text-sm" />
                  <input type="password" value={linkPassword} onChange={(e) => setLinkPassword(e.target.value)} autoComplete="new-password" placeholder={t('dashSettings.emailLoginPwPlaceholder')}
                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 dark:text-neutral-100 rounded-xl py-3.5 px-4 outline-none focus:border-blue-600 text-sm" />
                </div>
                <button onClick={handleLinkEmail} disabled={linkSaving}
                  className="w-full md:w-auto py-3.5 md:px-8 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  <Save size={16} /> {linkSaving ? t('dashSettings.saving') : t('dashSettings.emailLoginSave')}
                </button>
              </div>
            </section>
          )}

          {/* 02. IDENTITY VERIFICATION (KYC) */}
          <section className="space-y-2">
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest px-1">{t('dashSettings.section02')}</h3>
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl md:rounded-[32px] overflow-hidden">
              <div className="p-5 md:p-6 flex items-center justify-between border-b border-gray-50 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/40 rounded-lg flex items-center justify-center text-blue-600 shrink-0"><ShieldCheck size={20} /></div>
                  <div><p className="text-sm font-black uppercase">{t('dashSettings.kycTitle')}</p>
                    <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">{t('dashSettings.kycSubtitle')}</p></div>
                </div>
                {kycStatus === 'approved' && <span className="text-[11px] font-black px-2 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300 border border-green-100">{t('dashSettings.verified')}</span>}
                {kycStatus === 'pending' && <span className="text-[11px] font-black px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-300 border border-yellow-100">{t('dashSettings.underReview')}</span>}
                {kycStatus === 'rejected' && <span className="text-[11px] font-black px-2 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-100">{t('dashSettings.rejected')}</span>}
                {kycStatus === 'not_submitted' && <span className="text-[11px] font-black px-2 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700">{t('dashSettings.notSubmitted')}</span>}
              </div>

              {kycStatus === 'loading' && <div className="p-8 text-center text-gray-400 dark:text-neutral-500 text-sm">{t('dashSettings.loading')}</div>}

              {kycStatus === 'approved' && (
                <div className="p-6 py-10 md:py-12 flex flex-col items-center text-center gap-3">
                  <CheckCircle2 size={44} className="text-green-600" />
                  <p className="text-base font-black text-gray-900 dark:text-neutral-100">{t('dashSettings.identityVerifiedTitle')}</p>
                  <p className="text-sm text-gray-500 dark:text-neutral-400 max-w-xs">{t('dashSettings.identityVerifiedDesc')}</p>
                </div>
              )}

              {kycStatus === 'pending' && (
                <div className="p-6 py-10 md:py-12 flex flex-col items-center text-center gap-3">
                  <Clock size={44} className="text-yellow-500" />
                  <p className="text-base font-black text-gray-900 dark:text-neutral-100">{t('dashSettings.underReviewTitle')}</p>
                  <p className="text-sm text-gray-500 dark:text-neutral-400 max-w-xs">{t('dashSettings.underReviewDesc')}</p>
                </div>
              )}

              {kycStatus === 'rejected' && (
                <>
                  <div className="mx-5 md:mx-6 mt-5 md:mt-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-black text-red-700 dark:text-red-300">{t('dashSettings.rejectedTitle')}</p>
                      {kyc?.admin_notes && <p className="text-sm text-red-600 dark:text-red-300 mt-1">{kyc.admin_notes}</p>}
                      <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{t('dashSettings.rejectedDesc')}</p>
                    </div>
                  </div>
                  {kycFormBlock}
                </>
              )}

              {kycStatus === 'not_submitted' && kycFormBlock}
            </div>
          </section>

          {/* 03. SECURITY */}
          <section className="space-y-2">
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest px-1">{t('dashSettings.section03')}</h3>
            <div className="bg-[#0A0A0B] rounded-2xl md:rounded-[32px] p-1 border border-white/5">
              {!showPasswordChange ? (
                <button onClick={() => setShowPasswordChange(true)}
                  className="w-full p-5 md:p-6 flex items-center justify-between bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <Lock size={20} className="text-blue-500 shrink-0" />
                    <div><p className="text-sm font-black uppercase text-white">{t('dashSettings.changePassword')}</p>
                      <p className="text-[11px] font-bold text-gray-500 uppercase mt-0.5">{t('dashSettings.updatePassword')}</p></div>
                  </div>
                  <ChevronRight size={16} className="text-gray-600 rtl:rotate-180 shrink-0" />
                </button>
              ) : (
                <div className="p-5 md:p-6 bg-white/5 rounded-xl space-y-4">
                  <div><label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 block">{t('dashSettings.currentPassword')}</label>
                    <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 outline-none focus:border-blue-600 text-sm text-white" placeholder="••••••••" /></div>
                  <div><label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 block">{t('dashSettings.newPassword')}</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 outline-none focus:border-blue-600 text-sm text-white" placeholder="••••••••" /></div>
                  <div><label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 block">{t('dashSettings.confirmNewPassword')}</label>
                    <input type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 outline-none focus:border-blue-600 text-sm text-white" placeholder="••••••••" /></div>
                  <div className="flex gap-2">
                    <button onClick={handleChangePassword} disabled={saving} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all">{saving ? t('dashSettings.changing') : t('dashSettings.changePassword')}</button>
                    <button onClick={() => { setShowPasswordChange(false); setOldPassword(''); setNewPassword(''); setNewPasswordConfirm(''); setError(''); }} className="px-5 py-3.5 bg-white/10 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all">{t('dashSettings.cancel')}</button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 04. BANKING / PAYMENT METHOD */}
          <section className="space-y-2">
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest px-1">{t('dashSettings.section04')}</h3>
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl md:rounded-[32px] overflow-hidden">
              <div className="p-5 md:p-6 flex items-center gap-3 border-b border-gray-50 dark:border-neutral-800">
                <div className="w-11 h-11 bg-gray-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-gray-400 dark:text-neutral-500 shrink-0"><CreditCard size={20} /></div>
                <div><p className="text-sm font-black uppercase">{t('dashSettings.payoutDetails')}</p>
                  <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">{t('dashSettings.payoutSubtitle')}</p></div>
              </div>
              <div className="p-5 md:p-6 space-y-4">
                <div><label className={labelCls}>{t('dashSettings.bankName')}</label>
                  <input className={inputCls} value={bank.bank_name} onChange={(e) => setBank({ ...bank, bank_name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>{t('dashSettings.holderFirstName')}</label>
                    <input className={inputCls} value={bank.account_holder_first_name} onChange={(e) => setBank({ ...bank, account_holder_first_name: e.target.value })} /></div>
                  <div><label className={labelCls}>{t('dashSettings.holderLastName')}</label>
                    <input className={inputCls} value={bank.account_holder_last_name} onChange={(e) => setBank({ ...bank, account_holder_last_name: e.target.value })} /></div>
                </div>
                <div><label className={labelCls}>{t('dashSettings.accountNumber')}</label>
                  <input className={inputCls} value={bank.account_number} onChange={(e) => setBank({ ...bank, account_number: e.target.value })} /></div>
                <div><label className={labelCls}>{t('dashSettings.cardNumber')} {maskedCard && <span className="text-gray-400 dark:text-neutral-500 normal-case">({t('dashSettings.savedLabel')}: {maskedCard})</span>}</label>
                  <input className={inputCls} value={bank.card_number} onChange={(e) => setBank({ ...bank, card_number: e.target.value })} placeholder={maskedCard ? t('dashSettings.replaceCardPlaceholder') : ''} inputMode="numeric" /></div>
                <div><label className={labelCls}>{t('dashSettings.iban')}</label>
                  <input className={inputCls} value={bank.iban} onChange={(e) => setBank({ ...bank, iban: e.target.value })} /></div>
                <div><label className={labelCls}>{t('dashSettings.swift')}</label>
                  <input className={inputCls} value={bank.swift_code} onChange={(e) => setBank({ ...bank, swift_code: e.target.value })} /></div>
                {bankError && <p role="alert" className="text-xs font-bold text-red-600">{bankError}</p>}
                {bankMsg && <p className="text-xs font-bold text-green-600">{bankMsg}</p>}
                <button onClick={handleSaveBank} disabled={bankSaving}
                  className="w-full md:w-auto py-3.5 md:px-8 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  <Save size={16} />{bankSaving ? t('dashSettings.saving') : t('dashSettings.savePaymentMethod')}
                </button>
              </div>
            </div>
          </section>

          <button onClick={handleLogout}
            className="w-full py-4 bg-red-500 text-white font-black uppercase text-[11px] tracking-widest rounded-xl active:scale-95 shadow-lg shadow-red-100 dark:shadow-none hover:bg-red-600 transition-all">
            {t('dashSettings.terminateSession')}
          </button>
        </div>
      </div>
    </div>
  );
}
