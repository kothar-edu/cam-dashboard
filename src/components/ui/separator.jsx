import { cn } from "../../lib/utils"

// This is a simplified version of the Separator component
// In a real app, you would use a library like @radix-ui/react-separator

export function Separator({ className, orientation = "horizontal", ...props }) {
  return (
    <div
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
      {...props}
    />
  )
}

