import { useMemo, useState } from 'react';
import { Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTeamRoster } from '@/hooks/useTeamRoster';

const SQUAD_SIZE = 11;

type SquadPickerProps = {
  teamId: string;
  teamName: string;
  stepLabel: string;
  initialSelectedIds: string[];
  onConfirm: (selectedIds: string[]) => void;
  onBack?: () => void;
};

export function SquadPicker({ teamId, teamName, stepLabel, initialSelectedIds, onConfirm, onBack }: SquadPickerProps) {
  const { data: roster, isLoading } = useTeamRoster(teamId);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  const filtered = useMemo(() => {
    const players = roster ?? [];
    if (!search.trim()) return players;
    const query = search.trim().toLowerCase();
    return players.filter((player) => player.full_name.toLowerCase().includes(query));
  }, [roster, search]);

  function toggle(playerId: string) {
    setSelectedIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId],
    );
  }

  const isValid = selectedIds.length === SQUAD_SIZE;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{stepLabel}</p>
        <h2 className="text-lg font-bold text-[#12233D]">{teamName} — Starting XI</h2>
        <p className="mt-0.5 text-sm text-gray-500">Select exactly {SQUAD_SIZE} players.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search players…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
            isValid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {selectedIds.length}/{SQUAD_SIZE}
        </span>
      </div>

      <div className="max-h-[26rem] overflow-y-auto rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner className="h-6 w-6 text-[#12233D]" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">No players found.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((player) => {
              const checked = selectedIds.includes(player.id);
              return (
                <li key={player.id}>
                  <button
                    type="button"
                    onClick={() => toggle(player.id)}
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
        {onBack ? (
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button type="button" disabled={!isValid} onClick={() => onConfirm(selectedIds)}>
          Continue
        </Button>
      </div>
    </div>
  );
}
