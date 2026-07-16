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
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        {backTo ? (
          <Link to={backTo} className="text-sm font-medium text-[#12233D] underline">
            {backLabel ?? 'Back'}
          </Link>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
