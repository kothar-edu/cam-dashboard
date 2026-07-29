'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

const DROPDOWN_Z_INDEX = 200;
const VIEWPORT_PADDING = 8;
const GAP = 4;
const DEFAULT_MAX_LIST_HEIGHT = 320;

/**
 * Position the menu in the larger available space (below or above the trigger)
 * and clamp height so the full panel — including search — stays on-screen and scrollable.
 */
function computeDropdownPosition(triggerRect) {
  const preferredWidth = Math.max(triggerRect.width, 160);
  const maxWidth = Math.min(preferredWidth, window.innerWidth - VIEWPORT_PADDING * 2);
  let left = triggerRect.left;
  if (left + maxWidth > window.innerWidth - VIEWPORT_PADDING) {
    left = Math.max(VIEWPORT_PADDING, window.innerWidth - VIEWPORT_PADDING - maxWidth);
  }
  if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;

  const spaceBelow = window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING - GAP;
  const spaceAbove = triggerRect.top - VIEWPORT_PADDING - GAP;
  const placeAbove = spaceBelow < 180 && spaceAbove > spaceBelow;
  const available = Math.max(120, placeAbove ? spaceAbove : spaceBelow);
  const panelMaxHeight = Math.min(DEFAULT_MAX_LIST_HEIGHT + 72, available);

  if (placeAbove) {
    return {
      top: Math.max(VIEWPORT_PADDING, triggerRect.top - GAP - panelMaxHeight),
      left,
      width: maxWidth,
      maxHeight: panelMaxHeight,
      placement: 'top',
    };
  }

  return {
    top: triggerRect.bottom + GAP,
    left,
    width: maxWidth,
    maxHeight: panelMaxHeight,
    placement: 'bottom',
  };
}

export function Select({ value, onValueChange, children, disabled }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);
  const [selectedDisplayText, setSelectedDisplayText] = useState('');
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: DEFAULT_MAX_LIST_HEIGHT,
    placement: 'bottom',
  });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    setPosition(computeDropdownPosition(triggerRef.current.getBoundingClientRect()));
  }, []);

  useEffect(() => {
    if (value) {
      React.Children.forEach(children, (child) => {
        if (child?.type === SelectContent) {
          React.Children.forEach(child.props.children, (contentChild) => {
            if (contentChild?.type === SelectItem && contentChild.props.value === value) {
              setSelectedDisplayText(contentChild.props.children);
            }
          });
        }
      });
    } else {
      setSelectedDisplayText('');
    }
  }, [value, children]);

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleClickOutside = (event) => {
      const target = event.target;
      if (containerRef.current?.contains(target) || contentRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  return (
    <div ref={containerRef} className="relative">
      {React.Children.map(children, (child) => {
        if (child?.type === SelectTrigger) {
          return React.cloneElement(child, {
            ref: triggerRef,
            onClick: (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!disabled) {
                if (!open) updatePosition();
                setOpen(!open);
              }
            },
            value,
            selectedDisplayText,
            disabled,
            'aria-expanded': open,
          });
        }
        if (child?.type === SelectContent) {
          return open
            ? createPortal(
                React.cloneElement(child, {
                  ref: contentRef,
                  value,
                  position,
                  onValueChange: (newValue, displayText) => {
                    onValueChange(newValue);
                    setSelectedDisplayText(displayText);
                  },
                  onClose: () => setOpen(false),
                }),
                document.body
              )
            : null;
        }
        return child;
      })}
    </div>
  );
}

export const SelectTrigger = React.forwardRef(function SelectTrigger(
  { className, children, onClick, value, selectedDisplayText, disabled, ...props },
  ref
) {
  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base text-[#12233D] ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#E8A93B] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (child?.type === SelectValue) {
          return React.cloneElement(child, { selectedDisplayText });
        }
        return child;
      })}
      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
    </button>
  );
});

export function SelectValue({ placeholder, children, selectedDisplayText }) {
  return (
    <span className="truncate text-left">{selectedDisplayText || children || placeholder}</span>
  );
}

export const SelectContent = React.forwardRef(function SelectContent(
  {
    className,
    children,
    value,
    onValueChange,
    onClose,
    position,
    maxHeight = DEFAULT_MAX_LIST_HEIGHT,
    searchable = true,
    ...props
  },
  ref
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  const items = React.Children.toArray(children).filter((child) => child?.type === SelectItem);

  const filteredItems = items.filter((child) => {
    const childText = child.props.children?.toString().toLowerCase() || '';
    return childText.includes(searchQuery.toLowerCase());
  });

  const panelMaxHeight = position?.maxHeight ?? maxHeight;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchable) return;
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);
    return () => clearTimeout(timer);
  }, [searchable]);

  useEffect(() => {
    const highlighted = listRef.current?.querySelector('[data-highlighted="true"]');
    if (highlighted && typeof highlighted.scrollIntoView === 'function') {
      highlighted.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSearchChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchQuery(e.target.value);
  };

  const selectItem = (child) => {
    onValueChange(child.props.value, child.props.children);
    onClose();
  };

  const handleListKeyDown = (e) => {
    if (filteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filteredItems[highlightedIndex];
      if (item) selectItem(item);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      ref={ref}
      role="listbox"
      data-select-portal="true"
      className={cn(
        'flex flex-col overflow-hidden rounded-md border border-border bg-white text-[#12233D] shadow-lg animate-in fade-in-80',
        className
      )}
      style={{
        position: 'fixed',
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        width: position?.width ?? undefined,
        minWidth: position?.width ?? undefined,
        maxWidth: 'calc(100vw - 1rem)',
        maxHeight: panelMaxHeight,
        zIndex: DROPDOWN_Z_INDEX,
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleListKeyDown}
      {...props}
    >
      {searchable ? (
        <div className="shrink-0 border-b bg-white p-2">
          <div className="flex items-center rounded-md border px-3 py-2 focus-within:ring-1 focus-within:ring-[#E8A93B]">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const item = filteredItems[highlightedIndex];
                  if (item) selectItem(item);
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  handleListKeyDown(e);
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  onClose();
                }
              }}
              placeholder="Search..."
              className="w-full border-none bg-transparent text-base outline-none ring-0 focus:ring-0 placeholder:text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      ) : null}

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1">
        {filteredItems.length > 0 ? (
          filteredItems.map((child, index) =>
            React.cloneElement(child, {
              key: child.props.value,
              selected: child.props.value === value,
              highlighted: index === highlightedIndex,
              onSelect: (e) => {
                e.preventDefault();
                e.stopPropagation();
                selectItem(child);
              },
              onMouseEnter: () => setHighlightedIndex(index),
            })
          )
        ) : (
          <div className="px-3 py-3 text-center text-base text-muted-foreground">
            No results found
          </div>
        )}
      </div>
    </div>
  );
});

export function SelectItem({
  className,
  children,
  value,
  selected,
  highlighted,
  onSelect,
  disabled,
  onMouseEnter,
  ...props
}) {
  const handleSelect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && onSelect) onSelect(e);
  };

  return (
    <div
      role="option"
      aria-selected={selected}
      data-highlighted={highlighted ? 'true' : undefined}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2.5 pl-9 pr-3 text-base text-[#12233D] outline-none hover:bg-[#12233D]/5 focus:bg-[#12233D]/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        selected && 'bg-[#12233D]/10 font-medium',
        highlighted && !selected && 'bg-[#12233D]/5',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      onClick={handleSelect}
      onMouseEnter={onMouseEnter}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {selected ? <Check className="h-4 w-4 text-[#12233D]" /> : null}
      </span>
      {children}
    </div>
  );
}
