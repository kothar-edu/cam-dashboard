import { useMemo, useState } from 'react';
import { Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTeamRoster } from '@/hooks/useTeamRoster';

type ReservePickerProps = {
  teamId: string;
  teamName: string;
  stepLabel: string;
  excludeIds: string[];
  initialSelectedId: string | null;
  onConfirm: (reserveId: string | null) => void;
  onBack: () => void;
};

export function ReservePicker({ teamId, teamName, stepLabel, excludeIds, initialSelectedId, onConfirm, onBack }: ReservePickerProps) {
  const { data: roster, isLoading } = useTeamRoster(teamId);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);

  const eligible = useMemo(() => (roster ?? []).filter((player) => !excludeIds.includes(player.id)), [roster, excludeIds]);
  const filtered = useMemo(() => {
    if (!search.trim()) return eligible;
    const query = search.trim().toLowerCase();
    return eligible.filter((player) => player.full_name.toLowerCase().includes(query));
  }, [eligible, search]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{stepLabel}</p>
        <h2 className="text-lg font-bold text-[#12233D]">{teamName} — Reserve (12th Man)</h2>
        <p className="mt-0.5 text-sm text-gray-500">Optional — pick 0 or 1 reserve.</p>
      </div>

      {eligible.length > 0 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search players…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      <div className="max-h-[26rem] overflow-y-auto rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner className="h-6 w-6 text-[#12233D]" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            {eligible.length === 0 ? 'No players remaining in the squad.' : 'No players found.'}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((player) => {
              const checked = selectedId === player.id;
              return (
                <li key={player.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(checked ? null : player.id)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        checked ? 'border-[#12233D] bg-[#12233D]' : 'border-gray-300'
                      }`}
                    >
                      {checked && <Check className="h-3.5 w-3.5 text-white" />}
                    </span>
                    <span className="flex-1 text-sm font-medium text-[#12233D]">{player.full_name}</span>
                    {player.jersey_no != null && (
                      <span className="shrink-0 text-xs text-gray-400">#{player.jersey_no}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={() => onConfirm(selectedId)}>
          {selectedId ? 'Continue' : 'Continue without reserve'}
        </Button>
      </div>
    </div>
  );
}
