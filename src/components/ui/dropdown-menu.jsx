"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

export function DropdownMenu({ children }) {
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
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, {
            onClick: () => setOpen(!open),
          });
        }
        if (child.type === DropdownMenuContent) {
          return open ? child : null;
        }
        return child;
      })}
    </div>
  );
}

export function DropdownMenuTrigger({ asChild, children, onClick }) {
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

export function DropdownMenuContent({
  className,
  align = "center",
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        "absolute z-[60] min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ className, ...props }) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    />
  );
}

export function DropdownMenuItem({ className, onClick, ...props }) {
  return (
    <button
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={onClick}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }) {
  return (
    <div className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
  );
}

export function DropdownMenuGroup({ className, ...props }) {
  return <div className={cn("", className)} {...props} />;
}
