import type * as React from 'react';

export const Select: React.FC<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}>;

export const SelectTrigger: React.ForwardRefExoticComponent<
  {
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
    id?: string;
    'aria-expanded'?: boolean;
    'aria-required'?: boolean;
  } & React.RefAttributes<HTMLButtonElement>
>;

export const SelectValue: React.FC<{
  placeholder?: string;
  children?: React.ReactNode;
  selectedDisplayText?: React.ReactNode;
}>;

export const SelectContent: React.ForwardRefExoticComponent<
  {
    className?: string;
    children?: React.ReactNode;
    searchable?: boolean;
    maxHeight?: number;
    position?: {
      top: number;
      left: number;
      width: number;
      maxHeight?: number;
      placement?: 'top' | 'bottom';
    };
    value?: string;
    onValueChange?: (value: string, displayText: React.ReactNode) => void;
    onClose?: () => void;
  } & React.RefAttributes<HTMLDivElement>
>;

export const SelectItem: React.FC<{
  value: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  selected?: boolean;
  highlighted?: boolean;
  onSelect?: (event: React.MouseEvent) => void;
  onMouseEnter?: () => void;
}>;
