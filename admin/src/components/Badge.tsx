import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toLowerCase();

  let styles = 'bg-neutral-100 text-neutral-700 border-neutral-200';

  if (normalized === 'published' || normalized === 'active' || normalized === 'approved') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'draft' || normalized === 'pending') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized === 'scheduled') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (normalized === 'archived' || normalized === 'rejected' || normalized === 'inactive') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          normalized === 'published' || normalized === 'active' || normalized === 'approved'
            ? 'bg-emerald-500'
            : normalized === 'draft' || normalized === 'pending'
            ? 'bg-amber-500'
            : normalized === 'scheduled'
            ? 'bg-blue-500'
            : 'bg-rose-500'
        }`}
      />
      {status.replace('_', ' ')}
    </span>
  );
};
