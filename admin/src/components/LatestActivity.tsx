import React from 'react';
import { Clock, CheckCircle2, FileText, PlusCircle, MessageSquare, Tag } from 'lucide-react';
import { AuditLog } from '../types/index.js';

interface LatestActivityProps {
  activities: AuditLog[];
}

export const LatestActivity: React.FC<LatestActivityProps> = ({ activities }) => {
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('publish')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (action.includes('comment')) {
      return <MessageSquare className="w-4 h-4 text-blue-600" />;
    }
    if (action.includes('category')) {
      return <Tag className="w-4 h-4 text-amber-600" />;
    }
    if (action.includes('create')) {
      return <PlusCircle className="w-4 h-4 text-neutral-800" />;
    }
    return <FileText className="w-4 h-4 text-neutral-500" />;
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Latest Activity</h3>
          <p className="text-xs text-neutral-500">Real-time audit log of team updates</p>
        </div>
        <Clock className="w-4 h-4 text-neutral-400" />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto max-h-[360px] pr-1">
        {activities.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-neutral-400 py-6">
            No activity logged yet
          </div>
        ) : (
          activities.map((act) => (
            <div key={act._id} className="flex items-start space-x-3 text-xs">
              <div className="p-1.5 rounded-lg bg-neutral-100 flex-shrink-0 mt-0.5">
                {getActivityIcon(act.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-neutral-800 font-medium leading-snug">
                  <span className="font-semibold text-neutral-900">
                    {act.user?.name || (act as any).actorName || 'Admin'}
                  </span>{' '}
                  <span className="text-neutral-600">
                    {act.action.replace('.', ' ')}
                  </span>
                </p>
                {act.details?.title && (
                  <p className="text-neutral-500 truncate mt-0.5 font-mono text-[11px]">
                    "{act.details.title}"
                  </p>
                )}
                <span className="text-[10px] text-neutral-400 font-mono">
                  {formatTime(act.createdAt || (act as any).timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
