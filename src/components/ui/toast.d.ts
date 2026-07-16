import type * as React from 'react';

export type ToastProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'default' | 'destructive';
  title?: React.ReactNode;
  description?: React.ReactNode;
};

export type ToastActionElement = React.ReactElement;
