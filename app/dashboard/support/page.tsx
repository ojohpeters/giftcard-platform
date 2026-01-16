"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Plus, Send, CheckCircle2, Clock, AlertCircle, X } from "lucide-react";
import { supportAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

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
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/support');
      return;
    }
    loadTickets();
  }, [isAuthenticated, router]);

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
    
    setCreating(true);
    try {
      const response = await supportAPI.create({
        subject: newSubject,
        priority: 'medium',
      });
      // Add initial message
      await supportAPI.addMessage(response.data.id, newMessage);
      await loadTickets();
      await loadTicket(response.data.id);
      setShowCreateForm(false);
      setNewSubject('');
      setNewMessage('');
    } catch (error) {
      console.error('Failed to create ticket:', error);
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
        return 'bg-green-50 text-green-600 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'closed':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-orange-50 text-orange-600 border-orange-200';
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

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            Support<span className="text-blue-600">.</span>
          </h1>
          <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2">
            Get help with your orders
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      {/* CREATE FORM */}
      {showCreateForm && (
        <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-black uppercase">Create Support Ticket</h2>
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Subject</label>
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="What can we help you with?"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Message</label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Describe your issue..."
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-600 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateTicket}
              disabled={creating || !newSubject.trim() || !newMessage.trim()}
              className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {creating ? 'Creating...' : 'Create Ticket'}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewSubject('');
                setNewMessage('');
              }}
              className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: TICKET LIST */}
        <div className="lg:col-span-1 space-y-3">
          {tickets.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-[32px] p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-400 font-bold">No support tickets yet</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => loadTicket(ticket.id)}
                className={`w-full text-left bg-white border rounded-[24px] p-4 transition-all ${
                  selectedTicket?.id === ticket.id
                    ? 'border-blue-600 shadow-lg'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-black uppercase truncate flex-1">{ticket.subject}</h3>
                  <span className={`text-[8px] font-black px-2 py-1 rounded-full border flex items-center gap-1 shrink-0 ml-2 ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status}
                  </span>
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </p>
                {ticket.messages && ticket.messages.length > 0 && (
                  <p className="text-[9px] text-gray-500 mt-1">
                    {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                  </p>
                )}
              </button>
            ))
          )}
        </div>

        {/* RIGHT: MESSAGE VIEW */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 md:p-8 space-y-6 flex flex-col h-[600px]">
              {/* HEADER */}
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-black uppercase mb-2">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-3">
                  <span className={`text-[8px] font-black px-2 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusIcon(selectedTicket.status)}
                    {selectedTicket.status}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">
                    Created {new Date(selectedTicket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl ${
                        msg.is_admin
                          ? 'bg-blue-50 border border-blue-100 ml-8'
                          : 'bg-gray-50 border border-gray-100 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] font-black uppercase text-gray-600">
                          {msg.is_admin ? 'Support Team' : 'You'}
                        </p>
                        <p className="text-[8px] text-gray-400">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">No messages yet</p>
                )}
              </div>

              {/* MESSAGE INPUT */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-600 resize-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageText.trim()}
                  className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-[32px] p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-400 font-bold">Select a ticket to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

