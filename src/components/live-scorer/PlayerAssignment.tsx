import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { playerOptionLabel } from '@/lib/playerLabel';
import { SectionCard } from './SectionCard';
import type {
  CurrentPlayersState,
  LiveMatchPlayer,
  OpponentsState,
  PlayerRole,
} from '@/types/liveMatch';

const SELECT_CLASS =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#12233D] focus:border-[#12233D] focus:outline-none focus:ring-1 focus:ring-[#12233D]';

const ROLE_LABEL: Record<PlayerRole, string> = {
  striker: 'Striker',
  non_striker: 'Non-Striker',
  bowler: 'Bowler',
  wicket_keeper: 'Wicket-Keeper',
};

type OptionState = { disabled: boolean; reason?: string };

type PlayerAssignmentProps = {
  currentPlayers: CurrentPlayersState;
  opponents: OpponentsState;
  updatePlayer: (type: PlayerRole, id: string) => void;
  updateRetiredHurtStatus: (playerId: string, canReturn: boolean) => void;
  disabled: boolean;
  bowlingLimit?: number;
};

export function PlayerAssignment({
  currentPlayers,
  opponents,
  updatePlayer,
  updateRetiredHurtStatus,
  disabled,
  bowlingLimit,
}: PlayerAssignmentProps) {
  const battingPlayers = opponents.batting?.players ?? [];
  const bowlingPlayers = opponents.bowling?.players ?? [];
  const retiredHurtPlayers = battingPlayers.filter((p) => p.retired_hurt);

  function battingOptionState(player: LiveMatchPlayer): OptionState {
    if (player.stats.is_out && !player.retired_hurt) return { disabled: true, reason: 'Out' };
    if (player.id === currentPlayers.striker?.id) return { disabled: true, reason: 'Striker' };
    if (player.id === currentPlayers.non_striker?.id)
      return { disabled: true, reason: 'Non-striker' };
    return { disabled: false };
  }

  function bowlerOptionState(player: LiveMatchPlayer): OptionState {
    if (player.id === currentPlayers.bowler?.id)
      return { disabled: true, reason: 'Bowled last over' };
    if (bowlingLimit && player.stats.overs_bowled >= bowlingLimit)
      return { disabled: true, reason: 'Over limit reached' };
    return { disabled: false };
  }

  return (
    <SectionCard title="Players on Field">
      <div className="flex flex-col gap-3">
        <RoleAssignmentRow
          role="striker"
          pool={battingPlayers}
          current={currentPlayers.striker}
          currentPlayers={currentPlayers}
          updatePlayer={updatePlayer}
          disabled={disabled}
          optionState={battingOptionState}
        />
        <RoleAssignmentRow
          role="non_striker"
          pool={battingPlayers}
          current={currentPlayers.non_striker}
          currentPlayers={currentPlayers}
          updatePlayer={updatePlayer}
          disabled={disabled}
          optionState={battingOptionState}
        />
        <RoleAssignmentRow
          role="bowler"
          pool={bowlingPlayers}
          current={currentPlayers.bowler}
          currentPlayers={currentPlayers}
          updatePlayer={updatePlayer}
          disabled={disabled}
          optionState={bowlerOptionState}
        />
        <RoleAssignmentRow
          role="wicket_keeper"
          pool={bowlingPlayers}
          current={currentPlayers.wicket_keeper}
          currentPlayers={currentPlayers}
          updatePlayer={updatePlayer}
          disabled={disabled}
        />

        {retiredHurtPlayers.length > 0 && (
          <div className="rounded-lg bg-orange-50 p-3">
            <p className="mb-2 text-sm font-bold text-orange-800">Retired Hurt</p>
            <div className="flex flex-col gap-2">
              {retiredHurtPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-md bg-white p-2 shadow-sm"
                >
                  <span className="text-sm font-medium">{player.full_name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant={player.can_return ? 'danger' : 'success'}
                    disabled={disabled}
                    onClick={() => updateRetiredHurtStatus(player.id, !player.can_return)}
                  >
                    {player.can_return ? 'Mark Cannot Return' : 'Mark Can Return'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function RoleAssignmentRow({
  role,
  pool,
  current,
  currentPlayers,
  updatePlayer,
  disabled,
  optionState,
}: {
  role: PlayerRole;
  pool: LiveMatchPlayer[];
  current: LiveMatchPlayer | null;
  currentPlayers: CurrentPlayersState;
  updatePlayer: (type: PlayerRole, id: string) => void;
  disabled: boolean;
  optionState?: (player: LiveMatchPlayer) => OptionState;
}) {
  const [selected, setSelected] = useState('');

  return (
    <div className="flex items-end gap-2">
      <label className="flex-1 text-xs font-medium text-[#12233D]">
        {ROLE_LABEL[role]}
        <select
          aria-label={ROLE_LABEL[role]}
          className={SELECT_CLASS}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">
            {current ? current.full_name : `Select ${ROLE_LABEL[role].toLowerCase()}`}
          </option>
          {pool.map((player) => {
            const state = optionState?.(player) ?? { disabled: false };
            return (
              <option key={player.id} value={player.id} disabled={state.disabled}>
                {playerOptionLabel(player, currentPlayers)}
                {state.reason ? ` — ${state.reason}` : ''}
              </option>
            );
          })}
        </select>
      </label>
      <Button
        type="button"
        size="sm"
        disabled={disabled || !selected}
        onClick={() => {
          updatePlayer(role, selected);
          setSelected('');
        }}
      >
        {`Confirm ${ROLE_LABEL[role].toLowerCase()}`}
      </Button>
    </div>
  );
}
