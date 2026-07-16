import type * as React from 'react';

export const Select: React.FC<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}>;

export const SelectTrigger: React.FC<{
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}>;

export const SelectValue: React.FC<{
  placeholder?: string;
  children?: React.ReactNode;
}>;

export const SelectContent: React.FC<{
  className?: string;
  children?: React.ReactNode;
}>;

export const SelectItem: React.FC<{
  value: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}>;
