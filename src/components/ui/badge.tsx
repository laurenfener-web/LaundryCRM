import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border px-2 py-0.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[#f5c518] text-[#0d1b2a] border-[#f5c518]",
        secondary: "bg-[#1a3a6e] text-white border-[#1a3a6e]",
        destructive: "bg-red-100 text-red-700 border-red-200",
        outline: "border-[#1a3a6e] text-[#1a3a6e] bg-transparent",
        ghost: "bg-gray-100 text-gray-600 border-gray-200",
        link: "text-[#1a3a6e] underline-offset-4 hover:underline border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
