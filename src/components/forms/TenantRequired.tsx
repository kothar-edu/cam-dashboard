import type { ReactNode } from 'react';
import { useTenant } from '@/contexts/TenantContext';

type TenantRequiredProps = {
  children: ReactNode;
  message?: string;
};

export function TenantRequired({ children, message }: TenantRequiredProps) {
  const { activeTenant } = useTenant();

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {message ?? 'Choose a tenant from the header to continue.'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
