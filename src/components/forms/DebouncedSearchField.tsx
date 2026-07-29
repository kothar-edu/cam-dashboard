import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
};

export function DebouncedSearchField({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  'aria-label': ariaLabel = 'Search',
}: Props) {
  return (
    <div className={cn('relative max-w-xl', className)}>
      <Search
        data-testid="search-field-icon"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-[#12233D] shadow-sm outline-none focus:border-[#E8A93B] focus:ring-1 focus:ring-[#E8A93B]"
      />
    </div>
  );
}
