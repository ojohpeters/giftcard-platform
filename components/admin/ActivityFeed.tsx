"use client";
import React from 'react';
import { 
  ShoppingBag, 
  UserPlus, 
  Package, 
  DollarSign, 
  Settings, 
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react';

interface Activity {
  id: number;
  type: 'order' | 'user' | 'product' | 'payment' | 'settings' | 'alert';
  action: string;
  user?: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface ActivityFeedProps {
  activities?: Activity[];
  limit?: number;
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'order':
      return <ShoppingBag size={18} className="text-blue-600" />;
    case 'user':
      return <UserPlus size={18} className="text-purple-600" />;
    case 'product':
      return <Package size={18} className="text-orange-600" />;
    case 'payment':
      return <DollarSign size={18} className="text-green-600" />;
    case 'settings':
      return <Settings size={18} className="text-gray-600" />;
    case 'alert':
      return <AlertCircle size={18} className="text-red-600" />;
    default:
      return <Clock size={18} className="text-gray-400" />;
  }
};

const getStatusColor = (status?: Activity['status']) => {
  switch (status) {
    case 'success':
      return 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200';
    case 'error':
      return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200';
    case 'info':
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200';
    default:
      return 'bg-gray-50 dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-neutral-700';
  }
};

export default function ActivityFeed({ activities = [], limit = 10 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, limit);

  if (displayActivities.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl p-8 shadow-lg">
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-neutral-500 font-bold uppercase text-sm">No Recent Activity</p>
          <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-2">Activity will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border-2 border-gray-200 dark:border-neutral-700 rounded-3xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center">
            <TrendingUp className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase text-gray-900 dark:text-neutral-100">Recent Activity</h3>
            <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-bold uppercase">Live Feed</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {displayActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-700 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-all group"
          >
            <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-xl flex items-center justify-center border-2 border-gray-200 dark:border-neutral-700 group-hover:border-blue-300 dark:group-hover:border-blue-800 transition-all shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-black text-gray-900 dark:text-neutral-100 leading-tight">{activity.action}</p>
                {activity.status && (
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${getStatusColor(activity.status)} shrink-0`}>
                    {activity.status}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-neutral-400 font-bold">
                {activity.user && (
                  <span className="flex items-center gap-1">
                    <UserPlus size={12} />
                    {activity.user}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length > limit && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-neutral-700 text-center">
          <button className="text-sm font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
}

