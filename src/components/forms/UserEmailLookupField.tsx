import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLookupUserByEmailMutation } from '@/hooks/useUserLookup';

type UserEmailLookupFieldProps = {
  onResolved: (user: { id: string; email: string; full_name: string }) => void;
  onClear?: () => void;
};

function lookupErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 403) {
      return 'You do not have permission to look up users.';
    }
    if (status === 404) {
      return 'No user found for that email.';
    }
    if (status && status >= 500) {
      return 'Lookup failed due to a server error. Please try again.';
    }
  }
  return 'Lookup failed. Please try again.';
}

export function UserEmailLookupField({ onResolved, onClear }: UserEmailLookupFieldProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const lookupMutation = useLookupUserByEmailMutation();

  const handleLookup = () => {
    setMessage(null);
    lookupMutation.mutate(email, {
      onSuccess: (user) => {
        onResolved(user);
        setMessage(`Found ${user.full_name} (${user.email})`);
      },
      onError: (error) => {
        onClear?.();
        setMessage(lookupErrorMessage(error));
      },
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <Input
            label="Admin email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleLookup}
          disabled={lookupMutation.isPending}
        >
          {lookupMutation.isPending ? 'Searching…' : 'Look up'}
        </Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
