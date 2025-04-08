"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

// This is a simplified version of the Select component
// In a real app, you would use a library like @radix-ui/react-select

export function Select({ value, onValueChange, children, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => !disabled && setOpen(!open),
            value,
            disabled,
          });
        }
        if (child.type === SelectContent) {
          return open
            ? React.cloneElement(child, {
                value,
                onValueChange,
                onClose: () => setOpen(false),
              })
            : null;
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({
  className,
  children,
  onClick,
  value,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder, children }) {
  return <span>{children || placeholder}</span>;
}

export function SelectContent({
  className,
  children,
  value,
  onValueChange,
  onClose,
  ...props
}) {
  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
        "w-full top-full mt-1",
        className
      )}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              selected: child.props.value === value,
              onSelect: () => {
                onValueChange(child.props.value);
                onClose();
              },
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}

export function SelectItem({
  className,
  children,
  value,
  selected,
  onSelect,
  disabled,
  ...props
}) {
  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        selected && "bg-accent text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={onSelect}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {selected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
}
