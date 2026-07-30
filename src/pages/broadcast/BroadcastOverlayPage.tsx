import { ScoreBug } from '@/components/broadcast/ScoreBug';
import { BatterBowlerCards, BowlerRow } from '@/components/broadcast/BatterBowlerCards';
import { OverHistoryStrip } from '@/components/broadcast/OverHistoryStrip';
import { CommentaryBar } from '@/components/broadcast/CommentaryBar';
import { SponsorCorners, SPONSOR_LOGO_CLASS } from '@/components/broadcast/SponsorCorners';
import { CelebrationFlash, MilestoneFlash } from '@/components/broadcast/CelebrationFlash';
import { PlayerChangeFlash } from '@/components/broadcast/PlayerChangeFlash';
import { PartnershipStrip } from '@/components/broadcast/PartnershipStrip';
import { FallOfWicketsTicker } from '@/components/broadcast/FallOfWicketsTicker';
import { ExtrasBreakdownChip } from '@/components/broadcast/ExtrasBreakdownChip';
import { PowerplayBadge } from '@/components/broadcast/PowerplayBadge';
import { TeamLogoBadge } from '@/components/broadcast/TeamLogoBadge';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import { useLiveMatchInfo } from '@/hooks/useLiveMatchInfo';
import { useCanvasScale } from '@/hooks/useCanvasScale';
import { APP_NAME } from '@/lib/branding';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

export default function BroadcastOverlayPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [searchParams] = useSearchParams();
  const tenant = searchParams.get('tenant');

  const { state } = useLiveMatch(matchId, 'view', tenant);
  const { data: info, isLoading } = useLiveMatchInfo(matchId, tenant);
  const { scaleX, scaleY } = useCanvasScale(CANVAS_WIDTH, CANVAS_HEIGHT);

  useEffect(() => {
    document.title =
      state.opponents.team_a && state.opponents.team_b
        ? `LIVE | ${state.opponents.team_a.code} vs ${state.opponents.team_b.code}`
        : `${APP_NAME} Live Broadcast`;
  }, [state.opponents.team_a, state.opponents.team_b]);

  if (!matchId || isLoading || !info) {
    return <div className="fixed inset-0 bg-transparent" />;
  }

  const latestMilestone = state.milestones[state.milestones.length - 1] ?? null;
  const milestonePlayer =
    latestMilestone &&
    [
      state.currentPlayers.striker,
      state.currentPlayers.non_striker,
      state.currentPlayers.bowler,
    ].find((p) => p?.id === latestMilestone.playerId);

  const playerNameById: Record<string, string> = {};
  for (const opponent of [state.opponents.batting, state.opponents.bowling]) {
    for (const player of opponent?.players ?? []) {
      playerNameById[player.id] = player.full_name;
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-transparent">
      <div
        data-testid="broadcast-canvas"
        className="relative h-[1080px] w-[1920px] shrink-0 bg-transparent"
        style={{ transform: `scale(${scaleX}, ${scaleY})` }}
      >
        <CelebrationFlash lastEvent={state.lastEvent} boundaryLabels={info.boundaryLabels} />
        <PlayerChangeFlash playerChange={state.playerChange} />
        {latestMilestone && milestonePlayer && (
          <MilestoneFlash milestone={latestMilestone} playerName={milestonePlayer.full_name} />
        )}

        <SponsorCorners topRightImage={info.livestreamOverlay.topRightImage} />

        <div className="absolute left-16 top-10 flex flex-col items-start gap-3">
          {info.livestreamOverlay.topLeftImage && (
            <img
              src={info.livestreamOverlay.topLeftImage}
              alt="Sponsor logo"
              className={SPONSOR_LOGO_CLASS}
            />
          )}
          <div className="flex flex-col gap-2">
            <PowerplayBadge current={state.current} powerplayOvers={info.powerplayOvers} />
            <PartnershipStrip
              partnership={state.partnership}
              current={state.current}
              striker={state.currentPlayers.striker}
              nonStriker={state.currentPlayers.non_striker}
            />
            <ExtrasBreakdownChip extras={state.extras} />
            <FallOfWicketsTicker entries={state.fallOfWickets} playerNameById={playerNameById} />
          </div>
        </div>

        <div className="absolute bottom-14 flex w-full flex-col items-center gap-2">
          <div className="flex w-11/12 items-center gap-3 rounded-2xl bg-sky-200/80 px-4 py-3 shadow-lg">
            <TeamLogoBadge team={state.opponents.batting} side="batting" />
            <BatterBowlerCards currentPlayers={state.currentPlayers} sponsors={info.sponsors} />
            <div className="flex w-[640px] shrink-0 flex-col items-center gap-1 pl-1">
              <ScoreBug
                current={state.current}
                battingTeam={state.opponents.batting}
                bowlingTeam={state.opponents.bowling}
                teamA={state.opponents.team_a}
                teamB={state.opponents.team_b}
                outcome={info.outcome}
              />
              <OverHistoryStrip thisOver={state.scoreHistory[state.current.over] ?? []} />
            </div>
            <div className="flex min-w-[220px] shrink-0 flex-col justify-center">
              <BowlerRow player={state.currentPlayers.bowler} />
            </div>
            <TeamLogoBadge team={state.opponents.bowling} side="bowling" />
          </div>
        </div>

        <CommentaryBar
          current={state.current}
          battingTeam={state.opponents.batting}
          bowlingTeam={state.opponents.bowling}
          ground={info.ground}
          sponsorText={info.livestreamOverlay.sponsorText}
        />
      </div>
    </div>
  );
}
