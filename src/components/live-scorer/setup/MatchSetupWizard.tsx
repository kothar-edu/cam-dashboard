import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStartMatch } from '@/hooks/useFixtures';
import { useTeamRoster } from '@/hooks/useTeamRoster';
import type { FixtureDetail } from '@/api/fixtures';
import { SquadPicker } from './SquadPicker';
import { ReservePicker } from './ReservePicker';

type WizardStep = 'squad_a' | 'reserve_a' | 'squad_b' | 'reserve_b' | 'review';

const STEPS: Array<{ key: WizardStep; label: string }> = [
  { key: 'squad_a', label: 'Team A XI' },
  { key: 'reserve_a', label: 'Team A Reserve' },
  { key: 'squad_b', label: 'Team B XI' },
  { key: 'reserve_b', label: 'Team B Reserve' },
  { key: 'review', label: 'Review & Start' },
];

type MatchSetupWizardProps = {
  fixture: FixtureDetail;
};

export function MatchSetupWizard({ fixture }: MatchSetupWizardProps) {
  const [step, setStep] = useState<WizardStep>('squad_a');
  const [squadA, setSquadA] = useState<string[]>([]);
  const [reserveA, setReserveA] = useState<string | null>(null);
  const [squadB, setSquadB] = useState<string[]>([]);
  const [reserveB, setReserveB] = useState<string | null>(null);

  const startMatch = useStartMatch();
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  function handleStart() {
    startMatch.mutate(
      {
        id: fixture.id,
        payload: {
          opponent_a: { players: squadA, reserves: reserveA ? [reserveA] : [] },
          opponent_b: { players: squadB, reserves: reserveB ? [reserveB] : [] },
        },
      },
      {
        onSuccess: () => toast.success('Match started — you can begin scoring now.'),
        onError: () => toast.error('Could not start the match. Check the squads and try again.'),
      },
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <StepProgress steps={STEPS} currentIndex={stepIndex} />

      <div className="mt-6">
        {step === 'squad_a' && (
          <SquadPicker
            teamId={fixture.opponent_a.team.id}
            teamName={fixture.opponent_a.team.name}
            stepLabel={`Step 1 of ${STEPS.length}`}
            initialSelectedIds={squadA}
            onConfirm={(ids) => {
              setSquadA(ids);
              setStep('reserve_a');
            }}
          />
        )}

        {step === 'reserve_a' && (
          <ReservePicker
            teamId={fixture.opponent_a.team.id}
            teamName={fixture.opponent_a.team.name}
            stepLabel={`Step 2 of ${STEPS.length}`}
            excludeIds={squadA}
            initialSelectedId={reserveA}
            onConfirm={(id) => {
              setReserveA(id);
              setStep('squad_b');
            }}
            onBack={() => setStep('squad_a')}
          />
        )}

        {step === 'squad_b' && (
          <SquadPicker
            teamId={fixture.opponent_b.team.id}
            teamName={fixture.opponent_b.team.name}
            stepLabel={`Step 3 of ${STEPS.length}`}
            initialSelectedIds={squadB}
            onConfirm={(ids) => {
              setSquadB(ids);
              setStep('reserve_b');
            }}
            onBack={() => setStep('reserve_a')}
          />
        )}

        {step === 'reserve_b' && (
          <ReservePicker
            teamId={fixture.opponent_b.team.id}
            teamName={fixture.opponent_b.team.name}
            stepLabel={`Step 4 of ${STEPS.length}`}
            excludeIds={squadB}
            initialSelectedId={reserveB}
            onConfirm={(id) => {
              setReserveB(id);
              setStep('review');
            }}
            onBack={() => setStep('squad_b')}
          />
        )}

        {step === 'review' && (
          <ReviewStep
            fixture={fixture}
            squadAIds={squadA}
            reserveAId={reserveA}
            squadBIds={squadB}
            reserveBId={reserveB}
            isStarting={startMatch.isPending}
            onBack={() => setStep('reserve_b')}
            onStart={handleStart}
          />
        )}
      </div>
    </div>
  );
}

function StepProgress({ steps, currentIndex }: { steps: Array<{ key: WizardStep; label: string }>; currentIndex: number }) {
  return (
    <div className="flex items-center">
      {steps.map((s, index) => (
        <div key={s.key} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                index < currentIndex
                  ? 'bg-green-600 text-white'
                  : index === currentIndex
                    ? 'bg-[#12233D] text-white'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {index < currentIndex ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span className={`hidden text-[10px] sm:block ${index === currentIndex ? 'font-bold text-[#12233D]' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`mx-1 h-0.5 flex-1 ${index < currentIndex ? 'bg-green-600' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ReviewStep({
  fixture, squadAIds, reserveAId, squadBIds, reserveBId, isStarting, onBack, onStart,
}: {
  fixture: FixtureDetail;
  squadAIds: string[];
  reserveAId: string | null;
  squadBIds: string[];
  reserveBId: string | null;
  isStarting: boolean;
  onBack: () => void;
  onStart: () => void;
}) {
  const { data: rosterA } = useTeamRoster(fixture.opponent_a.team.id);
  const { data: rosterB } = useTeamRoster(fixture.opponent_b.team.id);
  const nameById = (roster: typeof rosterA, id: string) => roster?.find((p) => p.id === id)?.full_name ?? '—';

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Step 5 of 5</p>
        <h2 className="text-lg font-bold text-[#12233D]">Review & Start Match</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SquadSummaryCard teamName={fixture.opponent_a.team.name} playerIds={squadAIds} reserveId={reserveAId} nameFor={(id) => nameById(rosterA, id)} />
        <SquadSummaryCard teamName={fixture.opponent_b.team.name} playerIds={squadBIds} reserveId={reserveBId} nameFor={(id) => nameById(rosterB, id)} />
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <Button type="button" variant="secondary" disabled={isStarting} onClick={onBack}>
          Back
        </Button>
        <Button type="button" isLoading={isStarting} onClick={onStart}>
          {isStarting ? 'Starting match…' : 'Start Match'}
        </Button>
      </div>
    </div>
  );
}

function SquadSummaryCard({
  teamName, playerIds, reserveId, nameFor,
}: {
  teamName: string;
  playerIds: string[];
  reserveId: string | null;
  nameFor: (id: string) => string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="mb-2 text-sm font-bold text-[#12233D]">{teamName}</p>
      <ol className="space-y-1 text-sm text-gray-600">
        {playerIds.map((id, index) => (
          <li key={id} className="flex gap-1.5">
            <span className="text-gray-400">{index + 1}.</span>
            <span>{nameFor(id)}</span>
          </li>
        ))}
      </ol>
      {reserveId && (
        <p className="mt-2 border-t pt-2 text-xs text-gray-500">
          Reserve: <span className="font-medium text-[#12233D]">{nameFor(reserveId)}</span>
        </p>
      )}
    </div>
  );
}
