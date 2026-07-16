import type * as React from 'react';

export const Button: React.ForwardRefExoticComponent<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
    isLoading?: boolean;
  } & React.RefAttributes<HTMLButtonElement>
>;
