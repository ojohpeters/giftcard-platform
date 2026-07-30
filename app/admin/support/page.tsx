"use client";
import React, { useState, useEffect, useRef } from 'react';
import { supportAPI } from '@/lib/api';
import { MessageSquare, Send, Loader2, ArrowLeft, CheckCircle2, Clock, User, ShieldCheck } from "lucide-react";

interface Msg {
  id: number;
  sender_email: string;
  is_admin: boolean;
  message: string;
  created_at: string;
}
interface Ticket {
  id: number;
  subject: string;
  status: string;
  priority: string;
  user_email: string;
  user_name: string;
  messages: Msg[];
  created_at: string;
  updated_at: string;
}

const STATUS_TABS = ['open', 'in_progress', 'resolved', 'closed', ''];
const statusBadge: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
  in_progress: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300',
  resolved: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
};
const priorityBadge: Record<string, string> = {
  low: 'text-gray-500 dark:text-neutral-400', medium: 'text-blue-600', high: 'text-orange-600', urgent: 'text-red-600',
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await supportAPI.list();
      // Backend returns all tickets for staff (may be array or paginated)
      const data = res.data?.results || res.data || [];
      setTickets(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadTickets(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selected?.messages?.length]);

  const openTicket = async (t: Ticket) => {
    setSelected(t);
    try {
      const res = await supportAPI.get(t.id);
      setSelected(res.data);
      // refresh unread state in the list
      setTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...res.data } : x)));
    } catch { /* ignore */ }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await supportAPI.addMessage(selected.id, reply.trim());
      setReply('');
      const res = await supportAPI.get(selected.id);
      setSelected(res.data);
    } catch { /* ignore */ } finally { setSending(false); }
  };

  const setStatus = async (status: string) => {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await supportAPI.updateStatus(selected.id, status);
      setSelected(res.data);
      setTickets((prev) => prev.map((x) => (x.id === selected.id ? { ...x, status: res.data.status } : x)));
    } catch { /* ignore */ } finally { setBusy(false); }
  };

  const filtered = filter ? tickets.filter((t) => t.status === filter) : tickets;
  const unreadFromUser = (t: Ticket) => (t.messages || []).some((m) => !m.is_admin);

  const fmt = (s: string) => new Date(s).toLocaleString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <MessageSquare className="text-blue-600" size={34} /> Support
        </h1>
        <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mt-1">User tickets & replies</p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-4 md:gap-6">
        {/* LIST */}
        <div className={`${selected ? 'hidden lg:block' : ''} space-y-4`}>
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((f) => (
              <button key={f || 'all'} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-800'
                }`}>
                {f ? f.replace('_', ' ') : 'All'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-10 text-center text-gray-400 dark:text-neutral-500 font-bold text-sm">No {filter || ''} tickets.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((t) => (
                <button key={t.id} onClick={() => openTicket(t)}
                  className={`w-full text-left bg-white dark:bg-neutral-900 border rounded-2xl p-4 transition-all ${selected?.id === t.id ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-100 hover:border-gray-300 dark:border-neutral-800 dark:hover:border-neutral-600'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-black text-sm text-gray-900 dark:text-neutral-100 truncate">{t.subject}</p>
                    {unreadFromUser(t) && <span className="shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-1.5" title="Has user messages" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 truncate mt-0.5">{t.user_email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase ${statusBadge[t.status] || ''}`}>{t.status.replace('_', ' ')}</span>
                    <span className={`text-[8px] font-black uppercase ${priorityBadge[t.priority] || ''}`}>{t.priority}</span>
                    <span className="text-[8px] text-gray-400 dark:text-neutral-500 ml-auto">{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CONVERSATION */}
        <div className={`${selected ? '' : 'hidden lg:flex'} bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl flex flex-col min-h-[500px] lg:h-[calc(100vh-220px)]`}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-neutral-600 gap-3">
              <MessageSquare size={48} />
              <p className="font-bold text-sm text-gray-400 dark:text-neutral-500">Select a ticket to view the conversation</p>
            </div>
          ) : (
            <>
              {/* header */}
              <div className="p-4 md:p-5 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-start gap-3">
                  <button onClick={() => setSelected(null)} className="lg:hidden p-1 -ml-1 text-gray-400 dark:text-neutral-500"><ArrowLeft size={20} /></button>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 dark:text-neutral-100 truncate">{selected.subject}</p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
                      <User size={12} /> {selected.user_name || selected.user_email} · {selected.user_email}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[9px] font-black px-2 py-1 rounded-full border uppercase ${statusBadge[selected.status] || ''}`}>{selected.status.replace('_', ' ')}</span>
                </div>
                {/* status controls */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button disabled={busy} onClick={() => setStatus('in_progress')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-100 dark:hover:bg-yellow-900/40 disabled:opacity-50"><Clock size={12} /> In Progress</button>
                  <button disabled={busy} onClick={() => setStatus('resolved')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 text-[10px] font-black uppercase tracking-widest hover:bg-green-100 dark:hover:bg-green-900/40 disabled:opacity-50"><CheckCircle2 size={12} /> Resolve</button>
                  <button disabled={busy} onClick={() => setStatus('closed')} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-300 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50">Close</button>
                </div>
              </div>

              {/* messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3">
                {(selected.messages || []).map((m) => (
                  <div key={m.id} className={`flex ${m.is_admin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${m.is_admin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-neutral-100'}`}>
                      <div className={`flex items-center gap-1.5 mb-1 text-[9px] font-black uppercase tracking-widest ${m.is_admin ? 'text-blue-100' : 'text-gray-400 dark:text-neutral-500'}`}>
                        {m.is_admin ? <><ShieldCheck size={10} /> Support</> : <><User size={10} /> {m.sender_email}</>}
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{m.message}</p>
                      <p className={`text-[9px] mt-1 ${m.is_admin ? 'text-blue-200' : 'text-gray-400 dark:text-neutral-500'}`}>{fmt(m.created_at)}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* reply */}
              <div className="p-3 md:p-4 border-t border-gray-100 dark:border-neutral-800 flex items-end gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Type your reply… (Enter to send)"
                  rows={1}
                  className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-blue-600 text-sm max-h-32 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100"
                />
                <button onClick={sendReply} disabled={sending || !reply.trim()}
                  className="shrink-0 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all">
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
