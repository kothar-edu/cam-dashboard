import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type LivestreamOverlayFormValues = {
  sponsorText: string;
  topLeftFile: File | null;
  topRightFile: File | null;
  clearTopLeft: boolean;
  clearTopRight: boolean;
};

type LivestreamOverlayFieldsProps = {
  title?: string;
  description?: string;
  values: LivestreamOverlayFormValues;
  onChange: (values: LivestreamOverlayFormValues) => void;
  topLeftPreview?: string | null;
  topRightPreview?: string | null;
  disabled?: boolean;
};

export function LivestreamOverlayFields({
  title = 'Livestream overlay (OBS)',
  description = 'Sponsor text and corner logos shown on the OBS graphics overlay. Leave blank to hide each element.',
  values,
  onChange,
  topLeftPreview,
  topRightPreview,
  disabled = false,
}: LivestreamOverlayFieldsProps) {
  const [leftPreview, setLeftPreview] = useState<string | null>(topLeftPreview ?? null);
  const [rightPreview, setRightPreview] = useState<string | null>(topRightPreview ?? null);

  useEffect(() => {
    setLeftPreview(topLeftPreview ?? null);
  }, [topLeftPreview]);

  useEffect(() => {
    setRightPreview(topRightPreview ?? null);
  }, [topRightPreview]);

  useEffect(() => {
    if (!values.topLeftFile) {
      return;
    }
    const objectUrl = URL.createObjectURL(values.topLeftFile);
    setLeftPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [values.topLeftFile]);

  useEffect(() => {
    if (!values.topRightFile) {
      return;
    }
    const objectUrl = URL.createObjectURL(values.topRightFile);
    setRightPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [values.topRightFile]);

  const update = (patch: Partial<LivestreamOverlayFormValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <section className="space-y-4 rounded-lg border border-dashed border-[#E8A93B]/60 bg-[#12233D]/[0.03] p-4">
      <div>
        <h2 className="text-sm font-semibold text-[#12233D]">{title}</h2>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      <Input
        label="Sponsor text"
        value={values.sponsorText}
        onChange={(event) => update({ sponsorText: event.target.value })}
        placeholder="e.g. MarkQ HOMES"
        disabled={disabled}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <OverlayImageField
          label="Top-left logo"
          preview={leftPreview}
          disabled={disabled}
          onSelect={(file) => update({ topLeftFile: file, clearTopLeft: false })}
          onClear={() => update({ topLeftFile: null, clearTopLeft: true })}
        />
        <OverlayImageField
          label="Top-right logo"
          preview={rightPreview}
          disabled={disabled}
          onSelect={(file) => update({ topRightFile: file, clearTopRight: false })}
          onClear={() => update({ topRightFile: null, clearTopRight: true })}
        />
      </div>
    </section>
  );
}

function OverlayImageField({
  label,
  preview,
  disabled,
  onSelect,
  onClear,
}: {
  label: string;
  preview: string | null;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[#12233D]">{label}</p>
      {preview ? (
        <div className="flex items-center gap-3 rounded-md border bg-white p-3">
          <img src={preview} alt="" className="h-16 w-auto max-w-[140px] object-contain" />
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onClear}>
            Remove
          </Button>
        </div>
      ) : (
        <p className="text-xs text-gray-500">No image set — hidden on overlay.</p>
      )}
      <input
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onSelect(file);
          }
        }}
        className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-[#12233D] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#1a3154]"
      />
    </div>
  );
}

export function appendLivestreamOverlayFormData(
  form: FormData,
  values: LivestreamOverlayFormValues,
  options?: { includeCustomFlag?: boolean; overlayCustom?: boolean }
) {
  form.append('livestream_sponsor_text', values.sponsorText.trim());
  if (options?.includeCustomFlag) {
    form.append('livestream_overlay_custom', String(options.overlayCustom ?? false));
  }
  if (values.topLeftFile) {
    form.append('livestream_top_left_image', values.topLeftFile);
  }
  if (values.topRightFile) {
    form.append('livestream_top_right_image', values.topRightFile);
  }
  if (values.clearTopLeft) {
    form.append('clear_top_left', 'true');
  }
  if (values.clearTopRight) {
    form.append('clear_top_right', 'true');
  }
}
