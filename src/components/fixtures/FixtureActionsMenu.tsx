import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Copy,
  ExternalLink,
  Flag,
  MoreVertical,
  Pencil,
  Radio,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ForfeitDialog } from '@/components/ui/forfeit-dialog';
import { useTenant } from '@/contexts/TenantContext';
import { useAbandonFixture, useForfeitFixture, useUpdateFixture } from '@/hooks/useFixtures';
import { isLiveOrUpcoming, matchLabel } from '@/lib/fixtures';
import type { Fixture } from '@/api/fixtures';

const LIVESCORE_ADMIN_URL = import.meta.env.VITE_LIVESCORE_ADMIN_URL || 'http://localhost:3000';

type FixtureActionsMenuProps = {
  fixture: Fixture;
};

/**
 * Self-contained actions dropdown for a fixture row (Score Live, OBS
 * overlays, Edit, Forfeit/Abandon/Cancel) plus the dialogs those last three
 * open. Owns its own dialog state so it can be dropped into any table
 * (FixturesPage, the dashboard home matches panel) without callers wiring
 * anything up.
 */
export function FixtureActionsMenu({ fixture }: FixtureActionsMenuProps) {
  const { activeTenant } = useTenant();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [forfeitOpen, setForfeitOpen] = useState(false);
  const [forfeitedOpponentId, setForfeitedOpponentId] = useState('');
  const [pointsToAward, setPointsToAward] = useState(2);
  const [abandonOpen, setAbandonOpen] = useState(false);

  const updateFixture = useUpdateFixture();
  const forfeitFixture = useForfeitFixture();
  const abandonFixture = useAbandonFixture();

  const liveOrUpcoming = isLiveOrUpcoming(fixture.status);

  const overlayUrl = `${window.location.origin}/broadcast/${fixture.id}?tenant=${activeTenant?.schema_name}`;
  const legacyOverlayUrl = `${LIVESCORE_ADMIN_URL}/livestream/${fixture.id}?tenant=${activeTenant?.schema_name}`;

  const copyLink = (url: string, label: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success(`${label} link copied`))
      .catch(() => toast.error('Could not copy link'));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-[#12233D] hover:bg-gray-50"
            aria-label={`Actions for ${matchLabel(fixture)}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {liveOrUpcoming && (
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/fixtures/${fixture.id}/score`} className="text-green-700">
                <Radio className="h-4 w-4" />
                Score Live
              </Link>
            </DropdownMenuItem>
          )}
          {liveOrUpcoming && (
            <DropdownMenuItem asChild>
              <Link
                to={`/broadcast/${fixture.id}?tenant=${activeTenant?.schema_name}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="flex-1">OBS overlay</span>
                <button
                  type="button"
                  aria-label="Copy OBS overlay link"
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copyLink(overlayUrl, 'OBS overlay');
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </Link>
            </DropdownMenuItem>
          )}
          {liveOrUpcoming && (
            <DropdownMenuItem asChild>
              <a
                href={legacyOverlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="flex-1">OBS overlay (legacy)</span>
                <button
                  type="button"
                  aria-label="Copy legacy OBS overlay link"
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copyLink(legacyOverlayUrl, 'Legacy OBS overlay');
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to={`/dashboard/fixtures/${fixture.id}`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          {liveOrUpcoming && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-orange-700"
                onSelect={() => {
                  setForfeitedOpponentId('');
                  setPointsToAward(2);
                  setForfeitOpen(true);
                }}
              >
                <Flag className="h-4 w-4" />
                Forfeit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-yellow-700" onSelect={() => setAbandonOpen(true)}>
                <AlertTriangle className="h-4 w-4" />
                Abandon
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onSelect={() => setConfirmOpen(true)}>
                <XCircle className="h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel this fixture?"
        description="This marks the match as Cancelled. It will no longer appear as scheduled, but no data is deleted — you can reverse this later by editing the fixture's status back."
        confirmLabel="Cancel match"
        isLoading={updateFixture.isPending}
        onConfirm={() => {
          updateFixture.mutate(
            { id: fixture.id, payload: { status: 'Cancelled' } },
            { onSuccess: () => setConfirmOpen(false) }
          );
        }}
      />

      <ForfeitDialog
        open={forfeitOpen}
        onOpenChange={(open) => {
          setForfeitOpen(open);
          if (!open) {
            setForfeitedOpponentId('');
            setPointsToAward(2);
          }
        }}
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
                setForfeitOpen(false);
                setForfeitedOpponentId('');
                setPointsToAward(2);
              },
            }
          );
        }}
        teamAName={fixture.opponent_a.team_name}
        teamBName={fixture.opponent_b.team_name}
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
        description="This marks the match as abandoned with no result. Both teams will receive 1 point (in group stage), lineups will be cleared, and no winner will be declared. This cannot be easily reversed."
        confirmLabel="Abandon match"
        isLoading={abandonFixture.isPending}
        onConfirm={() => {
          abandonFixture.mutate(fixture.id, { onSuccess: () => setAbandonOpen(false) });
        }}
      />
    </>
  );
}
