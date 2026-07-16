import { useLocation } from 'react-router-dom';

const RESOURCE_LABELS: Record<string, string> = {
  teams: 'team',
  tournaments: 'tournament',
  players: 'player',
  fixtures: 'fixture',
  scorecards: 'scorecard',
  posts: 'post',
  sponsors: 'sponsor',
  voting: 'voting poll',
};

function titleFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const resource = parts[1];
  const action = parts[2];
  const sub = parts[3];
  const label = resource ? RESOURCE_LABELS[resource] : undefined;

  if (resource === 'fixtures' && action === 'new' && sub === 'bulk') {
    return 'Bulk fixture upload';
  }
  if (action === 'new' && label) {
    return `New ${label}`;
  }
  if (action === 'stats') {
    return 'Player statistics';
  }
  if (resource === 'voting' && !action) {
    return 'Voting polls';
  }
  if (action && label) {
    return `${label.charAt(0).toUpperCase()}${label.slice(1)} detail`;
  }
  return 'Coming soon';
}

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const title = titleFromPath(pathname);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed bg-white p-12 text-center">
      <h2 className="text-xl font-semibold text-[#12233D]">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Detail and create flows are deferred to a future dashboard phase. List views and
        tenant-scoped admin actions are available from the sidebar.
      </p>
    </div>
  );
}
