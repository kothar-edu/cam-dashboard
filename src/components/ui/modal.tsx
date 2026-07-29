import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  // Radix's Dialog focus trap fights our Select's portaled dropdown (see
  // isInsideSelectPortal below): it steals focus back from the dropdown's
  // search input and can eat real pointer clicks meant for the dropdown.
  // Set this on any Modal that renders a SearchableSelect/Select in its body.
  disableFocusTrap?: boolean;
};

// Our custom Select/SearchableSelect dropdown portals its content straight to
// document.body (see components/ui/select.jsx) so it can be positioned with
// viewport-relative `position: fixed`. That portal sits outside this dialog's
// DOM subtree, so Radix's outside-interaction detection sees clicks inside the
// dropdown as "outside the dialog" and auto-dismisses it. Ignoring interactions
// that target `[data-select-portal]` stops that false dismissal.
function isInsideSelectPortal(target: EventTarget | null) {
  return target instanceof Element && target.closest('[data-select-portal]') !== null;
}

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  className,
  disableFocusTrap,
}: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} modal={!disableFocusTrap}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Content
          onPointerDownOutside={(event) => {
            if (isInsideSelectPortal(event.target)) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (isInsideSelectPortal(event.target)) event.preventDefault();
          }}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[min(90dvh,40rem)] w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-4 shadow-xl sm:p-6',
            className
          )}
        >
          <DialogPrimitive.Title className="text-lg font-semibold text-[#12233D]">
            {title}
          </DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
