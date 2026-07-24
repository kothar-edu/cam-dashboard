import type { ReactNode } from 'react';

type SectionCardProps = {
  title: string;
  action?: ReactNode;
  tone?: 'default' | 'danger';
  children: ReactNode;
};

export function SectionCard({ title, action, tone = 'default', children }: SectionCardProps) {
  return (
    <div className={`rounded-xl border bg-white p-3 shadow-sm ${tone === 'danger' ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-1.5">
        <h3
          className={`text-xs font-bold uppercase tracking-wide ${tone === 'danger' ? 'text-red-600' : 'text-gray-500'}`}
        >
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}
