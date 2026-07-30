import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { ScorecardOverview } from '@/components/scorecards/ScorecardOverview';
import { BallByBallEditor } from '@/components/scorecards/BallByBallEditor';
import { ScorecardValidateModal } from '@/components/scorecards/ScorecardValidateModal';
import { useApplyScorecard, useScorecard, useValidateScorecard } from '@/hooks/useScorecards';
import {
  hasBallHistory,
  parseScorecardResult,
  type ScoreBall,
  type ScorecardBallPatch,
  type ScorecardEditOutcome,
  type ScorecardEditPatch,
  type ScorecardLineupPatch,
  type ScorecardResultDump,
  type LineupEntry,
} from '@/api/scorecards';
import { getApiErrorMessage } from '@/lib/api-errors';
import { matchOutcomeLabel } from '@/lib/scorecard';
import { cn } from '@/lib/utils';

type DetailTab = 'overview' | 'stats' | 'balls' | 'officials';

/** Flip to true to restore the aggregate batting & bowling editor tab. */
const SHOW_BATTING_BOWLING_TAB = false;

/** Flip to true to restore the Match tied toggle on the Officials tab. */
const SHOW_MATCH_TIED_TOGGLE = false;

export default function ScorecardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useScorecard(id);
  const validateMutation = useValidateScorecard(id);
  const applyMutation = useApplyScorecard(id);

  const [tab, setTab] = useState<DetailTab>('overview');
  const [lineupsA, setLineupsA] = useState<LineupEntry[]>([]);
  const [lineupsB, setLineupsB] = useState<LineupEntry[]>([]);
  const [baselineA, setBaselineA] = useState<LineupEntry[]>([]);
  const [baselineB, setBaselineB] = useState<LineupEntry[]>([]);
  const [resultDraft, setResultDraft] = useState<ScorecardResultDump | null>(null);
  const [baselineResult, setBaselineResult] = useState<ScorecardResultDump | null>(null);
  const [abandoned, setAbandoned] = useState(false);
  const [tied, setTied] = useState(false);
  const [dls, setDls] = useState(false);
  const [motm, setMotm] = useState<string | null>(null);
  const [baselineMeta, setBaselineMeta] = useState({
    abandoned: false,
    tied: false,
    dls: false,
    motm: null as string | null,
  });
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewOutcome, setReviewOutcome] = useState<ScorecardEditOutcome | null>(null);
  const [pendingPatch, setPendingPatch] = useState<ScorecardEditPatch | null>(null);
  const [confirmedTokens, setConfirmedTokens] = useState<Set<string>>(new Set());
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  useEffect(() => {
    if (!data) return;
    const nextA = (data.lineups_a ?? []).map(normalizeLineup);
    const nextB = (data.lineups_b ?? []).map(normalizeLineup);
    setLineupsA(nextA);
    setLineupsB(nextB);
    setBaselineA(nextA);
    setBaselineB(nextB);
    const parsed = parseScorecardResult(data.result);
    setResultDraft(parsed ? structuredClone(parsed) : null);
    setBaselineResult(parsed ? structuredClone(parsed) : null);
    const meta = {
      abandoned: Boolean(data.abandoned),
      tied: Boolean(data.tied),
      dls: Boolean(data.dls),
      motm: data.man_of_the_match?.id ?? null,
    };
    setAbandoned(meta.abandoned);
    setTied(meta.tied);
    setDls(meta.dls);
    setMotm(meta.motm);
    setBaselineMeta(meta);
    setConfirmedTokens(new Set());
  }, [data]);

  const allLineups = useMemo(() => [...lineupsA, ...lineupsB], [lineupsA, lineupsB]);
  const allBaseline = useMemo(() => [...baselineA, ...baselineB], [baselineA, baselineB]);
  const players = useMemo(
    () =>
      allLineups.map((lineup) => ({
        id: String(lineup.player.id),
        full_name: lineup.player.full_name,
      })),
    [allLineups]
  );

  const lineupDirty = useMemo(
    () =>
      JSON.stringify(allLineups.map(lineupSnapshot)) !==
      JSON.stringify(allBaseline.map(lineupSnapshot)),
    [allBaseline, allLineups]
  );
  const ballsDirty = useMemo(
    () => JSON.stringify(resultDraft) !== JSON.stringify(baselineResult),
    [baselineResult, resultDraft]
  );
  const metaDirty =
    abandoned !== baselineMeta.abandoned ||
    tied !== baselineMeta.tied ||
    dls !== baselineMeta.dls ||
    motm !== baselineMeta.motm;
  const anyDirty = lineupDirty || ballsDirty || metaDirty;
  const ballHistoryAvailable = hasBallHistory(resultDraft ?? data?.result);

  const buildPatch = (
    draftOverride?: ScorecardResultDump | null,
    tokensOverride?: Set<string>
  ): ScorecardEditPatch => {
    const draft = draftOverride !== undefined ? draftOverride : resultDraft;
    const tokens = tokensOverride ?? confirmedTokens;
    const lineups: ScorecardLineupPatch[] = [];
    for (const lineup of allLineups) {
      const base = allBaseline.find((item) => item.id === lineup.id);
      if (!base) continue;
      const patch: ScorecardLineupPatch = { id: Number(lineup.id) };
      let dirty = false;
      (
        Object.keys(lineupSnapshot(lineup)) as Array<keyof ReturnType<typeof lineupSnapshot>>
      ).forEach((key) => {
        if (lineupSnapshot(lineup)[key] !== lineupSnapshot(base)[key]) {
          (patch as Record<string, unknown>)[key] = lineupSnapshot(lineup)[key];
          dirty = true;
        }
      });
      if (dirty) lineups.push(patch);
    }

    const balls: ScorecardBallPatch[] = [];
    if (draft && baselineResult) {
      (draft.innings || []).forEach((inning, innings_index) => {
        (inning.overs || []).forEach((over, over_index) => {
          (over.scores || []).forEach((ball, ball_index) => {
            const before =
              baselineResult.innings?.[innings_index]?.overs?.[over_index]?.scores?.[ball_index];
            if (!before) return;
            const fields: Array<keyof ScoreBall> = [
              'value',
              'runs',
              'extras',
              'striker',
              'non_striker',
              'bowler',
              'wicket_keeper',
              'dismissed',
              'fielder',
              'commentary',
              'is_bat_involved',
              'bye_type',
            ];
            const changed = fields.some((field) => before[field] !== ball[field]);
            if (!changed) return;
            const patch: ScorecardBallPatch = { innings_index, over_index, ball_index };
            fields.forEach((field) => {
              if (before[field] !== ball[field]) {
                (patch as Record<string, unknown>)[field] = ball[field];
              }
            });
            balls.push(patch);
          });
        });
      });
    }

    const match: ScorecardEditPatch['match'] = {};
    if (abandoned !== baselineMeta.abandoned) match.abandoned = abandoned;
    if (tied !== baselineMeta.tied) match.tied = tied;
    if (dls !== baselineMeta.dls) match.dls = dls;
    if (motm !== baselineMeta.motm) match.man_of_the_match = motm;

    return {
      ...(lineups.length ? { lineups } : {}),
      ...(balls.length ? { balls } : {}),
      ...(Object.keys(match).length ? { match } : {}),
      ...(tokens.size ? { confirmed_batter_slots: Array.from(tokens) } : {}),
    };
  };

  const discardDraft = () => {
    if (!anyDirty) return;
    setLineupsA(baselineA.map(normalizeLineup));
    setLineupsB(baselineB.map(normalizeLineup));
    setResultDraft(baselineResult ? structuredClone(baselineResult) : null);
    setAbandoned(baselineMeta.abandoned);
    setTied(baselineMeta.tied);
    setDls(baselineMeta.dls);
    setMotm(baselineMeta.motm);
    setConfirmedTokens(new Set());
  };

  const onValidate = async () => {
    if (!id || !anyDirty) return;
    const patch = buildPatch();
    try {
      const outcome = await validateMutation.mutateAsync(patch);
      setPendingPatch(patch);
      setReviewOutcome(outcome);
      setReviewOpen(true);
      if (outcome.errors.length) {
        toast.error('Scorecard has validation errors');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not validate scorecard'));
    }
  };

  const onApply = async () => {
    if (!id || !pendingPatch) return;
    try {
      const outcome = await applyMutation.mutateAsync(pendingPatch);
      if (outcome.errors?.length || outcome.ok === false) {
        setReviewOutcome(outcome);
        toast.error('Could not apply scorecard changes');
        return;
      }
      toast.success('Scorecard updated');
      setReviewOpen(false);
      setReviewOutcome(null);
      setPendingPatch(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not apply scorecard changes'));
    }
  };

  // Applies a consistency-issue fix (or confirmation) and immediately re-validates.
  // Builds the patch from the freshly-computed draft/tokens directly rather than
  // waiting for setState to flush, since useState updates aren't visible to a
  // buildPatch() call made in the same tick.
  const onResolveIssue = async (
    patches: Array<{
      innings_index: number;
      over_index: number;
      ball_index: number;
      striker?: string | null;
      non_striker?: string | null;
    }>,
    tokens: string[] = []
  ) => {
    if (!id || !resultDraft) return;
    const nextDraft = structuredClone(resultDraft);
    patches.forEach((p) => {
      const ball =
        nextDraft.innings?.[p.innings_index]?.overs?.[p.over_index]?.scores?.[p.ball_index];
      if (!ball) return;
      if ('striker' in p) ball.striker = p.striker;
      if ('non_striker' in p) ball.non_striker = p.non_striker;
    });
    const nextTokens = new Set(confirmedTokens);
    tokens.forEach((t) => nextTokens.add(t));

    setResultDraft(nextDraft);
    setConfirmedTokens(nextTokens);

    const patch = buildPatch(nextDraft, nextTokens);
    try {
      const outcome = await validateMutation.mutateAsync(patch);
      setPendingPatch(patch);
      setReviewOutcome(outcome);
      if (outcome.errors.length) {
        toast.error('Scorecard has validation errors');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not validate scorecard'));
    }
  };

  const updateLineup = (side: 'a' | 'b', lineupId: string, patch: Partial<LineupEntry>) => {
    const setter = side === 'a' ? setLineupsA : setLineupsB;
    setter((current) =>
      current.map((lineup) => (lineup.id === lineupId ? { ...lineup, ...patch } : lineup))
    );
  };

  const onBallChange = (
    selection: { innings_index: number; over_index: number; ball_index: number },
    patch: Partial<ScoreBall>
  ) => {
    setResultDraft((current) => {
      if (!current) return current;
      const next = structuredClone(current);
      const ball =
        next.innings?.[selection.innings_index]?.overs?.[selection.over_index]?.scores?.[
          selection.ball_index
        ];
      if (!ball) return current;
      Object.assign(ball, patch);
      return next;
    });
  };

  return (
    <TenantRequired>
      <div className="space-y-4 pb-24">
        <PageHeader
          title="Scorecard"
          description={
            data
              ? `${data.opponent_a.team.name} vs ${data.opponent_b.team.name}`
              : 'Ended match scorecard'
          }
        />

        {isLoading ? <LoadingSpinner className="h-8 w-8 text-[#12233D]" /> : null}
        {isError ? <p className="text-sm text-red-600">Could not load this scorecard.</p> : null}

        {data ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[#12233D]">
                  {data.opponent_a.team.name} vs {data.opponent_b.team.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {matchOutcomeLabel({
                    winner: data.winner,
                    abandoned: data.abandoned ?? false,
                    tied: data.tied ?? false,
                  })}
                  {anyDirty ? ' · Unsaved draft' : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!anyDirty}
                  onClick={() => setDiscardConfirmOpen(true)}
                >
                  Discard
                </Button>
                <Button
                  type="button"
                  disabled={!anyDirty || validateMutation.isPending}
                  onClick={() => void onValidate()}
                >
                  {validateMutation.isPending ? 'Validating…' : 'Validate scorecard'}
                </Button>
              </div>
            </div>

            <Modal
              open={discardConfirmOpen}
              onOpenChange={setDiscardConfirmOpen}
              title="Discard unsaved changes?"
              className="max-w-sm"
            >
              <div className="mt-3 space-y-4">
                <p className="text-sm text-muted-foreground">
                  This throws away every edit made in this draft. Nothing has been saved yet, so
                  this only affects what&apos;s on this screen.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDiscardConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setDiscardConfirmOpen(false);
                      discardDraft();
                    }}
                  >
                    Yes, discard
                  </Button>
                </div>
              </div>
            </Modal>

            <div className="relative flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
              <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>
                Overview
              </TabButton>
              <TabButton active={tab === 'balls'} onClick={() => setTab('balls')}>
                Ball by ball
              </TabButton>
              <TabButton active={tab === 'officials'} onClick={() => setTab('officials')}>
                Officials
              </TabButton>
              {/* Kept last and visually/interaction-disabled so the stats editor
                  code path stays wired for a future re-enable. */}
              <TabButton
                active={tab === 'stats'}
                onClick={() => {
                  if (!SHOW_BATTING_BOWLING_TAB) return;
                  setTab('stats');
                }}
                className={
                  SHOW_BATTING_BOWLING_TAB
                    ? undefined
                    : 'pointer-events-none absolute h-0 w-0 overflow-hidden border-0 p-0 opacity-0'
                }
                tabIndex={SHOW_BATTING_BOWLING_TAB ? 0 : -1}
                aria-hidden={!SHOW_BATTING_BOWLING_TAB}
              >
                Batting & bowling
              </TabButton>
            </div>

            {tab === 'overview' ? <ScorecardOverview data={data} /> : null}

            {tab === 'stats' ? (
              <div className="space-y-4">
                <InningsStatsEditor
                  title={`${data.opponent_a.team.name} — batting & fielding`}
                  lineups={lineupsA}
                  onChange={(lineupId, patch) => updateLineup('a', lineupId, patch)}
                  mode="batting"
                />
                <InningsStatsEditor
                  title={`${data.opponent_b.team.name} — batting & fielding`}
                  lineups={lineupsB}
                  onChange={(lineupId, patch) => updateLineup('b', lineupId, patch)}
                  mode="batting"
                />
                <InningsStatsEditor
                  title={`${data.opponent_a.team.name} — bowling`}
                  lineups={lineupsA}
                  onChange={(lineupId, patch) => updateLineup('a', lineupId, patch)}
                  mode="bowling"
                />
                <InningsStatsEditor
                  title={`${data.opponent_b.team.name} — bowling`}
                  lineups={lineupsB}
                  onChange={(lineupId, patch) => updateLineup('b', lineupId, patch)}
                  mode="bowling"
                />
                {ballHistoryAvailable ? (
                  <p className="text-xs text-muted-foreground">
                    This match has ball history. Aggregate edits that conflict with balls will be
                    rejected on validate — prefer editing balls when correcting dismissals or
                    attribution.
                  </p>
                ) : null}
              </div>
            ) : null}

            {tab === 'balls' ? (
              resultDraft && ballHistoryAvailable ? (
                <BallByBallEditor
                  result={resultDraft}
                  players={players}
                  onBallChange={onBallChange}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-muted-foreground">
                  No ball-by-ball history is available for this match.
                </div>
              )
            ) : null}

            {tab === 'officials' ? (
              <div className="grid gap-4 rounded-xl border bg-white p-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    Player of the match
                  </span>
                  <select
                    className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                    value={motm || ''}
                    onChange={(e) => setMotm(e.target.value || null)}
                  >
                    <option value="">—</option>
                    {players.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.full_name}
                      </option>
                    ))}
                  </select>
                </label>
                <ToggleRow label="Match abandoned" value={abandoned} onChange={setAbandoned} />
                {/* Kept wired but visually/interaction-disabled for a future re-enable. */}
                <div
                  className={
                    SHOW_MATCH_TIED_TOGGLE
                      ? undefined
                      : 'pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0'
                  }
                  aria-hidden={!SHOW_MATCH_TIED_TOGGLE}
                >
                  <ToggleRow
                    label="Match tied"
                    value={tied}
                    onChange={(value) => {
                      if (!SHOW_MATCH_TIED_TOGGLE) return;
                      setTied(value);
                    }}
                  />
                </div>
                <ToggleRow label="D/L applied" value={dls} onChange={setDls} />
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <ScorecardValidateModal
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        outcome={reviewOutcome}
        applying={applyMutation.isPending}
        onApply={() => void onApply()}
        onResolveIssue={onResolveIssue}
      />
    </TenantRequired>
  );
}

function TabButton({
  active,
  onClick,
  children,
  className,
  tabIndex,
  'aria-hidden': ariaHidden,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  tabIndex?: number;
  'aria-hidden'?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={tabIndex}
      aria-hidden={ariaHidden}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition',
        active ? 'bg-[#12233D] text-white shadow-sm' : 'text-muted-foreground hover:text-[#12233D]',
        className
      )}
    >
      {children}
    </button>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
      <span className="font-medium text-[#12233D]">{label}</span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function InningsStatsEditor({
  title,
  lineups,
  onChange,
  mode,
}: {
  title: string;
  lineups: LineupEntry[];
  onChange: (lineupId: string, patch: Partial<LineupEntry>) => void;
  mode: 'batting' | 'bowling';
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b bg-[#12233D] px-4 py-2.5 text-sm font-semibold text-white">
        {title}
      </div>
      {lineups.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Player</th>
                {mode === 'batting' ? (
                  <>
                    <th className="px-3 py-2 font-medium">R</th>
                    <th className="px-3 py-2 font-medium">B</th>
                    <th className="px-3 py-2 font-medium">4s</th>
                    <th className="px-3 py-2 font-medium">6s</th>
                    <th className="px-3 py-2 font-medium">Out</th>
                    <th className="px-3 py-2 font-medium">Ct</th>
                    <th className="px-3 py-2 font-medium">RO</th>
                    <th className="px-3 py-2 font-medium">St</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-2 font-medium">Balls</th>
                    <th className="px-3 py-2 font-medium">Runs</th>
                    <th className="px-3 py-2 font-medium">Wkts</th>
                    <th className="px-3 py-2 font-medium">Mdns</th>
                    <th className="px-3 py-2 font-medium">HT</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {lineups.map((lineup) => (
                <tr key={lineup.id} className="border-t">
                  <td className="px-4 py-2 font-medium text-[#12233D]">
                    {lineup.player.full_name}
                  </td>
                  {mode === 'batting' ? (
                    <>
                      <td className="px-2 py-1.5">
                        <StatInput
                          value={lineup.runs_scored}
                          onChange={(value) => onChange(lineup.id, { runs_scored: value })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <StatInput
                          value={lineup.balls_faced}
                          onChange={(value) => onChange(lineup.id, { balls_faced: value })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <StatInput
                          value={lineup.fours}
                          onChange={(value) => onChange(lineup.id, { fours: value })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <StatInput
                          value={lineup.sixes}
                          onChange={(value) => onChange(lineup.id, { sixes: value })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="checkbox"
                          checked={lineup.dismissed}
                          onChange={(e) => onChange(lineup.id, { dismissed: e.target.checked })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <StatInput
                          value={lineup.catches}
                          onChange={(value) => onChange(lineup.id, { catches: value })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <StatInput
                          value={lineup.run_outs}
                          onChange={(value) => onChange(lineup.id, { run_outs: value })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <StatInput
                          value={lineup.stumps}
                          onChange={(value) => onChange(lineup.id, { stumps: value })}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-2 py-1.5">
                        <StatInput
                          value={lineup.balls_thrown}
                          onChange={(value) => onChange(lineup.id, { balls_thrown: value })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <StatInput
                          value={lineup.runs_conceded}
                          onChange={(value) => onChange(lineup.id, { runs_conceded: value })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <StatInput
                          value={lineup.wickets_taken}
                          onChange={(value) => onChange(lineup.id, { wickets_taken: value })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <StatInput
                          value={lineup.maidens}
                          onChange={(value) => onChange(lineup.id, { maidens: value })}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <StatInput
                          value={lineup.hattricks}
                          onChange={(value) => onChange(lineup.id, { hattricks: value })}
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
        <p className="px-4 py-6 text-sm text-muted-foreground">No players in this lineup.</p>
      )}
    </div>
  );
}

function StatInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      className="w-16 rounded-md border border-slate-200 px-2 py-1 text-sm"
      value={value}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
    />
  );
}

function normalizeLineup(lineup: LineupEntry): LineupEntry {
  return {
    ...lineup,
    id: String(lineup.id),
    player: {
      id: String(lineup.player.id),
      full_name: lineup.player.full_name,
    },
    runs_scored: Number(lineup.runs_scored || 0),
    balls_faced: Number(lineup.balls_faced || 0),
    fours: Number(lineup.fours || 0),
    sixes: Number(lineup.sixes || 0),
    dismissed: Boolean(lineup.dismissed),
    balls_thrown: Number(lineup.balls_thrown || 0),
    runs_conceded: Number(lineup.runs_conceded || 0),
    wickets_taken: Number(lineup.wickets_taken || 0),
    maidens: Number(lineup.maidens || 0),
    hattricks: Number(lineup.hattricks || 0),
    catches: Number(lineup.catches || 0),
    run_outs: Number(lineup.run_outs || 0),
    direct_hits: Number(lineup.direct_hits || 0),
    run_out_supports: Number(lineup.run_out_supports || 0),
    stumps: Number(lineup.stumps || 0),
  };
}

function lineupSnapshot(lineup: LineupEntry) {
  return {
    runs_scored: lineup.runs_scored,
    balls_faced: lineup.balls_faced,
    fours: lineup.fours,
    sixes: lineup.sixes,
    dismissed: lineup.dismissed,
    balls_thrown: lineup.balls_thrown,
    runs_conceded: lineup.runs_conceded,
    wickets_taken: lineup.wickets_taken,
    maidens: lineup.maidens,
    hattricks: lineup.hattricks,
    catches: lineup.catches,
    run_outs: lineup.run_outs,
    direct_hits: lineup.direct_hits,
    run_out_supports: lineup.run_out_supports,
    stumps: lineup.stumps,
  };
}
