import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type PageHeaderProps = {
  title: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, backTo, backLabel, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1">
        {backTo ? (
          <Link to={backTo} className="text-sm font-medium text-[#12233D] underline">
            {backLabel ?? 'Back'}
          </Link>
        ) : null}
        <h1 className="break-words text-xl font-bold tracking-tight text-[#12233D] sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {action}
        </div>
      ) : null}
    </div>
  );
}
