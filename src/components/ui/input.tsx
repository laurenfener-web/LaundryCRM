import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 border-2 border-[#d1d9e6] bg-white px-3 py-1 text-sm font-medium text-[#0d1b2a] transition-colors outline-none placeholder:text-gray-400 focus-visible:border-[#1a3a6e] focus-visible:ring-2 focus-visible:ring-[#1a3a6e]/20 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
