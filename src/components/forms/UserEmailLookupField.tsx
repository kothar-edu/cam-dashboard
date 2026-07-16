import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLookupUserByEmailMutation } from '@/hooks/useUserLookup';

type UserEmailLookupFieldProps = {
  onResolved: (user: { id: string; email: string; full_name: string }) => void;
  onClear?: () => void;
};

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
      onError: () => {
        onClear?.();
        setMessage('No user found for that email.');
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
        <Button type="button" variant="outline" onClick={handleLookup} disabled={lookupMutation.isPending}>
          {lookupMutation.isPending ? 'Searching…' : 'Look up'}
        </Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
