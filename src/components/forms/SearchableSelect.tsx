import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type SelectOption = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  label?: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
};

const SEARCH_THRESHOLD = 5;

export function SearchableSelect({
  label,
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  searchable,
  disabled = false,
  required = false,
  className,
  triggerClassName,
}: SearchableSelectProps) {
  const enableSearch = searchable ?? options.length > SEARCH_THRESHOLD;

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-[#12233D]">
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </label>
      ) : null}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          aria-required={required}
          className={cn(error ? 'border-red-500 focus:ring-red-500' : undefined, triggerClassName)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent searchable={enableSearch}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export const FormSelect = SearchableSelect;
