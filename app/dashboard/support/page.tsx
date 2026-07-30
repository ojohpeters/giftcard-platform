"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Plus, Send, CheckCircle2, Clock, AlertCircle, X } from "lucide-react";
import { supportAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

interface SupportMessage {
  id: number;
  message: string;
  sender_email: string;
  is_admin: boolean;
  is_read: boolean;
  created_at: string;
}

interface SupportTicket {
  id: number;
  subject: string;
  status: string;
  priority: string;
  messages: SupportMessage[];
  created_at: string;
  updated_at: string;
}

export default function SupportPage() {
  const { t } = useI18n();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messageText, setMessageText] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/support');
      return;
    }
    loadTickets();
  }, [isInitialized, isAuthenticated, router]);

  const loadTickets = async () => {
    try {
      const response = await supportAPI.list();
      setTickets(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTicket = async (ticketId: number) => {
    try {
      const response = await supportAPI.get(ticketId);
      setSelectedTicket(response.data);
      // Update ticket in list
      setTickets(tickets.map(t => t.id === ticketId ? response.data : t));
    } catch (error) {
      console.error('Failed to load ticket:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!newSubject.trim() || !newMessage.trim()) return;

    setCreateError(null);
    setCreating(true);
    try {
      // The backend creates the ticket AND its first message from this one call.
      const response = await supportAPI.create({
        subject: newSubject,
        priority: 'medium',
        message: newMessage,
      });
      await loadTickets();
      await loadTicket(response.data.id);
      setShowCreateForm(false);
      setNewSubject('');
      setNewMessage('');
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      setCreateError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          t('support.createError')
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !messageText.trim()) return;
    
    setSending(true);
    try {
      await supportAPI.addMessage(selectedTicket.id, messageText);
      setMessageText('');
      await loadTicket(selectedTicket.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-200';
      case 'closed':
        return 'bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border-gray-200 dark:border-neutral-700';
      default:
        return 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300 border-orange-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle2 size={12} />;
      case 'in_progress':
        return <Clock size={12} />;
      case 'closed':
        return <X size={12} />;
      default:
        return <AlertCircle size={12} />;
    }
  };

  if (!isInitialized || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-widest">{t('support.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            {t('support.heading')}<span className="text-blue-600">.</span>
          </h1>
          <p className="text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-[0.4em] mt-2">
            {t('support.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full md:w-auto shrink-0 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          {t('support.newTicket')}
        </button>
      </div>

      {/* CREATE FORM */}
      {showCreateForm && (
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-[32px] p-5 md:p-8 space-y-5">
          <h2 className="text-xl font-black uppercase italic">{t('support.createTicketTitle')}</h2>
          <div>
            <label className="text-[11px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-2 block">{t('support.subjectLabel')}</label>
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder={t('support.subjectPlaceholder')}
              className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl py-3.5 px-4 text-sm outline-none focus:border-blue-600 dark:text-neutral-100"
            />
          </div>
          <div>
            <label className="text-[11px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-2 block">{t('support.messageLabel')}</label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('support.messagePlaceholder')}
              rows={4}
              className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl py-3.5 px-4 text-sm outline-none focus:border-blue-600 dark:text-neutral-100 resize-none"
            />
          </div>
          {createError && (
            <p role="alert" className="text-sm font-bold text-red-600">{createError}</p>
          )}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={handleCreateTicket}
              disabled={creating || !newSubject.trim() || !newMessage.trim()}
              className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {creating ? t('support.creating') : t('support.createTicketButton')}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewSubject('');
                setNewMessage('');
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 dark:hover:bg-neutral-700 transition-all"
            >
              {t('support.cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: TICKET LIST */}
        <div className="lg:col-span-1 space-y-3">
          {tickets.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-[32px] px-6 py-14 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center mb-5">
                <MessageSquare className="w-8 h-8 text-gray-300 dark:text-neutral-600" />
              </div>
              <p className="text-lg font-black uppercase italic text-gray-900 dark:text-neutral-100">{t('support.noTickets')}</p>
              <p className="text-sm text-gray-400 dark:text-neutral-500 mt-2 max-w-xs">{t('support.subtitle')}</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-6 w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                {t('support.newTicket')}
              </button>
            </div>
          ) : (
            tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => loadTicket(ticket.id)}
                className={`w-full text-start bg-white dark:bg-neutral-900 border rounded-[24px] p-5 transition-all ${
                  selectedTicket?.id === ticket.id
                    ? 'border-blue-600 shadow-lg'
                    : 'border-gray-100 dark:border-neutral-800 hover:border-gray-200 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-black uppercase truncate flex-1">{ticket.subject}</h3>
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-[11px] text-gray-400 dark:text-neutral-500 font-bold uppercase">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                  {ticket.messages && ticket.messages.length > 0 && (
                    <p className="text-[11px] text-gray-500 dark:text-neutral-400 font-bold">
                      {ticket.messages.length} {ticket.messages.length !== 1 ? t('support.messagesPlural') : t('support.messageSingular')}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* RIGHT: MESSAGE VIEW */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-[32px] p-5 md:p-8 space-y-6 flex flex-col h-[560px] md:h-[600px]">
              {/* HEADER */}
              <div className="border-b border-gray-100 dark:border-neutral-800 pb-4">
                <h2 className="text-xl font-black uppercase italic mb-2">{selectedTicket.subject}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusIcon(selectedTicket.status)}
                    {selectedTicket.status}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-neutral-500 font-bold uppercase">
                    {t('support.created')} {new Date(selectedTicket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto space-y-4 pe-1">
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl ${
                        msg.is_admin
                          ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 ms-4 md:ms-8'
                          : 'bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-800 me-4 md:me-8'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-[11px] font-black uppercase text-gray-600 dark:text-neutral-300">
                          {msg.is_admin ? t('support.supportTeam') : t('support.you')}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-neutral-500 shrink-0">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-neutral-100 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 dark:text-neutral-500 text-center py-8">{t('support.noMessages')}</p>
                )}
              </div>

              {/* MESSAGE INPUT */}
              <div className="border-t border-gray-100 dark:border-neutral-800 pt-4 space-y-3">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={t('support.replyPlaceholder')}
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl py-3.5 px-4 text-sm outline-none focus:border-blue-600 dark:text-neutral-100 resize-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageText.trim()}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  {sending ? t('support.sending') : t('support.sendMessage')}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-[32px] px-6 py-16 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center mb-5">
                <MessageSquare className="w-10 h-10 text-gray-300 dark:text-neutral-600" />
              </div>
              <p className="text-lg font-black uppercase italic text-gray-900 dark:text-neutral-100">{t('support.selectTicket')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

