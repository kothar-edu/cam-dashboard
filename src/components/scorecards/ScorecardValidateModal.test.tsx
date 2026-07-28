import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ScorecardValidateModal } from '@/components/scorecards/ScorecardValidateModal';
import { BallByBallEditor } from '@/components/scorecards/BallByBallEditor';
import type { ScorecardEditOutcome } from '@/api/scorecards';

describe('ScorecardValidateModal', () => {
  it('disables apply when there are errors and shows winner warning', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const outcome: ScorecardEditOutcome = {
      ok: false,
      errors: ['Aggregates disagree with ball history'],
      warnings: ['Winner will change from A to B. Group-stage points table may need review.'],
      changes: [
        {
          entity: 'match',
          entity_id: '1',
          field: 'winner',
          before: 'A',
          after: 'B',
          label: 'Match winner',
        },
      ],
      preview: {},
    };

    render(
      <ScorecardValidateModal
        open
        onOpenChange={() => undefined}
        outcome={outcome}
        applying={false}
        onApply={onApply}
      />
    );

    expect(screen.getByText('Cannot apply')).toBeInTheDocument();
    expect(screen.getByText('Winner will change')).toBeInTheDocument();
    expect(
      screen.getByText(/Winner will change from A to B\. Group-stage points table may need review\./)
    ).toBeInTheDocument();
    expect(screen.getByText('Match winner')).toBeInTheDocument();

    const apply = screen.getByRole('button', { name: 'Apply changes' });
    expect(apply).toBeDisabled();
    await user.click(apply);
    expect(onApply).not.toHaveBeenCalled();
  });

  it('allows apply when validation succeeds with warnings only', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const outcome: ScorecardEditOutcome = {
      ok: true,
      errors: [],
      warnings: ['Winner will change from A to B.'],
      changes: [
        {
          entity: 'ball',
          entity_id: '0.0.0',
          field: 'value',
          before: 1,
          after: 6,
          label: 'Ball 1.0.1 value',
        },
      ],
      preview: { winner: 'B' },
    };

    render(
      <ScorecardValidateModal
        open
        onOpenChange={() => undefined}
        outcome={outcome}
        applying={false}
        onApply={onApply}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(onApply).toHaveBeenCalledTimes(1);
  });
});

describe('BallByBallEditor', () => {
  it('shows empty state when there is no ball history', () => {
    render(
      <BallByBallEditor
        result={{ innings: [] }}
        players={[]}
        onBallChange={() => undefined}
      />
    );
    expect(screen.getByText(/No ball-by-ball history/i)).toBeInTheDocument();
  });
});
