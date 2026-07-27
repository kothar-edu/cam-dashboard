import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { ScorecardOverview } from '@/components/scorecards/ScorecardOverview';
import {
  useScorecard,
  useUpdateLineupBatting,
  useUpdateLineupBowling,
  useUpdateLineupFielding,
} from '@/hooks/useScorecards';
import { getApiErrorMessage } from '@/lib/api-errors';
import type { LineupEntry } from '@/api/scorecards';
import { cn } from '@/lib/utils';

type EditableLineup = LineupEntry;
type DetailTab = 'overview' | 'edit';

export default function ScorecardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useScorecard(id);
  const battingMutation = useUpdateLineupBatting(id);
  const bowlingMutation = useUpdateLineupBowling(id);
  const fieldingMutation = useUpdateLineupFielding(id);

  const [tab, setTab] = useState<DetailTab>('overview');
  const [lineupsA, setLineupsA] = useState<EditableLineup[]>([]);
  const [lineupsB, setLineupsB] = useState<EditableLineup[]>([]);
  const [baselineA, setBaselineA] = useState<EditableLineup[]>([]);
  const [baselineB, setBaselineB] = useState<EditableLineup[]>([]);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    if (data) {
      const nextA = (data.lineups_a ?? []).map(normalizeLineup);
      const nextB = (data.lineups_b ?? []).map(normalizeLineup);
      setLineupsA(nextA);
      setLineupsB(nextB);
      setBaselineA(nextA);
      setBaselineB(nextB);
    }
  }, [data]);

  const allLineups = useMemo(() => [...lineupsA, ...lineupsB], [lineupsA, lineupsB]);
  const allBaseline = useMemo(() => [...baselineA, ...baselineB], [baselineA, baselineB]);

  const battingDirty = useMemo(
    () => isSectionDirty(allLineups, allBaseline, battingSnapshot),
    [allBaseline, allLineups]
  );
  const bowlingDirty = useMemo(
    () => isSectionDirty(allLineups, allBaseline, bowlingSnapshot),
    [allBaseline, allLineups]
  );
  const fieldingDirty = useMemo(
    () => isSectionDirty(allLineups, allBaseline, fieldingSnapshot),
    [allBaseline, allLineups]
  );
  const anyDirty = battingDirty || bowlingDirty || fieldingDirty;

  const battingPayload = () => allLineups.map(toBattingPayload);
  const bowlingPayload = () => allLineups.map(toBowlingPayload);
  const fieldingPayload = () => allLineups.map(toFieldingPayload);

  const markSaved = (sections: Array<'batting' | 'bowling' | 'fielding'>) => {
    const nextBaseline = allLineups.map((lineup) => {
      const base = allBaseline.find((item) => item.id === lineup.id) ?? lineup;
      return {
        ...base,
        ...(sections.includes('batting') ? battingFields(lineup) : battingFields(base)),
        ...(sections.includes('bowling') ? bowlingFields(lineup) : bowlingFields(base)),
        ...(sections.includes('fielding') ? fieldingFields(lineup) : fieldingFields(base)),
        player: lineup.player,
        id: lineup.id,
      };
    });
    const idsA = new Set(lineupsA.map((l) => l.id));
    setBaselineA(nextBaseline.filter((l) => idsA.has(l.id)));
    setBaselineB(nextBaseline.filter((l) => !idsA.has(l.id)));
  };

  const saveBatting = async () => {
    if (!allLineups.length) return;
    try {
      await battingMutation.mutateAsync(battingPayload());
      markSaved(['batting']);
      toast.success('Batting stats saved.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save batting stats.'));
    }
  };

  const saveBowling = async () => {
    if (!allLineups.length) return;
    try {
      await bowlingMutation.mutateAsync(bowlingPayload());
      markSaved(['bowling']);
      toast.success('Bowling stats saved.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save bowling stats.'));
    }
  };

  const saveFielding = async () => {
    if (!allLineups.length) return;
    try {
      await fieldingMutation.mutateAsync(fieldingPayload());
      markSaved(['fielding']);
      toast.success('Fielding stats saved.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save fielding stats.'));
    }
  };

  const saveAll = async () => {
    if (!allLineups.length || !anyDirty) return;
    setSavingAll(true);
    const saved: Array<'batting' | 'bowling' | 'fielding'> = [];
    try {
      const tasks: Array<Promise<unknown>> = [];
      if (battingDirty) {
        tasks.push(
          battingMutation.mutateAsync(battingPayload()).then(() => {
            saved.push('batting');
          })
        );
      }
      if (bowlingDirty) {
        tasks.push(
          bowlingMutation.mutateAsync(bowlingPayload()).then(() => {
            saved.push('bowling');
          })
        );
      }
      if (fieldingDirty) {
        tasks.push(
          fieldingMutation.mutateAsync(fieldingPayload()).then(() => {
            saved.push('fielding');
          })
        );
      }
      await Promise.all(tasks);
      markSaved(saved);
      toast.success('All changed stats saved.');
    } catch (error) {
      if (saved.length) markSaved(saved);
      toast.error(getApiErrorMessage(error, 'Failed to save some lineup stats.'));
    } finally {
      setSavingAll(false);
    }
  };

  const pending =
    savingAll ||
    battingMutation.isPending ||
    bowlingMutation.isPending ||
    fieldingMutation.isPending;
  const hasLineups = allLineups.length > 0;

  const title =
    data != null
      ? `${data.opponent_a.team.name} vs ${data.opponent_b.team.name}`
      : 'Scorecard';

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader title={title} backTo="/dashboard/scorecards" backLabel="All scorecards" />
        {isLoading && !data ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
          </div>
        ) : isError || !data ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            Unable to load scorecard.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
              <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>
                Scorecard
              </TabButton>
              <TabButton active={tab === 'edit'} onClick={() => setTab('edit')}>
                Edit stats
              </TabButton>
            </div>

            {tab === 'overview' ? (
              <ScorecardOverview data={data} />
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Adjust batting, bowling, and fielding figures. Use Save all for every change, or
                  save one section at a time.
                </p>
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

                <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                  <Button
                    type="button"
                    onClick={() => void saveAll()}
                    disabled={pending || !hasLineups || !anyDirty}
                  >
                    {savingAll ? 'Saving all…' : 'Save all'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void saveBatting()}
                    disabled={pending || !hasLineups || !battingDirty}
                  >
                    {battingMutation.isPending && !savingAll
                      ? 'Saving batting…'
                      : 'Save batting stats'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void saveBowling()}
                    disabled={pending || !hasLineups || !bowlingDirty}
                  >
                    {bowlingMutation.isPending && !savingAll
                      ? 'Saving bowling…'
                      : 'Save bowling stats'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void saveFielding()}
                    disabled={pending || !hasLineups || !fieldingDirty}
                  >
                    {fieldingMutation.isPending && !savingAll
                      ? 'Saving fielding…'
                      : 'Save fielding stats'}
                  </Button>
                </div>
                {anyDirty ? (
                  <p className="text-xs text-muted-foreground">
                    Unsaved changes:{' '}
                    {[
                      battingDirty ? 'batting' : null,
                      bowlingDirty ? 'bowling' : null,
                      fieldingDirty ? 'fielding' : null,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                    .
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">All stats match the saved scorecard.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </TenantRequired>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition',
        active
          ? 'bg-[#12233D] text-white shadow-sm'
          : 'text-muted-foreground hover:text-[#12233D]'
      )}
    >
      {children}
    </button>
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
                        <StatInput
                          value={lineup.runs_scored}
                          onChange={(value) => updateLineup(lineup.id, { runs_scored: value })}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.balls_faced}
                          onChange={(value) => updateLineup(lineup.id, { balls_faced: value })}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.fours}
                          onChange={(value) => updateLineup(lineup.id, { fours: value })}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.sixes}
                          onChange={(value) => updateLineup(lineup.id, { sixes: value })}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={lineup.dismissed}
                          onChange={(event) =>
                            updateLineup(lineup.id, { dismissed: event.target.checked })
                          }
                        />
                      </td>
                    </>
                  ) : mode === 'bowling' ? (
                    <>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.balls_thrown}
                          onChange={(value) => updateLineup(lineup.id, { balls_thrown: value })}
                        />
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
                        <StatInput
                          value={lineup.maidens}
                          onChange={(value) => updateLineup(lineup.id, { maidens: value })}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.hattricks}
                          onChange={(value) => updateLineup(lineup.id, { hattricks: value })}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.catches}
                          onChange={(value) => updateLineup(lineup.id, { catches: value })}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.run_outs}
                          onChange={(value) => updateLineup(lineup.id, { run_outs: value })}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.direct_hits}
                          onChange={(value) => updateLineup(lineup.id, { direct_hits: value })}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.run_out_supports}
                          onChange={(value) => updateLineup(lineup.id, { run_out_supports: value })}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <StatInput
                          value={lineup.stumps}
                          onChange={(value) => updateLineup(lineup.id, { stumps: value })}
                        />
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

function battingFields(lineup: EditableLineup) {
  return {
    runs_scored: lineup.runs_scored,
    balls_faced: lineup.balls_faced,
    fours: lineup.fours,
    sixes: lineup.sixes,
    dismissed: lineup.dismissed,
  };
}

function bowlingFields(lineup: EditableLineup) {
  return {
    balls_thrown: lineup.balls_thrown,
    runs_conceded: lineup.runs_conceded,
    wickets_taken: lineup.wickets_taken,
    maidens: lineup.maidens,
    hattricks: lineup.hattricks,
  };
}

function fieldingFields(lineup: EditableLineup) {
  return {
    catches: lineup.catches,
    run_outs: lineup.run_outs,
    direct_hits: lineup.direct_hits,
    run_out_supports: lineup.run_out_supports,
    stumps: lineup.stumps,
  };
}

function toBattingPayload(lineup: EditableLineup) {
  return { id: lineup.id, ...battingFields(lineup) };
}

function toBowlingPayload(lineup: EditableLineup) {
  return { id: lineup.id, ...bowlingFields(lineup) };
}

function toFieldingPayload(lineup: EditableLineup) {
  return { id: lineup.id, ...fieldingFields(lineup) };
}

function battingSnapshot(lineup: EditableLineup) {
  return JSON.stringify(battingFields(lineup));
}

function bowlingSnapshot(lineup: EditableLineup) {
  return JSON.stringify(bowlingFields(lineup));
}

function fieldingSnapshot(lineup: EditableLineup) {
  return JSON.stringify(fieldingFields(lineup));
}

function isSectionDirty(
  current: EditableLineup[],
  baseline: EditableLineup[],
  snapshot: (lineup: EditableLineup) => string
) {
  if (current.length !== baseline.length) return true;
  const baselineById = new Map(baseline.map((lineup) => [lineup.id, lineup]));
  return current.some((lineup) => {
    const base = baselineById.get(lineup.id);
    if (!base) return true;
    return snapshot(lineup) !== snapshot(base);
  });
}
