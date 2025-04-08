"use client"
import { cn } from "../../lib/utils"
import { Check } from "lucide-react"

export function Checkbox({ className, checked, onCheckedChange, id, ...props }) {
  return (
    <div className="flex items-center space-x-2">
      <div
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked && "bg-primary text-primary-foreground",
          className,
        )}
        onClick={() => onCheckedChange && onCheckedChange(!checked)}
        {...props}
      >
        {checked && <Check className="h-4 w-4" />}
      </div>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
        className="sr-only"
      />
    </div>
  )
}

