import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useCreateFixturesBulk } from '@/hooks/useFixtures';
import { useTeams } from '@/hooks/useTeams';
import type { CreateFixturePayload } from '@/api/fixtures';

type BulkRow = CreateFixturePayload & { key: string };

function emptyRow(): BulkRow {
  return {
    key: crypto.randomUUID(),
    name: '',
    team_a: '',
    team_b: '',
    time: '',
    ground: '',
  };
}

export default function BulkFixtureFormPage() {
  const navigate = useNavigate();
  const teamsQuery = useTeams();
  const bulkMutation = useCreateFixturesBulk();
  const [rows, setRows] = useState<BulkRow[]>([emptyRow(), emptyRow()]);

  const updateRow = (key: string, field: keyof CreateFixturePayload, value: string) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = rows
      .filter((row) => row.name && row.team_a && row.team_b && row.time && row.ground)
      .map(({ key: _key, ...row }) => ({
        ...row,
        time: new Date(row.time).toISOString(),
      }));
    if (!payload.length) return;
    bulkMutation.mutate(payload, { onSuccess: () => navigate('/dashboard/fixtures') });
  };

  const teams = teamsQuery.data?.results ?? [];

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader title="Bulk fixture upload" backTo="/dashboard/fixtures/new" backLabel="Single fixture" />
        <form onSubmit={handleSubmit} className="space-y-4">
          {rows.map((row, index) => (
            <div key={row.key} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-5">
              <Input
                label={`Row ${index + 1} series`}
                value={row.name}
                onChange={(e) => updateRow(row.key, 'name', e.target.value)}
              />
              <TeamSelect teams={teams} value={row.team_a} onChange={(v) => updateRow(row.key, 'team_a', v)} />
              <TeamSelect teams={teams} value={row.team_b} onChange={(v) => updateRow(row.key, 'team_b', v)} />
              <Input
                label="Time"
                type="datetime-local"
                value={row.time}
                onChange={(e) => updateRow(row.key, 'time', e.target.value)}
              />
              <Input
                label="Ground"
                value={row.ground}
                onChange={(e) => updateRow(row.key, 'ground', e.target.value)}
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => setRows((r) => [...r, emptyRow()])}>
              Add row
            </Button>
            <Button type="submit" disabled={bulkMutation.isPending}>
              {bulkMutation.isPending ? 'Uploading…' : 'Create fixtures'}
            </Button>
          </div>
        </form>
      </div>
    </TenantRequired>
  );
}

function TeamSelect({
  teams,
  value,
  onChange,
}: {
  teams: Array<{ id: string; name: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#12233D]">Team</label>
      <select
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  );
}
