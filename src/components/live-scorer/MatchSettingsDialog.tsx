import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';

const INPUT_CLASS =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#12233D] focus:border-[#12233D] focus:outline-none focus:ring-1 focus:ring-[#12233D]';

export type MatchSettingsPayload = {
  target: number;
  max_overs: number;
  bowling_limit: number;
  DLS: boolean;
};

type MatchSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: MatchSettingsPayload) => void;
};

export function MatchSettingsDialog({ open, onOpenChange, onSubmit }: MatchSettingsDialogProps) {
  const [target, setTarget] = useState(0);
  const [maxOvers, setMaxOvers] = useState(20);
  const [bowlingLimit, setBowlingLimit] = useState(4);
  const [dls, setDls] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-[#12233D]">DLS / Inning Settings</Dialog.Title>
          <div className="mt-4 flex flex-col gap-3">
            <label className="text-sm font-medium text-[#12233D]">
              New target
              <input
                aria-label="New target"
                type="number"
                min={0}
                className={INPUT_CLASS}
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value, 10) || 0)}
              />
              <span className="text-xs italic text-gray-500">New target will be 0 for the first inning.</span>
            </label>
            <label className="text-sm font-medium text-[#12233D]">
              New over limit
              <input
                aria-label="New over limit"
                type="number"
                min={1}
                max={50}
                className={INPUT_CLASS}
                value={maxOvers}
                onChange={(e) => setMaxOvers(parseInt(e.target.value, 10) || 0)}
              />
            </label>
            <label className="text-sm font-medium text-[#12233D]">
              New bowling limit
              <input
                aria-label="New bowling limit"
                type="number"
                min={1}
                max={10}
                className={INPUT_CLASS}
                value={bowlingLimit}
                onChange={(e) => setBowlingLimit(parseInt(e.target.value, 10) || 0)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-[#12233D]">
              <input aria-label="DLS" type="checkbox" checked={dls} onChange={(e) => setDls(e.target.checked)} />
              DLS
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </Dialog.Close>
            <Button
              type="button"
              disabled={!(maxOvers && bowlingLimit)}
              onClick={() => {
                onSubmit({ target, max_overs: maxOvers, bowling_limit: bowlingLimit, DLS: dls });
                onOpenChange(false);
              }}
            >
              Save settings
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
