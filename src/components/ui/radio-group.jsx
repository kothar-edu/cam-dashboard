"use client"

import React from "react"
import { cn } from "../../lib/utils"

// This is a simplified version of the RadioGroup component
// In a real app, you would use a library like @radix-ui/react-radio-group

export function RadioGroup({ value, onValueChange, className, children, ...props }) {
  const handleChange = (newValue) => {
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (child.type === RadioGroupItem) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => handleChange(child.props.value),
          })
        }
        return child
      })}
    </div>
  )
}

export function RadioGroupItem({ className, id, value, checked, onChange, ...props }) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={id}
        value={value}
        checked={checked}
        onChange={onChange}
        className={cn(
          "h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  )
}

