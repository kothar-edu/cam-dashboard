import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SectionCard } from './SectionCard';
import type { OpponentSummary } from '@/types/liveMatch';

const SELECT_CLASS =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#12233D] focus:border-[#12233D] focus:outline-none focus:ring-1 focus:ring-[#12233D]';

type EventButton = { value: string; label: string; variant: 'primary' | 'danger' | 'secondary' };

const IN_PLAY_EVENTS: EventButton[] = [
  { value: 'SWAP_STRIKERS', label: 'Swap Strikers', variant: 'primary' },
  { value: 'INNING_END', label: 'Confirm Inning End', variant: 'primary' },
  { value: 'UNDO', label: 'Undo Last Event', variant: 'secondary' },
  { value: 'RESET', label: 'Reset', variant: 'secondary' },
];

const MATCH_ENDING_EVENTS: EventButton[] = [
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

export function TossAndMatchControls({
  broadcastGameEvent,
  teamA,
  teamB,
  disabled,
  onOpenSettings,
}: TossAndMatchControlsProps) {
  const [tossOpen, setTossOpen] = useState(false);
  const [tossTeam, setTossTeam] = useState('');
  const [tossRole, setTossRole] = useState('');

  return (
    <SectionCard title="Match Control">
      <div className="flex flex-col gap-3">
        <PhaseGroup label="Pre-Match">
          <div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={disabled}
              onClick={() => setTossOpen(!tossOpen)}
            >
              Toss
            </Button>
            {tossOpen && (
              <div className="mt-2 flex flex-col gap-2 rounded-md border border-gray-300 p-3">
                <label className="text-xs font-medium text-[#12233D]">
                  Toss winner
                  <select
                    aria-label="Toss winner"
                    className={SELECT_CLASS}
                    value={tossTeam}
                    onChange={(e) => setTossTeam(e.target.value)}
                  >
                    <option value="">Select toss winner</option>
                    {teamA && <option value={teamA.id}>{teamA.name}</option>}
                    {teamB && <option value={teamB.id}>{teamB.name}</option>}
                  </select>
                </label>
                <label className="text-xs font-medium text-[#12233D]">
                  Elected to
                  <select
                    aria-label="Elected to"
                    className={SELECT_CLASS}
                    value={tossRole}
                    onChange={(e) => setTossRole(e.target.value)}
                  >
                    <option value="">Choose</option>
                    <option value="batting">Batting</option>
                    <option value="bowling">Bowling</option>
                  </select>
                </label>
                <Button
                  type="button"
                  size="sm"
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
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={() => broadcastGameEvent('MATCH_START', {})}
          >
            Start Match
          </Button>
        </PhaseGroup>

        <PhaseGroup label="In Play">
          {IN_PLAY_EVENTS.map(({ value, label, variant }) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={variant}
              disabled={disabled}
              onClick={() => broadcastGameEvent(value, {})}
            >
              {label}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={onOpenSettings}
          >
            DLS / Inning Settings
          </Button>
        </PhaseGroup>

        <PhaseGroup label="Match Ending" tone="danger">
          {MATCH_ENDING_EVENTS.map(({ value, label, variant }) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={variant}
              disabled={disabled}
              onClick={() => broadcastGameEvent(value, {})}
            >
              {label}
            </Button>
          ))}
        </PhaseGroup>
      </div>
    </SectionCard>
  );
}

function PhaseGroup({
  label,
  tone = 'default',
  children,
}: {
  label: string;
  tone?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className={`mb-1.5 text-[10px] font-bold uppercase tracking-wide ${tone === 'danger' ? 'text-red-500' : 'text-gray-400'}`}
      >
        {label}
      </p>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">{children}</div>
    </div>
  );
}
