import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { OpponentSummary } from '@/types/liveMatch';

const SELECT_CLASS =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#12233D] focus:border-[#12233D] focus:outline-none focus:ring-1 focus:ring-[#12233D]';

const ONE_TAP_EVENTS: Array<{ value: string; label: string; variant: 'primary' | 'danger' | 'secondary' }> = [
  { value: 'UNDO', label: 'Undo Last Event', variant: 'secondary' },
  { value: 'RESET', label: 'Reset', variant: 'secondary' },
  { value: 'MATCH_START', label: 'Start Match', variant: 'primary' },
  { value: 'SWAP_STRIKERS', label: 'Swap Strikers', variant: 'primary' },
  { value: 'INNING_END', label: 'Confirm Inning End', variant: 'primary' },
  { value: 'SUPER_OVER', label: 'Super Over', variant: 'danger' },
  { value: 'END_OF_MATCH', label: 'End Match', variant: 'danger' },
];

type TossAndMatchControlsProps = {
  broadcastGameEvent: (value: string, data?: Record<string, unknown>) => void;
  teamA: OpponentSummary | null | undefined;
  teamB: OpponentSummary | null | undefined;
  disabled: boolean;
  onOpenSettings: () => void;
};

export function TossAndMatchControls({ broadcastGameEvent, teamA, teamB, disabled, onOpenSettings }: TossAndMatchControlsProps) {
  const [tossOpen, setTossOpen] = useState(false);
  const [tossTeam, setTossTeam] = useState('');
  const [tossRole, setTossRole] = useState('');

  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <Button type="button" disabled={disabled} onClick={() => setTossOpen(!tossOpen)}>
          Toss
        </Button>
        {tossOpen && (
          <div className="mt-2 flex flex-col gap-2 rounded-md border border-gray-300 p-3">
            <label className="text-xs font-medium text-[#12233D]">
              Toss winner
              <select aria-label="Toss winner" className={SELECT_CLASS} value={tossTeam} onChange={(e) => setTossTeam(e.target.value)}>
                <option value="">Select toss winner</option>
                {teamA && <option value={teamA.id}>{teamA.name}</option>}
                {teamB && <option value={teamB.id}>{teamB.name}</option>}
              </select>
            </label>
            <label className="text-xs font-medium text-[#12233D]">
              Elected to
              <select aria-label="Elected to" className={SELECT_CLASS} value={tossRole} onChange={(e) => setTossRole(e.target.value)}>
                <option value="">Choose</option>
                <option value="batting">Batting</option>
                <option value="bowling">Bowling</option>
              </select>
            </label>
            <Button
              type="button"
              disabled={!tossTeam || !tossRole}
              onClick={() => {
                broadcastGameEvent('TOSS', { team: tossTeam, role: tossRole });
                setTossOpen(false);
                setTossTeam('');
                setTossRole('');
              }}
            >
              Submit toss
            </Button>
          </div>
        )}
      </div>

      {ONE_TAP_EVENTS.map(({ value, label, variant }) => (
        <Button key={value} type="button" variant={variant} disabled={disabled} onClick={() => broadcastGameEvent(value, {})}>
          {label}
        </Button>
      ))}

      <Button type="button" variant="secondary" disabled={disabled} onClick={onOpenSettings}>
        DLS / Inning Settings
      </Button>
    </div>
  );
}
