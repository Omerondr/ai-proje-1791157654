import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  variant?: 'green' | 'red' | 'blue' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className }) => {
  const styles = {
    green: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    red: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    blue: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    neutral: 'bg-slate-800 text-slate-400 border border-slate-700/50',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-mono tracking-wider',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};