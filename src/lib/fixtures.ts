import type { Fixture } from '@/api/fixtures';

export function formatFixtureDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function matchLabel(fixture: {
  opponent_a: { team_name: string };
  opponent_b: { team_name: string };
}) {
  return `${fixture.opponent_a.team_name} vs ${fixture.opponent_b.team_name}`;
}

export function matchHref(fixture: Fixture) {
  return fixture.status === 'Ended'
    ? `/dashboard/scorecards/${fixture.id}`
    : `/dashboard/fixtures/${fixture.id}`;
}

export function isLiveOrUpcoming(status: string) {
  return status === 'Live' || status === 'Upcoming';
}
