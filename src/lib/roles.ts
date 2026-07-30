/**
 * Roles that outrank the default "Audience" floor, checked in display
 * priority order. Mirrors cam-cricket's core/utils/roles.dart so the same
 * account shows the same role label on mobile and in the dashboard.
 */
const ELEVATED_ROLES_BY_PRIORITY = ['Superuser', 'Team Maintainer', 'Player'] as const;

function roleDisplayLabel(role: string): string {
  return role === 'Superuser' ? 'Admin' : role;
}

/**
 * Display label for a user's roles, most senior first (e.g. "Admin, Player").
 * Falls back to "Guest" for an Audience-only account, or "N/A" if unknown.
 */
export function roleSummaryLabel(roles: string[] | null | undefined): string {
  if (!roles) return 'N/A';
  const present = ELEVATED_ROLES_BY_PRIORITY.filter((role) => roles.includes(role)).map(
    roleDisplayLabel
  );
  if (present.length) return present.join(', ');
  return roles.includes('Audience') ? 'Guest' : 'N/A';
}
