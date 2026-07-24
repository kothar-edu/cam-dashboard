import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ForfeitDialog } from '@/components/ui/forfeit-dialog';
import { useFixture, useForfeitFixture, useAbandonFixture } from '@/hooks/useFixtures';
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

export default function ScoreLivePage() {
  const { id } = useParams<{ id: string }>();
  const { data: fixture, isLoading } = useFixture(id);
  const { state, connectionStatus, sendEvent } = useLiveMatch(id, 'score');
  const actions = useScoreActions(sendEvent);
  const connected = connectionStatus === 'open';

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [forfeitOpen, setForfeitOpen] = useState(false);
  const [forfeitedOpponentId, setForfeitedOpponentId] = useState('');
  const [pointsToAward, setPointsToAward] = useState(2);
  const [abandonOpen, setAbandonOpen] = useState(false);

  const forfeitFixture = useForfeitFixture();
  const abandonFixture = useAbandonFixture();

  if (isLoading || !fixture) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
      </div>
    );
  }

  return (
    <TenantRequired>
      <div className="space-y-4">
        <PageHeader
          title={`${fixture.opponent_a.team.name} vs ${fixture.opponent_b.team.name}`}
          backTo="/dashboard/fixtures"
        />

        {!connected && (
          <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
            {connectionStatus === 'closed'
              ? 'Disconnected from live scoring — refresh to try again.'
              : 'Reconnecting to live scoring…'}
          </div>
        )}

        <BallHistoryStrip scoreHistory={state.scoreHistory} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <RunControls broadcastScore={actions.broadcastScore} disabled={!connected} />
            <ExtrasControls broadcastScore={actions.broadcastScore} disabled={!connected} />
            <WicketControls
              broadcastWicket={actions.broadcastWicket}
              currentPlayers={state.currentPlayers}
              fieldingOpponent={state.opponents.bowling}
              disabled={!connected}
            />
            <TossAndMatchControls
              broadcastGameEvent={actions.broadcastGameEvent}
              teamA={state.opponents.team_a}
              teamB={state.opponents.team_b}
              disabled={!connected}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </div>
          <div className="flex flex-col gap-4">
            <PlayerAssignment
              currentPlayers={state.currentPlayers}
              opponents={state.opponents}
              updatePlayer={actions.updatePlayer}
              updateRetiredHurtStatus={actions.updateRetiredHurtStatus}
              disabled={!connected}
            />
            <CommentaryPanel broadcastCommentary={actions.broadcastCommentary} disabled={!connected} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-4">
          <button
            type="button"
            className="rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-700 hover:bg-orange-100"
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
            className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-100"
            onClick={() => setAbandonOpen(true)}
          >
            Abandon
          </button>
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
            if (!fixture || !forfeitedOpponentId) return;
            forfeitFixture.mutate(
              { id: fixture.id, payload: { forfeited_opponent_id: forfeitedOpponentId, points_to_award: pointsToAward } },
              {
                onSuccess: () => {
                  toast.success('Match forfeited');
                  setForfeitOpen(false);
                },
                onError: () => toast.error('Could not forfeit the match'),
              },
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
            if (!fixture) return;
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
    </TenantRequired>
  );
}
