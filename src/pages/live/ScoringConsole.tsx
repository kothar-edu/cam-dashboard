import { useState } from 'react';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ForfeitDialog } from '@/components/ui/forfeit-dialog';
import { useForfeitFixture, useAbandonFixture } from '@/hooks/useFixtures';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import { useScoreActions } from '@/hooks/useScoreActions';
import { RunControls } from '@/components/live-scorer/RunControls';
import { ExtrasControls } from '@/components/live-scorer/ExtrasControls';
import { WicketControls } from '@/components/live-scorer/WicketControls';
import { PlayerAssignment } from '@/components/live-scorer/PlayerAssignment';
import { TossAndMatchControls } from '@/components/live-scorer/TossAndMatchControls';
import { MatchSettingsDialog } from '@/components/live-scorer/MatchSettingsDialog';
import { CommentaryPanel } from '@/components/live-scorer/CommentaryPanel';
import { BallHistoryStrip } from '@/components/live-scorer/BallHistoryStrip';
import { SectionCard } from '@/components/live-scorer/SectionCard';
import type { FixtureDetail } from '@/api/fixtures';

const CONNECTION_LABEL: Record<string, string> = {
  open: 'Live',
  connecting: 'Connecting…',
  reconnecting: 'Reconnecting…',
  closed: 'Disconnected',
};

const CONNECTION_DOT: Record<string, string> = {
  open: 'bg-green-500',
  connecting: 'bg-yellow-400',
  reconnecting: 'bg-yellow-400',
  closed: 'bg-red-500',
};

type ScoringConsoleProps = {
  fixture: FixtureDetail;
};

export function ScoringConsole({ fixture }: ScoringConsoleProps) {
  const { state, connectionStatus, sendEvent } = useLiveMatch(fixture.id, 'score');
  const actions = useScoreActions(sendEvent);
  const connected = connectionStatus === 'open';

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [forfeitOpen, setForfeitOpen] = useState(false);
  const [forfeitedOpponentId, setForfeitedOpponentId] = useState('');
  const [pointsToAward, setPointsToAward] = useState(2);
  const [abandonOpen, setAbandonOpen] = useState(false);

  const forfeitFixture = useForfeitFixture();
  const abandonFixture = useAbandonFixture();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${CONNECTION_DOT[connectionStatus]}`} />
        <span className="text-sm font-medium text-[#12233D]">
          {CONNECTION_LABEL[connectionStatus]}
        </span>
        {connected && <span className="text-sm text-gray-500">· {state.viewers} watching</span>}
        {connectionStatus === 'closed' && (
          <span className="text-sm text-gray-500"> — refresh the page to try reconnecting.</span>
        )}
      </div>

      <BallHistoryStrip scoreHistory={state.scoreHistory} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <SectionCard title="Score">
          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                Runs
              </p>
              <RunControls broadcastScore={actions.broadcastScore} disabled={!connected} />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                Extras
              </p>
              <ExtrasControls broadcastScore={actions.broadcastScore} disabled={!connected} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Wicket">
          <WicketControls
            broadcastWicket={actions.broadcastWicket}
            currentPlayers={state.currentPlayers}
            fieldingOpponent={state.opponents.bowling}
            disabled={!connected}
          />
        </SectionCard>

        <TossAndMatchControls
          broadcastGameEvent={actions.broadcastGameEvent}
          teamA={state.opponents.team_a}
          teamB={state.opponents.team_b}
          disabled={!connected}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <PlayerAssignment
          currentPlayers={state.currentPlayers}
          opponents={state.opponents}
          updatePlayer={actions.updatePlayer}
          updateRetiredHurtStatus={actions.updateRetiredHurtStatus}
          disabled={!connected}
          bowlingLimit={fixture.bowling_limit}
        />

        <SectionCard title="Commentary">
          <CommentaryPanel
            broadcastCommentary={actions.broadcastCommentary}
            disabled={!connected}
          />
        </SectionCard>

        <SectionCard title="Danger Zone" tone="danger">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md border border-orange-300 bg-orange-50 px-3 py-1.5 text-sm text-orange-700 hover:bg-orange-100"
              onClick={() => {
                setForfeitedOpponentId('');
                setPointsToAward(2);
                setForfeitOpen(true);
              }}
            >
              Forfeit
            </button>
            <button
              type="button"
              className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-sm text-yellow-700 hover:bg-yellow-100"
              onClick={() => setAbandonOpen(true)}
            >
              Abandon
            </button>
          </div>
        </SectionCard>
      </div>

      <MatchSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSubmit={(payload) => actions.broadcastGameEvent('SETTING', payload)}
      />

      <ForfeitDialog
        open={forfeitOpen}
        onOpenChange={setForfeitOpen}
        isLoading={forfeitFixture.isPending}
        onConfirm={() => {
          if (!forfeitedOpponentId) return;
          forfeitFixture.mutate(
            {
              id: fixture.id,
              payload: {
                forfeited_opponent_id: forfeitedOpponentId,
                points_to_award: pointsToAward,
              },
            },
            {
              onSuccess: () => {
                toast.success('Match forfeited');
                setForfeitOpen(false);
              },
              onError: () => toast.error('Could not forfeit the match'),
            }
          );
        }}
        teamAName={fixture.opponent_a.team.name}
        teamBName={fixture.opponent_b.team.name}
        teamAId={fixture.opponent_a.id}
        teamBId={fixture.opponent_b.id}
        forfeitedOpponentId={forfeitedOpponentId}
        setForfeitedOpponentId={setForfeitedOpponentId}
        pointsToAward={pointsToAward}
        setPointsToAward={setPointsToAward}
      />

      <ConfirmDialog
        open={abandonOpen}
        onOpenChange={setAbandonOpen}
        title="Abandon this match?"
        description="This marks the match as abandoned with no result. This cannot be easily reversed."
        confirmLabel="Abandon match"
        isLoading={abandonFixture.isPending}
        onConfirm={() => {
          abandonFixture.mutate(fixture.id, {
            onSuccess: () => {
              toast.success('Match abandoned');
              setAbandonOpen(false);
            },
            onError: () => toast.error('Could not abandon the match'),
          });
        }}
      />
    </div>
  );
}
