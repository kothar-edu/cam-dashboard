"use client"

import React from "react"
import { cn } from "../../lib/utils"

// This is a simplified version of the Tabs component
// In a real app, you would use a library like @radix-ui/react-tabs

const Tabs = ({ defaultValue, value, onValueChange, className, children, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue)

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  const handleValueChange = (newValue) => {
    if (onValueChange) {
      onValueChange(newValue)
    } else {
      setActiveTab(newValue)
    }
  }

  return (
    <div className={cn("data-[state=active]:bg-muted", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (child.type === TabsList || child.type === TabsContent) {
          return React.cloneElement(child, {
            activeTab,
            onValueChange: handleValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

const TabsList = ({ activeTab, onValueChange, className, children, ...props }) => {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className,
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (child.type === TabsTrigger) {
          return React.cloneElement(child, {
            activeTab,
            onValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

const TabsTrigger = ({ activeTab, onValueChange, value, className, children, ...props }) => {
  const isActive = activeTab === value

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      onClick={() => onValueChange(value)}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ activeTab, value, className, children, ...props }) => {
  const isActive = activeTab === value

  if (!isActive) return null

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      data-state={isActive ? "active" : "inactive"}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

