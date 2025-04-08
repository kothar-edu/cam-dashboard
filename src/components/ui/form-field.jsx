import { Input } from "./input"
import { Label } from "./label"
import { cn } from "../../lib/utils"

export function FormField({ label, name, description, error, className, ...props }) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={name}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </Label>
      <Input id={name} name={name} className={cn(error && "border-destructive", className)} {...props} />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

