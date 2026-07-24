import type { CurrentPlayersState, LiveMatchPlayer } from '@/types/liveMatch';

/**
 * Role tags for a player-select option, matching the app's admin panel
 * dropdown convention (`[ b ]` / `[ wk ]` / `[ 12th man ]`) so a scorer can
 * tell who's currently bowling/keeping, or who's a reserve, without leaving
 * the dropdown.
 */
export function playerRoleTags(
  player: LiveMatchPlayer,
  currentPlayers: CurrentPlayersState,
): string[] {
  const tags: string[] = [];
  if (currentPlayers.bowler?.id === player.id) tags.push('b');
  if (currentPlayers.wicket_keeper?.id === player.id) tags.push('wk');
  if (player.reserve) tags.push('12th man');
  return tags;
}

export function playerOptionLabel(
  player: LiveMatchPlayer,
  currentPlayers: CurrentPlayersState,
): string {
  const tags = playerRoleTags(player, currentPlayers);
  return tags.length
    ? `${player.full_name} ${tags.map((tag) => `[ ${tag} ]`).join(' ')}`
    : player.full_name;
}
