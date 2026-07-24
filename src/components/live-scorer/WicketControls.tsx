import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { CurrentPlayersState, LiveOpponent, WicketType } from '@/types/liveMatch';

const SELECT_CLASS =
  'mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs text-[#12233D] focus:border-[#12233D] focus:outline-none focus:ring-1 focus:ring-[#12233D]';

const POPOVER_CLASS =
  'absolute left-0 z-20 mt-1 w-[min(16rem,calc(100vw-2rem))] rounded-md border border-gray-300 bg-white p-2.5 shadow-lg';

const SIMPLE_DISMISSALS: Array<{ value: WicketType; label: string }> = [
  { value: 'BOWLED', label: 'Bowled' },
  { value: 'LBW', label: 'LBW' },
  { value: 'CAUGHT', label: 'Caught' },
  { value: 'STUMPED', label: 'Stumped' },
  { value: 'HANDLED', label: 'Handled' },
];

type WicketControlsProps = {
  broadcastWicket: (value: WicketType, dismissed?: string, successfulRuns?: number, fielder?: string | null, extras?: number) => void;
  currentPlayers: CurrentPlayersState;
  fieldingOpponent: LiveOpponent | null | undefined;
  disabled: boolean;
};

export function WicketControls({ broadcastWicket, currentPlayers, fieldingOpponent, disabled }: WicketControlsProps) {
  return (
    <div>
      <p className="mb-2 text-xs text-gray-500">Striker, fielder = bowler or keeper</p>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        {SIMPLE_DISMISSALS.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant="danger"
            disabled={disabled || !currentPlayers.striker}
            onClick={() => {
              const credited = currentPlayers.wicket_keeper?.id ?? currentPlayers.bowler?.id ?? null;
              broadcastWicket(value, currentPlayers.striker?.id, 0, credited ?? null);
            }}
          >
            {label}
          </Button>
        ))}
        <RunOutForm broadcastWicket={broadcastWicket} currentPlayers={currentPlayers} fieldingOpponent={fieldingOpponent} disabled={disabled} label="Run Out" wicketValue="RUN_OUT" />
        <HitWicketForm broadcastWicket={broadcastWicket} currentPlayers={currentPlayers} disabled={disabled} />
        <RetiredForm broadcastWicket={broadcastWicket} currentPlayers={currentPlayers} disabled={disabled} label="Retired Hurt" wicketValue="RETIRED_HURT" />
        <RetiredForm broadcastWicket={broadcastWicket} currentPlayers={currentPlayers} disabled={disabled} label="Retired Out" wicketValue="RETIRED_OUT" />
        <RunOutForm broadcastWicket={broadcastWicket} currentPlayers={currentPlayers} fieldingOpponent={fieldingOpponent} disabled={disabled} label="Wide + Run Out" wicketValue="WIDE_RUN_OUT" />
        <RunOutForm broadcastWicket={broadcastWicket} currentPlayers={currentPlayers} fieldingOpponent={fieldingOpponent} disabled={disabled} label="No Ball + Run Out" wicketValue="NO_BALL_RUN_OUT" />
        <WideStumpedForm broadcastWicket={broadcastWicket} currentPlayers={currentPlayers} fieldingOpponent={fieldingOpponent} disabled={disabled} />
      </div>
    </div>
  );
}

function playerOptions(currentPlayers: CurrentPlayersState) {
  return [currentPlayers.striker, currentPlayers.non_striker].filter((p): p is NonNullable<typeof p> => Boolean(p));
}

function RunOutForm({
  broadcastWicket, currentPlayers, fieldingOpponent, disabled, label, wicketValue,
}: {
  broadcastWicket: WicketControlsProps['broadcastWicket'];
  currentPlayers: CurrentPlayersState;
  fieldingOpponent: LiveOpponent | null | undefined;
  disabled: boolean;
  label: string;
  wicketValue: WicketType;
}) {
  const [open, setOpen] = useState(false);
  const [player, setPlayer] = useState('');
  const [runs, setRuns] = useState(0);
  const [fielder, setFielder] = useState('');

  return (
    <div className="relative">
      <Button type="button" size="sm" variant="danger" className="w-full" disabled={disabled} onClick={() => setOpen(!open)}>
        {label}
      </Button>
      {open && (
        <div className={POPOVER_CLASS}>
          <label className="text-xs font-medium text-[#12233D]">
            Dismissed player
            <select aria-label="Dismissed player" className={SELECT_CLASS} value={player} onChange={(e) => setPlayer(e.target.value)}>
              <option value="">Select player</option>
              {playerOptions(currentPlayers).map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </label>
          <label className="mt-2 block text-xs font-medium text-[#12233D]">
            Runs completed
            <select aria-label="Runs completed" className={SELECT_CLASS} value={runs} onChange={(e) => setRuns(Number(e.target.value))}>
              {[0, 1, 2, 3].map((r) => (
                <option key={r} value={r}>{r} runs</option>
              ))}
            </select>
          </label>
          <label className="mt-2 block text-xs font-medium text-[#12233D]">
            Fielder
            <select aria-label="Fielder" className={SELECT_CLASS} value={fielder} onChange={(e) => setFielder(e.target.value)}>
              <option value="">Select fielder</option>
              {(fieldingOpponent?.players ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            className="mt-2 w-full"
            disabled={!player || !fielder}
            onClick={() => {
              broadcastWicket(wicketValue, player, runs, fielder);
              setOpen(false);
              setPlayer('');
              setRuns(0);
              setFielder('');
            }}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}

function HitWicketForm({
  broadcastWicket, currentPlayers, disabled,
}: {
  broadcastWicket: WicketControlsProps['broadcastWicket'];
  currentPlayers: CurrentPlayersState;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [runs, setRuns] = useState(0);

  return (
    <div className="relative">
      <Button type="button" size="sm" variant="danger" className="w-full" disabled={disabled} onClick={() => setOpen(!open)}>
        Hit Wicket
      </Button>
      {open && (
        <div className={POPOVER_CLASS}>
          <label className="text-xs font-medium text-[#12233D]">
            Runs before hit wicket
            <select aria-label="Runs before hit wicket" className={SELECT_CLASS} value={runs} onChange={(e) => setRuns(Number(e.target.value))}>
              {[0, 1, 2, 3].map((r) => (
                <option key={r} value={r}>{r} runs</option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            className="mt-2 w-full"
            disabled={!currentPlayers.striker}
            onClick={() => {
              if (!currentPlayers.striker) return;
              broadcastWicket('HIT_WICKET', currentPlayers.striker.id, runs);
              setOpen(false);
              setRuns(0);
            }}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}

function RetiredForm({
  broadcastWicket, currentPlayers, disabled, label, wicketValue,
}: {
  broadcastWicket: WicketControlsProps['broadcastWicket'];
  currentPlayers: CurrentPlayersState;
  disabled: boolean;
  label: string;
  wicketValue: WicketType;
}) {
  const [open, setOpen] = useState(false);
  const [player, setPlayer] = useState('');

  return (
    <div className="relative">
      <Button type="button" size="sm" variant="secondary" className="w-full" disabled={disabled} onClick={() => setOpen(!open)}>
        {label}
      </Button>
      {open && (
        <div className={POPOVER_CLASS}>
          <label className="text-xs font-medium text-[#12233D]">
            Player
            <select aria-label={`${label} player`} className={SELECT_CLASS} value={player} onChange={(e) => setPlayer(e.target.value)}>
              <option value="">Select player</option>
              {playerOptions(currentPlayers).map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            className="mt-2 w-full"
            disabled={!player}
            onClick={() => {
              broadcastWicket(wicketValue, player, 0);
              setOpen(false);
              setPlayer('');
            }}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}

function WideStumpedForm({
  broadcastWicket, currentPlayers, fieldingOpponent, disabled,
}: {
  broadcastWicket: WicketControlsProps['broadcastWicket'];
  currentPlayers: CurrentPlayersState;
  fieldingOpponent: LiveOpponent | null | undefined;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [fielder, setFielder] = useState('');

  return (
    <div className="relative">
      <Button type="button" size="sm" variant="danger" className="w-full" disabled={disabled} onClick={() => setOpen(!open)}>
        Wide + Stumped
      </Button>
      {open && (
        <div className={POPOVER_CLASS}>
          <p className="mb-1.5 text-[11px] text-gray-500">Striker only, no bye runs, not a legal ball.</p>
          <label className="text-xs font-medium text-[#12233D]">
            Wicket-keeper (stumping)
            <select aria-label="Wicket-keeper" className={SELECT_CLASS} value={fielder} onChange={(e) => setFielder(e.target.value)}>
              <option value="">Select wicket-keeper</option>
              {(fieldingOpponent?.players ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            className="mt-2 w-full"
            disabled={!fielder || !currentPlayers.striker}
            onClick={() => {
              if (!currentPlayers.striker) return;
              broadcastWicket('WIDE_STUMPED', currentPlayers.striker.id, 0, fielder);
              setOpen(false);
              setFielder('');
            }}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}
