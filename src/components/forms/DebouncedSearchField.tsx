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
    <div
      className={cn(
        'flex h-10 max-w-xl items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm focus-within:border-[#E8A93B] focus-within:ring-1 focus-within:ring-[#E8A93B]',
        className
      )}
    >
      <Search
        data-testid="search-field-icon"
        className="h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-full w-full min-w-0 border-0 bg-transparent p-0 text-sm text-[#12233D] outline-none ring-0 focus:ring-0 placeholder:text-muted-foreground"
      />
    </div>
  );
}
