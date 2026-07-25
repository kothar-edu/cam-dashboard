import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from './button';

type ForfeitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onConfirm: () => void;
  teamAName: string;
  teamBName: string;
  teamAId: string;
  teamBId: string;
  forfeitedOpponentId: string;
  setForfeitedOpponentId: (id: string) => void;
  pointsToAward: number;
  setPointsToAward: (points: number) => void;
};

export function ForfeitDialog({
  open,
  onOpenChange,
  isLoading = false,
  onConfirm,
  teamAName,
  teamBName,
  teamAId,
  teamBId,
  forfeitedOpponentId,
  setForfeitedOpponentId,
  pointsToAward,
  setPointsToAward,
}: ForfeitDialogProps) {
  const canConfirm = forfeitedOpponentId !== '';

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[min(90dvh,40rem)] w-[calc(100vw-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-4 shadow-xl sm:p-6">
          <AlertDialog.Title className="text-lg font-semibold text-[#12233D]">
            Forfeit / Withdraw Match
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            Mark this match as forfeited by one team. The other team will be awarded the win and
            points.
          </AlertDialog.Description>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#12233D]">
                Which team forfeited? <span className="text-red-600">*</span>
              </label>
              <select
                value={forfeitedOpponentId}
                onChange={(e) => setForfeitedOpponentId(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#12233D] focus:border-[#12233D] focus:outline-none focus:ring-1 focus:ring-[#12233D]"
                disabled={isLoading}
              >
                <option value="">Select team that forfeited</option>
                <option value={teamAId}>{teamAName}</option>
                <option value={teamBId}>{teamBName}</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                The forfeiting team will lose, and the opponent will be awarded points
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#12233D]">
                Points to award to winner
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={pointsToAward}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    setPointsToAward(val);
                  }
                }}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#12233D] focus:border-[#12233D] focus:outline-none focus:ring-1 focus:ring-[#12233D]"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Default: 2 points (standard for group stage wins)
              </p>
            </div>

            {forfeitedOpponentId && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <strong>Confirmation:</strong>{' '}
                {forfeitedOpponentId === teamAId ? teamAName : teamBName} will forfeit, and{' '}
                {forfeitedOpponentId === teamAId ? teamBName : teamAName} will win with{' '}
                {pointsToAward} points
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="outline" disabled={isLoading} className="w-full sm:w-auto">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button
              variant="danger"
              isLoading={isLoading}
              onClick={onConfirm}
              disabled={!canConfirm}
              className="w-full sm:w-auto"
            >
              Forfeit match
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
