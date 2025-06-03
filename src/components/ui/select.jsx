"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "../../lib/utils";

export function Select({ value, onValueChange, children, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Store the selected item's display text
  const [selectedDisplayText, setSelectedDisplayText] = useState("");

  // Find the selected item's display text when value changes
  useEffect(() => {
    if (value) {
      // Find the SelectItem with the matching value
      React.Children.forEach(children, (child) => {
        if (child.type === SelectContent) {
          React.Children.forEach(child.props.children, (contentChild) => {
            if (
              contentChild.type === SelectItem &&
              contentChild.props.value === value
            ) {
              setSelectedDisplayText(contentChild.props.children);
            }
          });
        }
      });
    } else {
      setSelectedDisplayText("");
    }
  }, [value, children]);

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
            onClick: (e) => {
              e.preventDefault(); // Prevent form submission
              e.stopPropagation(); // Stop event bubbling
              if (!disabled) setOpen(!open);
            },
            value,
            selectedDisplayText,
            disabled,
          });
        }
        if (child.type === SelectContent) {
          return open
            ? React.cloneElement(child, {
                value,
                onValueChange: (newValue, displayText) => {
                  onValueChange(newValue);
                  setSelectedDisplayText(displayText);
                },
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
  selectedDisplayText,
  disabled,
  ...props
}) {
  // Handle click without causing form submission
  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  return (
    <button
      type="button" // Explicitly set type to button to prevent form submission
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {/* Pass the selected display text to SelectValue */}
      {React.Children.map(children, (child) => {
        if (child.type === SelectValue) {
          return React.cloneElement(child, { selectedDisplayText });
        }
        return child;
      })}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder, children, selectedDisplayText }) {
  // Use selectedDisplayText if available, otherwise use children or placeholder
  return <span>{selectedDisplayText || children || placeholder}</span>;
}

export function SelectContent({
  className,
  children,
  value,
  onValueChange,
  onClose,
  maxHeight = 300,
  ...props
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (searchInputRef.current) {
      // Small delay to ensure the dropdown is fully rendered
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 10);
    }
  }, []);

  // Filter children based on search query
  const filteredChildren = React.Children.toArray(children).filter((child) => {
    if (child.type !== SelectItem) return true;

    // Check if the child's text content includes the search query
    const childText = child.props.children?.toString().toLowerCase() || "";
    return childText.includes(searchQuery.toLowerCase());
  });

  // Handle search input to prevent form submission
  const handleSearchChange = (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    setSearchQuery(e.target.value);
  };

  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
        "w-full top-full mt-1",
        className
      )}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
      {...props}
    >
      {/* Search input */}
      <div className="sticky top-0 p-2 bg-popover border-b">
        <div className="flex items-center px-2 py-1 border rounded-md focus-within:ring-1 focus-within:ring-ring">
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="w-full bg-transparent border-none outline-none text-sm"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              // Prevent form submission on Enter key
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          />
        </div>
      </div>

      {/* Options list with scrolling */}
      <div
        className="p-1 overflow-y-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {filteredChildren.length > 0 ? (
          React.Children.map(filteredChildren, (child) => {
            if (child.type === SelectItem) {
              return React.cloneElement(child, {
                selected: child.props.value === value,
                onSelect: (e) => {
                  e.preventDefault(); // Prevent form submission
                  e.stopPropagation(); // Stop event bubbling
                  // Pass both the value and display text
                  onValueChange(child.props.value, child.props.children);
                  onClose();
                },
              });
            }
            return child;
          })
        ) : (
          <div className="py-2 px-2 text-sm text-center text-muted-foreground">
            No results found
          </div>
        )}
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
  // Handle selection without causing form submission
  const handleSelect = (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    if (onSelect) onSelect(e);
  };

  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        selected && "bg-accent text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleSelect}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {selected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
}

// Example usage:
// <Select value={value} onValueChange={setValue}>
//   <SelectTrigger>
//     <SelectValue placeholder="Select an option" />
//   </SelectTrigger>
//   <SelectContent>
//     <SelectItem value="option1">Option 1</SelectItem>
//     <SelectItem value="option2">Option 2</SelectItem>
//   </SelectContent>
// </Select>
