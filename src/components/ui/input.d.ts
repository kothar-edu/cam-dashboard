import type * as React from 'react';

export const Input: React.ForwardRefExoticComponent<
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
  } & React.RefAttributes<HTMLInputElement>
>;
