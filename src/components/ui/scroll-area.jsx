"use client"

import { useRef } from "react"
import { cn } from "../../lib/utils"

export function ScrollArea({ className, children, ...props }) {
  const viewportRef = useRef(null)

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      <div className="h-full w-full overflow-auto" ref={viewportRef}>
        {children}
      </div>
    </div>
  )
}

