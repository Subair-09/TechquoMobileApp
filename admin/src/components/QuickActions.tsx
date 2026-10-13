import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, UploadCloud, FolderPlus, MessageSquare } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      label: 'New Article',
      description: 'Draft & publish stories',
      to: '/articles/new',
      icon: PlusCircle,
      bg: 'hover:bg-neutral-50',
    },
    {
      label: 'Upload Media',
      description: 'Add photos & assets',
      to: '/media',
      icon: UploadCloud,
      bg: 'hover:bg-neutral-50',
    },
    {
      label: 'Categories',
      description: 'Manage tech verticals',
      to: '/categories',
      icon: FolderPlus,
      bg: 'hover:bg-neutral-50',
    },
    {
      label: 'Moderate Comments',
      description: 'Review audience feedback',
      to: '/comments',
      icon: MessageSquare,
      bg: 'hover:bg-neutral-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-neutral-900">Quick Actions</h3>
        <p className="text-xs text-neutral-500">Shortcuts to common editorial workflows</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.label}
              to={act.to}
              className={`p-3 rounded-lg border border-neutral-200/70 ${act.bg} transition-all flex flex-col justify-between group`}
            >
              <div className="w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-800 group-hover:bg-neutral-900 group-hover:text-white transition-colors mb-2">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-900 group-hover:text-neutral-950">
                  {act.label}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {act.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
