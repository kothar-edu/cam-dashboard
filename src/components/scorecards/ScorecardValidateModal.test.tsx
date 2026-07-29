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
      rotation_shift_issues: [],
      batter_slot_issues: [],
    };

    render(
      <ScorecardValidateModal
        open
        onOpenChange={() => undefined}
        outcome={outcome}
        applying={false}
        onApply={onApply}
        onResolveIssue={vi.fn()}
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

  it('requires confirming a second dialog before apply actually fires', async () => {
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
      rotation_shift_issues: [],
      batter_slot_issues: [],
    };

    render(
      <ScorecardValidateModal
        open
        onOpenChange={() => undefined}
        outcome={outcome}
        applying={false}
        onApply={onApply}
        onResolveIssue={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.getByText('Apply these changes?')).toBeInTheDocument();

    // Cancel on the confirm dialog must not apply, and the review modal
    // (with its own field-by-field diff) stays exactly as it was.
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.queryByText('Apply these changes?')).not.toBeInTheDocument();
    expect(screen.getByText('Ball 1.0.1 value')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await user.click(screen.getByRole('button', { name: 'Yes, apply changes' }));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('shows edit-caused consistency issues and fires onResolveIssue from the Fix button', async () => {
    const user = userEvent.setup();
    const onResolveIssue = vi.fn();
    const outcome: ScorecardEditOutcome = {
      ok: true,
      errors: [],
      warnings: [],
      changes: [],
      preview: {},
      rotation_shift_issues: [
        {
          kind: 'rotation_shift',
          innings_index: 0,
          message: 'Innings 1: strike rotation is off from ball 1.0.3 onward.',
          balls: ['0.0.2'],
          fix: [
            { innings_index: 0, over_index: 0, ball_index: 2, striker: 'p1', non_striker: 'p2' },
          ],
          caused_by_edit: true,
        },
      ],
      batter_slot_issues: [
        {
          kind: 'batter_slot',
          severity: 'confirm',
          innings_index: 0,
          over_index: 0,
          ball_index: 3,
          slot: 'striker',
          message: 'Ball 1.0.4: p1 is out here - confirm who takes the striker spot next.',
          default_player_id: 'p1',
          eligible_players: [{ id: 'p3', full_name: 'Player Three' }],
          token: '0.0.3.striker',
          caused_by_edit: true,
        },
      ],
    };

    render(
      <ScorecardValidateModal
        open
        onOpenChange={() => undefined}
        outcome={outcome}
        applying={false}
        onApply={vi.fn()}
        onResolveIssue={onResolveIssue}
      />
    );

    expect(screen.getByText('Data consistency — from this edit')).toBeInTheDocument();
    expect(screen.queryByText(/Pre-existing in this innings/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fix' }));
    expect(onResolveIssue).toHaveBeenCalledWith(outcome.rotation_shift_issues[0].fix);

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onResolveIssue).toHaveBeenCalledWith(
      [{ innings_index: 0, over_index: 0, ball_index: 3, striker: 'p1' }],
      ['0.0.3.striker']
    );
  });

  it('collapses pre-existing (not caused by this edit) issues behind a toggle', async () => {
    const user = userEvent.setup();
    const outcome: ScorecardEditOutcome = {
      ok: true,
      errors: [],
      warnings: [],
      changes: [],
      preview: {},
      rotation_shift_issues: [
        {
          kind: 'rotation_shift',
          innings_index: 1,
          message: 'Innings 2: strike rotation is off from ball 2.0.2 onward.',
          balls: ['1.0.1'],
          fix: [{ innings_index: 1, over_index: 0, ball_index: 1, striker: 'p1', non_striker: 'p2' }],
          caused_by_edit: false,
        },
      ],
      batter_slot_issues: [],
    };

    render(
      <ScorecardValidateModal
        open
        onOpenChange={() => undefined}
        outcome={outcome}
        applying={false}
        onApply={vi.fn()}
        onResolveIssue={vi.fn()}
      />
    );

    expect(screen.queryByText('Data consistency — from this edit')).not.toBeInTheDocument();
    expect(screen.getByText('Pre-existing in this innings (1)')).toBeInTheDocument();
    expect(screen.queryByText(/strike rotation is off from ball 2\.0\.2/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Pre-existing in this innings/ }));
    expect(screen.getByText(/strike rotation is off from ball 2\.0\.2/)).toBeInTheDocument();
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
