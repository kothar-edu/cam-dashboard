import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import {
  useScorecard,
  useUpdateLineupBatting,
  useUpdateLineupBowling,
  useUpdateLineupFielding,
} from '@/hooks/useScorecards';
import type { LineupEntry } from '@/api/scorecards';

type EditableLineup = LineupEntry;

export default function ScorecardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useScorecard(id);
  const battingMutation = useUpdateLineupBatting(id);
  const bowlingMutation = useUpdateLineupBowling(id);
  const fieldingMutation = useUpdateLineupFielding(id);

  const [lineupsA, setLineupsA] = useState<EditableLineup[]>([]);
  const [lineupsB, setLineupsB] = useState<EditableLineup[]>([]);

  useEffect(() => {
    if (data) {
      setLineupsA((data.lineups_a ?? []).map(normalizeLineup));
      setLineupsB((data.lineups_b ?? []).map(normalizeLineup));
    }
  }, [data]);

  const saveBatting = () => {
    const payload = [...lineupsA, ...lineupsB].map((lineup) => ({
      id: lineup.id,
      runs_scored: lineup.runs_scored,
      balls_faced: lineup.balls_faced,
      fours: lineup.fours,
      sixes: lineup.sixes,
      dismissed: lineup.dismissed,
    }));
    if (payload.length) battingMutation.mutate(payload);
  };

  const saveBowling = () => {
    const payload = [...lineupsA, ...lineupsB].map((lineup) => ({
      id: lineup.id,
      balls_thrown: lineup.balls_thrown,
      runs_conceded: lineup.runs_conceded,
      wickets_taken: lineup.wickets_taken,
      maidens: lineup.maidens,
      hattricks: lineup.hattricks,
    }));
    if (payload.length) bowlingMutation.mutate(payload);
  };

  const saveFielding = () => {
    const payload = [...lineupsA, ...lineupsB].map((lineup) => ({
      id: lineup.id,
      catches: lineup.catches,
      run_outs: lineup.run_outs,
      direct_hits: lineup.direct_hits,
      run_out_supports: lineup.run_out_supports,
      stumps: lineup.stumps,
    }));
    if (payload.length) fieldingMutation.mutate(payload);
  };

  const pending = battingMutation.isPending || bowlingMutation.isPending || fieldingMutation.isPending;
  const saveError = battingMutation.isError || bowlingMutation.isError || fieldingMutation.isError;
  const saveSuccess = battingMutation.isSuccess || bowlingMutation.isSuccess || fieldingMutation.isSuccess;

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader title="Scorecard editor" backTo="/dashboard/scorecards" />
        {isLoading && !data ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : isError || !data ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">Unable to load scorecard.</div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-semibold text-[#12233D]">
                {data.opponent_a.team.name} vs {data.opponent_b.team.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {data.tournament?.name ?? 'Custom match'} · {data.status} · {data.ground ?? 'Venue TBC'}
              </p>
              {data.result ? <p className="mt-2 text-sm">{data.result}</p> : null}
            </div>

            <LineupEditor
              title={`${data.opponent_a.team.name} — batting`}
              lineups={lineupsA}
              onChange={setLineupsA}
              mode="batting"
            />
            <LineupEditor
              title={`${data.opponent_b.team.name} — batting`}
              lineups={lineupsB}
              onChange={setLineupsB}
              mode="batting"
            />
            <LineupEditor
              title={`${data.opponent_a.team.name} — bowling`}
              lineups={lineupsA}
              onChange={setLineupsA}
              mode="bowling"
            />
            <LineupEditor
              title={`${data.opponent_b.team.name} — bowling`}
              lineups={lineupsB}
              onChange={setLineupsB}
              mode="bowling"
            />
            <LineupEditor
              title={`${data.opponent_a.team.name} — fielding`}
              lineups={lineupsA}
              onChange={setLineupsA}
              mode="fielding"
            />
            <LineupEditor
              title={`${data.opponent_b.team.name} — fielding`}
              lineups={lineupsB}
              onChange={setLineupsB}
              mode="fielding"
            />

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={saveBatting} disabled={pending || (!lineupsA.length && !lineupsB.length)}>
                {battingMutation.isPending ? 'Saving batting…' : 'Save batting stats'}
              </Button>
              <Button type="button" variant="outline" onClick={saveBowling} disabled={pending || (!lineupsA.length && !lineupsB.length)}>
                {bowlingMutation.isPending ? 'Saving bowling…' : 'Save bowling stats'}
              </Button>
              <Button type="button" variant="outline" onClick={saveFielding} disabled={pending || (!lineupsA.length && !lineupsB.length)}>
                {fieldingMutation.isPending ? 'Saving fielding…' : 'Save fielding stats'}
              </Button>
            </div>
            {saveError ? <p className="text-sm text-red-600">Failed to save lineup changes.</p> : null}
            {saveSuccess ? <p className="text-sm text-green-700">Lineup stats saved.</p> : null}
          </div>
        )}
      </div>
    </TenantRequired>
  );
}

function LineupEditor({
  title,
  lineups,
  onChange,
  mode,
}: {
  title: string;
  lineups: EditableLineup[];
  onChange: (lineups: EditableLineup[]) => void;
  mode: 'batting' | 'bowling' | 'fielding';
}) {
  const updateLineup = (lineupId: string, patch: Partial<EditableLineup>) => {
    onChange(lineups.map((lineup) => (lineup.id === lineupId ? { ...lineup, ...patch } : lineup)));
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="border-b px-4 py-3 font-semibold text-[#12233D]">{title}</div>
      {lineups.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2">Player</th>
                {mode === 'batting' ? (
                  <>
                    <th className="px-4 py-2">Runs</th>
                    <th className="px-4 py-2">Balls</th>
                    <th className="px-4 py-2">4s</th>
                    <th className="px-4 py-2">6s</th>
                    <th className="px-4 py-2">Out</th>
                  </>
                ) : mode === 'bowling' ? (
                  <>
                    <th className="px-4 py-2">Balls</th>
                    <th className="px-4 py-2">Runs conc.</th>
                    <th className="px-4 py-2">Wkts</th>
                    <th className="px-4 py-2">Maidens</th>
                    <th className="px-4 py-2">Hattricks</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-2">Catches</th>
                    <th className="px-4 py-2">Run outs</th>
                    <th className="px-4 py-2">Direct hits</th>
                    <th className="px-4 py-2">RO support</th>
                    <th className="px-4 py-2">Stumpings</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {lineups.map((lineup) => (
                <tr key={lineup.id} className="border-t">
                  <td className="px-4 py-2">{lineup.player.full_name}</td>
                  {mode === 'batting' ? (
                    <>
                      <td className="px-4 py-2">
                        <StatInput value={lineup.runs_scored} onChange={(value) => updateLineup(lineup.id, { runs_scored: value })} />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput value={lineup.balls_faced} onChange={(value) => updateLineup(lineup.id, { balls_faced: value })} />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput value={lineup.fours} onChange={(value) => updateLineup(lineup.id, { fours: value })} />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput value={lineup.sixes} onChange={(value) => updateLineup(lineup.id, { sixes: value })} />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={lineup.dismissed}
                          onChange={(event) => updateLineup(lineup.id, { dismissed: event.target.checked })}
                        />
                      </td>
                    </>
                  ) : mode === 'bowling' ? (
                    <>
                      <td className="px-4 py-2">
                        <StatInput value={lineup.balls_thrown} onChange={(value) => updateLineup(lineup.id, { balls_thrown: value })} />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.runs_conceded}
                          onChange={(value) => updateLineup(lineup.id, { runs_conceded: value })}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.wickets_taken}
                          onChange={(value) => updateLineup(lineup.id, { wickets_taken: value })}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput value={lineup.maidens} onChange={(value) => updateLineup(lineup.id, { maidens: value })} />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput value={lineup.hattricks} onChange={(value) => updateLineup(lineup.id, { hattricks: value })} />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2">
                        <StatInput value={lineup.catches} onChange={(value) => updateLineup(lineup.id, { catches: value })} />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput value={lineup.run_outs} onChange={(value) => updateLineup(lineup.id, { run_outs: value })} />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput value={lineup.direct_hits} onChange={(value) => updateLineup(lineup.id, { direct_hits: value })} />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.run_out_supports}
                          onChange={(value) => updateLineup(lineup.id, { run_out_supports: value })}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput value={lineup.stumps} onChange={(value) => updateLineup(lineup.id, { stumps: value })} />
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-4 py-4 text-sm text-muted-foreground">No lineup data available.</p>
      )}
    </div>
  );
}

function StatInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      className="w-16 rounded border border-gray-300 px-2 py-1"
      value={value}
      onChange={(event) => onChange(Number(event.target.value) || 0)}
    />
  );
}

function normalizeLineup(lineup: LineupEntry): EditableLineup {
  return {
    id: lineup.id,
    player: lineup.player,
    runs_scored: lineup.runs_scored ?? 0,
    balls_faced: lineup.balls_faced ?? 0,
    fours: lineup.fours ?? 0,
    sixes: lineup.sixes ?? 0,
    dismissed: lineup.dismissed ?? false,
    wickets_taken: lineup.wickets_taken ?? 0,
    balls_thrown: lineup.balls_thrown ?? 0,
    runs_conceded: lineup.runs_conceded ?? 0,
    maidens: lineup.maidens ?? 0,
    hattricks: lineup.hattricks ?? 0,
    catches: lineup.catches ?? 0,
    run_outs: lineup.run_outs ?? 0,
    direct_hits: lineup.direct_hits ?? 0,
    run_out_supports: lineup.run_out_supports ?? 0,
    stumps: lineup.stumps ?? 0,
  };
}
