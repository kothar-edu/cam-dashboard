import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SelectOption = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
};

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  searchable = true,
  disabled = false,
}: SearchableSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#12233D]">{label}</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={error ? 'border-red-500 focus:ring-red-500' : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent searchable={searchable}>
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
