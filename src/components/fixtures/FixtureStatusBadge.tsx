import { cn } from '@/lib/utils';

export function FixtureStatusBadge({ status }: { status: string }) {
  if (status === 'Live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
        </span>
        Live
      </span>
    );
  }

  const tone: Record<string, string> = {
    Upcoming: 'bg-sky-50 text-sky-700',
    Ended: 'bg-slate-100 text-slate-600',
    Cancelled: 'bg-slate-100 text-slate-500 line-through',
  };

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
        tone[status] ?? 'bg-slate-100 text-slate-600'
      )}
    >
      {status}
    </span>
  );
}
