"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Filter, Calendar, User, Activity } from "lucide-react";
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface ActionLog {
  id: number;
  admin_email: string;
  action_type: string;
  description: string;
  metadata?: any;
  created_at: string;
}

export default function AdminLogsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user?.is_staff) {
      router.push('/dashboard');
      return;
    }
    loadLogs();
  }, [user, router, page]);

  const loadLogs = async () => {
    try {
      const response = await adminAPI.getActionLogs({
        page,
        action_type: actionFilter !== 'all' ? actionFilter : undefined,
      });
      setLogs(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'rate_update':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'code_upload':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'product_update':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const filteredLogs = logs.filter(log =>
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest">Loading Logs...</p>
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
            Action Logs<span className="text-blue-600">.</span>
          </h1>
          <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2">
            Audit Trail & Activity History
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search logs..."
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
              loadLogs();
            }}
            className="bg-white border border-gray-200 rounded-2xl py-4 px-4 outline-none focus:border-blue-600 text-sm font-bold uppercase text-xs"
          >
            <option value="all">All Actions</option>
            <option value="rate_update">Rate Updates</option>
            <option value="code_upload">Code Uploads</option>
            <option value="product_update">Product Updates</option>
          </select>
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Admin</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Action</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Description</th>
                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold uppercase">No logs found</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm font-bold">{log.admin_email}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${getActionTypeColor(log.action_type)}`}>
                        {log.action_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-gray-900">{log.description}</p>
                      {log.metadata && (
                        <p className="text-[9px] text-gray-400 mt-1 font-mono">
                          {JSON.stringify(log.metadata)}
                        </p>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-[9px] text-gray-400">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
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

