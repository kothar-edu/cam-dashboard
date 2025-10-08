"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

// This is a simplified version of the Sheet component
export function Sheet({ children, open, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(open || false);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (value) => {
    setIsOpen(value);
    if (onOpenChange) {
      onOpenChange(value);
    }
  };

  return (
    <>
      {React.Children.map(children, (child) => {
        if (child.type === SheetTrigger) {
          return React.cloneElement(child, {
            onClick: () => handleOpenChange(true),
          });
        }
        if (child.type === SheetContent) {
          return isOpen
            ? React.cloneElement(child, {
                onClose: () => handleOpenChange(false),
              })
            : null;
        }
        return child;
      })}
    </>
  );
}

export function SheetTrigger({ children, onClick, asChild }) {
  if (asChild) {
    return React.cloneElement(children, {
      onClick: (e) => {
        onClick();
        if (children.props.onClick) {
          children.props.onClick(e);
        }
      },
    });
  }
  return <div onClick={onClick}>{children}</div>;
}

export function SheetContent({
  children,
  className,
  side = "right",
  onClose,
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm">
      <div
        ref={ref}
        className={cn(
          "fixed inset-y-0 z-[9999] flex flex-col bg-background p-6 shadow-lg",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          className
        )}
        {...props}
      >
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <div className="flex flex-col space-y-4 h-full">{children}</div>
      </div>
    </div>
  );
}

export function SheetHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

export function SheetTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function SheetDescription({ className, ...props }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function SheetFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  );
}

export function SheetClose({ className, ...props }) {
  return (
    <button
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}
