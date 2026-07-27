import type { PointsTableRow } from '@/api/points';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNrr, formatWinPct, sortStandings } from '@/lib/pointsTable';
import { cn } from '@/lib/utils';

type StandingsTableProps = {
  rows: PointsTableRow[];
  loading?: boolean;
};

function TeamCell({ row, position }: { row: PointsTableRow; position: number }) {
  const logo = row.team.logo;
  const initials = row.team.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
          position === 1
            ? 'bg-[#E8A93B] text-[#12233D]'
            : position <= 3
              ? 'bg-[#12233D]/10 text-[#12233D]'
              : 'bg-slate-100 text-muted-foreground'
        )}
      >
        {position}
      </span>
      {logo ? (
        <img src={logo} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#12233D] text-[10px] font-bold text-white">
          {initials || row.team.code?.slice(0, 2) || '?'}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate font-semibold text-[#12233D]">{row.team.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {row.team.code}
          {row.group ? ` · Group ${row.group}` : ''}
        </p>
      </div>
    </div>
  );
}

export function StandingsTable({ rows, loading }: StandingsTableProps) {
  const sorted = sortStandings(rows);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
        <p className="text-sm font-medium text-[#12233D]">No standings yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Points appear after completed tournament matches.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b bg-gradient-to-r from-[#12233D] to-[#1a3358] px-4 py-3">
        <h2 className="text-sm font-semibold tracking-wide text-white">Standings</h2>
        <p className="text-[11px] text-white/60">Sorted by points, then net run rate</p>
      </div>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="min-w-[12rem]">Team</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="hidden text-center sm:table-cell">T</TableHead>
              <TableHead className="hidden text-center md:table-cell">NR</TableHead>
              <TableHead className="text-center font-semibold text-[#12233D]">Pts</TableHead>
              <TableHead className="text-center">NRR</TableHead>
              <TableHead className="hidden text-center lg:table-cell">Win%</TableHead>
              <TableHead className="hidden text-right xl:table-cell">RF</TableHead>
              <TableHead className="hidden text-right xl:table-cell">RA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row, index) => {
              const position = index + 1;
              const nrrPositive = row.nrr > 0;
              const nrrNegative = row.nrr < 0;
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    position === 1 && 'bg-[#E8A93B]/5',
                    position <= 3 && position > 1 && 'bg-[#12233D]/[0.02]'
                  )}
                >
                  <TableCell>
                    <TeamCell row={row} position={position} />
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{row.matches_played}</TableCell>
                  <TableCell className="text-center tabular-nums text-emerald-700">
                    {row.matches_won}
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-rose-600">
                    {row.matches_lost}
                  </TableCell>
                  <TableCell className="hidden text-center tabular-nums sm:table-cell">
                    {row.tied}
                  </TableCell>
                  <TableCell className="hidden text-center tabular-nums md:table-cell">
                    {row.abandoned}
                  </TableCell>
                  <TableCell className="text-center text-base font-bold tabular-nums text-[#12233D]">
                    {row.points}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-center font-semibold tabular-nums',
                      nrrPositive && 'text-emerald-700',
                      nrrNegative && 'text-rose-600',
                      !nrrPositive && !nrrNegative && 'text-muted-foreground'
                    )}
                  >
                    {formatNrr(row.nrr)}
                  </TableCell>
                  <TableCell className="hidden text-center tabular-nums text-muted-foreground lg:table-cell">
                    {formatWinPct(row)}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums xl:table-cell">
                    {row.runs_scored ?? '—'}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums text-muted-foreground xl:table-cell">
                    {row.runs_conceded ?? '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="border-t bg-slate-50 px-4 py-2 text-[11px] text-muted-foreground">
        P played · W won · L lost · T tied · NR abandoned · RF runs for · RA runs against
      </div>
    </div>
  );
}
