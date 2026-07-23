type FileFieldProps = {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
  currentUrl?: string | null;
};

export function FileField({ label, accept = 'image/*', onChange, currentUrl }: FileFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#12233D]">{label}</label>
      {currentUrl ? (
        <div className="flex items-center gap-3">
          <img src={currentUrl} alt="" className="h-12 w-12 rounded border object-contain" />
          <span className="text-xs text-muted-foreground">Current image</span>
        </div>
      ) : null}
      <input
        type="file"
        accept={accept}
        className="block w-full text-sm text-muted-foreground"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
