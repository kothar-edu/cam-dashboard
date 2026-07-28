import { useMemo, useState } from 'react';
import type { ScoreBall, ScorecardResultDump, ScoreInning } from '@/api/scorecards';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type BallSelection = {
  innings_index: number;
  over_index: number;
  ball_index: number;
};

type PlayerOption = { id: string; full_name: string };

type BallByBallEditorProps = {
  result: ScorecardResultDump;
  players: PlayerOption[];
  onBallChange: (selection: BallSelection, patch: Partial<ScoreBall>) => void;
};

const VALUE_OPTIONS: Array<string | number> = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  'WIDE_BALL',
  'NO_BALL',
  'BYE',
  'LEG_BYE',
  'PENALTY',
  'BOWLED',
  'LBW',
  'CAUGHT',
  'STUMPED',
  'RUN_OUT',
  'HIT_WICKET',
  'HANDLED',
  'RETIRED_HURT',
  'RETIRED_OUT',
  'WIDE_RUN_OUT',
  'WIDE_STUMPED',
  'NO_BALL_RUN_OUT',
];

function ballChipLabel(ball: ScoreBall): string {
  const value = ball.value;
  if (value === 0) return '•';
  if (typeof value === 'number') return String(value);
  if (value === 'WIDE_BALL') return 'Wd';
  if (value === 'NO_BALL') return 'Nb';
  if (value === 'BYE') return 'B';
  if (value === 'LEG_BYE') return 'Lb';
  if (typeof value === 'string') return value.slice(0, 2);
  return '?';
}

function PlayerSelect({
  label,
  value,
  players,
  onChange,
}: {
  label: string;
  value?: string | null;
  players: PlayerOption[];
  onChange: (value: string | null) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <select
        className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">—</option>
        {players.map((player) => (
          <option key={player.id} value={player.id}>
            {player.full_name}
          </option>
        ))}
      </select>
    </label>
  );
}

function InningLabel({ inning, index }: { inning: ScoreInning; index: number }) {
  return (
    <span>
      Innings {index + 1}
      {inning.runs != null ? ` · ${inning.runs}/${inning.wickets ?? 0}` : ''}
    </span>
  );
}

export function BallByBallEditor({ result, players, onBallChange }: BallByBallEditorProps) {
  const [inningsIndex, setInningsIndex] = useState(0);
  const [selection, setSelection] = useState<BallSelection | null>(null);

  const innings = result.innings || [];
  const current = innings[inningsIndex];
  const selectedBall = useMemo(() => {
    if (!selection) return null;
    return (
      innings[selection.innings_index]?.overs?.[selection.over_index]?.scores?.[
        selection.ball_index
      ] ?? null
    );
  }, [innings, selection]);

  if (!innings.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-muted-foreground">
        No ball-by-ball history is available for this match. Edit batting and bowling aggregates
        instead.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {innings.map((inning, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setInningsIndex(index);
                setSelection(null);
              }}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition',
                inningsIndex === index
                  ? 'bg-[#12233D] text-white'
                  : 'bg-slate-100 text-[#12233D] hover:bg-slate-200'
              )}
            >
              <InningLabel inning={inning} index={index} />
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {(current?.overs || []).map((over, overIndex) => (
            <div key={overIndex} className="rounded-xl border bg-white p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Over {overIndex + 1}</span>
                <span>
                  {over.total_runs ?? 0} runs · {over.wickets ?? 0} wkts
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(over.scores || []).map((ball, ballIndex) => {
                  const active =
                    selection?.innings_index === inningsIndex &&
                    selection.over_index === overIndex &&
                    selection.ball_index === ballIndex;
                  return (
                    <button
                      key={ballIndex}
                      type="button"
                      onClick={() =>
                        setSelection({
                          innings_index: inningsIndex,
                          over_index: overIndex,
                          ball_index: ballIndex,
                        })
                      }
                      className={cn(
                        'flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-sm font-semibold transition',
                        active
                          ? 'border-[#E8A93B] bg-[#E8A93B]/20 text-[#12233D]'
                          : 'border-slate-200 bg-slate-50 text-[#12233D] hover:border-[#12233D]/40'
                      )}
                      title={ball.commentary || String(ball.value)}
                    >
                      {ballChipLabel(ball)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-xl border bg-white p-4 shadow-sm">
        {!selection || !selectedBall ? (
          <p className="text-sm text-muted-foreground">Select a ball to edit its details.</p>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Editing ball
              </p>
              <p className="text-sm font-semibold text-[#12233D]">
                Innings {selection.innings_index + 1} · Over {selection.over_index + 1} · Ball{' '}
                {selection.ball_index + 1}
              </p>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Event</span>
              <select
                className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                value={String(selectedBall.value ?? '')}
                onChange={(e) => {
                  const raw = e.target.value;
                  const value = /^\d+$/.test(raw) ? Number(raw) : raw;
                  onBallChange(selection, { value });
                }}
              >
                {VALUE_OPTIONS.map((option) => (
                  <option key={String(option)} value={String(option)}>
                    {String(option)}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">Runs</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                  value={selectedBall.runs ?? 0}
                  onChange={(e) => onBallChange(selection, { runs: Number(e.target.value) || 0 })}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">Extras</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                  value={selectedBall.extras ?? 0}
                  onChange={(e) => onBallChange(selection, { extras: Number(e.target.value) || 0 })}
                />
              </label>
            </div>

            <PlayerSelect
              label="Striker"
              value={selectedBall.striker}
              players={players}
              onChange={(striker) => onBallChange(selection, { striker })}
            />
            <PlayerSelect
              label="Non-striker"
              value={selectedBall.non_striker}
              players={players}
              onChange={(non_striker) => onBallChange(selection, { non_striker })}
            />
            <PlayerSelect
              label="Bowler"
              value={selectedBall.bowler}
              players={players}
              onChange={(bowler) => onBallChange(selection, { bowler })}
            />
            <PlayerSelect
              label="Fielder"
              value={selectedBall.fielder}
              players={players}
              onChange={(fielder) => onBallChange(selection, { fielder })}
            />
            <PlayerSelect
              label="Dismissed"
              value={selectedBall.dismissed}
              players={players}
              onChange={(dismissed) => onBallChange(selection, { dismissed })}
            />
            <PlayerSelect
              label="Wicket keeper"
              value={selectedBall.wicket_keeper}
              players={players}
              onChange={(wicket_keeper) => onBallChange(selection, { wicket_keeper })}
            />

            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Commentary
              </span>
              <textarea
                className="min-h-20 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                value={selectedBall.commentary ?? ''}
                onChange={(e) => onBallChange(selection, { commentary: e.target.value })}
              />
            </label>

            <Button type="button" variant="outline" className="w-full" onClick={() => setSelection(null)}>
              Close editor
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
