"use client"

import React, { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

// This is a simplified version of the Dialog component
// In a real app, you would use a library like @radix-ui/react-dialog

export function Dialog({ children, open, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(open || false)

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (value) => {
    setIsOpen(value)
    if (onOpenChange) {
      onOpenChange(value)
    }
  }

  return (
    <>
      {React.Children.map(children, (child) => {
        if (child.type === DialogTrigger) {
          return React.cloneElement(child, {
            onClick: () => handleOpenChange(true),
          })
        }
        if (child.type === DialogContent) {
          return isOpen
            ? React.cloneElement(child, {
                onClose: () => handleOpenChange(false),
              })
            : null
        }
        return child
      })}
    </>
  )
}

export function DialogTrigger({ children, onClick, asChild }) {
  if (asChild) {
    return React.cloneElement(children, {
      onClick: (e) => {
        onClick()
        if (children.props.onClick) {
          children.props.onClick(e)
        }
      },
    })
  }
  return <div onClick={onClick}>{children}</div>
}

export function DialogContent({ children, className, onClose, ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div
        ref={ref}
        className={cn(
          "fixed z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg md:w-full",
          className,
        )}
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
}

export function DialogTitle({ className, ...props }) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
}

