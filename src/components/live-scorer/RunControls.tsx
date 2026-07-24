import { Button } from '@/components/ui/button';
import type { BatScore } from '@/types/liveMatch';

const RUN_VALUES: BatScore[] = [0, 1, 2, 3, 4, 5, 6];
const RUN_LABEL: Record<BatScore, string> = { 0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6' };

type RunControlsProps = {
  broadcastScore: (value: BatScore) => void;
  disabled: boolean;
};

export function RunControls({ broadcastScore, disabled }: RunControlsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {RUN_VALUES.map((value) => (
        <Button
          key={value}
          type="button"
          variant={value === 4 || value === 6 ? 'success' : 'primary'}
          disabled={disabled}
          onClick={() => broadcastScore(value)}
        >
          {RUN_LABEL[value]}
        </Button>
      ))}
    </div>
  );
}
