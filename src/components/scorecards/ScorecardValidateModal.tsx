import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { ScorecardChangeItem, ScorecardEditOutcome } from '@/api/scorecards';
import { cn } from '@/lib/utils';

type ScorecardValidateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outcome: ScorecardEditOutcome | null;
  applying: boolean;
  onApply: () => void;
};

function groupChanges(changes: ScorecardChangeItem[]) {
  const groups: Record<string, ScorecardChangeItem[]> = {
    match: [],
    ball: [],
    lineup: [],
    other: [],
  };
  for (const change of changes) {
    if (change.entity === 'match') groups.match.push(change);
    else if (change.entity === 'ball') groups.ball.push(change);
    else if (change.entity === 'lineup') groups.lineup.push(change);
    else groups.other.push(change);
  }
  return groups;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export function ScorecardValidateModal({
  open,
  onOpenChange,
  outcome,
  applying,
  onApply,
}: ScorecardValidateModalProps) {
  if (!outcome) return null;

  const hasErrors = outcome.errors.length > 0;
  const winnerWarning = outcome.warnings.find((w) => w.toLowerCase().includes('winner'));
  const otherWarnings = outcome.warnings.filter((w) => w !== winnerWarning);
  const groups = groupChanges(outcome.changes);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Validate scorecard"
      className="max-w-2xl"
    >
      <div className="mt-4 space-y-4">
        {hasErrors ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-3">
            <h3 className="text-sm font-semibold text-red-800">Cannot apply</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
              {outcome.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {winnerWarning ? (
          <section className="rounded-lg border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
              Winner will change
            </p>
            <p className="mt-1 text-base font-medium text-amber-950">{winnerWarning}</p>
          </section>
        ) : null}

        {otherWarnings.length ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
            <h3 className="text-sm font-semibold text-amber-900">Warnings</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
              {otherWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h3 className="text-sm font-semibold text-[#12233D]">Everything that will change</h3>
          {!outcome.changes.length ? (
            <p className="mt-2 text-sm text-muted-foreground">No field changes detected.</p>
          ) : (
            <div className="mt-3 max-h-72 space-y-4 overflow-y-auto pr-1">
              {(
                [
                  ['Match', groups.match],
                  ['Balls', groups.ball],
                  ['Players', groups.lineup],
                  ['Other', groups.other],
                ] as const
              ).map(([title, items]) =>
                items.length ? (
                  <div key={title}>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {title}
                    </p>
                    <ul className="divide-y rounded-md border bg-slate-50">
                      {items.map((change) => (
                        <li
                          key={`${change.entity}-${change.entity_id}-${change.field}`}
                          className="px-3 py-2 text-sm"
                        >
                          <p className="font-medium text-[#12233D]">{change.label}</p>
                          <p className="mt-0.5 text-muted-foreground">
                            <span className="line-through opacity-70">
                              {formatValue(change.before)}
                            </span>
                            <span className="mx-2 text-[#E8A93B]">→</span>
                            <span className={cn('font-medium text-[#12233D]')}>
                              {formatValue(change.after)}
                            </span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )}
            </div>
          )}
        </section>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onApply} disabled={hasErrors || applying}>
            {applying ? 'Applying…' : 'Apply changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
