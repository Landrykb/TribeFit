import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-elevate text-center break-words",
  {
    variants: {
      variant: {
        default:
          "bg-primary hover:bg-primary-600 text-surface-950 font-semibold shadow-lg hover:shadow-primary/25",
        primary:
          "bg-primary hover:bg-primary-600 text-surface-950 font-semibold shadow-lg hover:shadow-primary/25",
        accent:
          "bg-accent hover:bg-accent-600 text-white shadow-lg hover:shadow-accent/25",
        success:
          "bg-success hover:bg-green-600 text-white shadow-lg hover:shadow-success/25",
        danger:
          "bg-danger hover:bg-red-600 text-white shadow-lg hover:shadow-danger/25",
        destructive:
          "bg-danger hover:bg-red-600 text-white shadow-lg hover:shadow-danger/25",
        outline:
          "border border-surface-600 bg-surface-700/50 hover:bg-surface-600 hover:border-surface-500 text-surface-100 shadow-md",
        secondary:
          "bg-surface-700 hover:bg-surface-600 text-surface-100 shadow-md",
        ghost: "bg-surface-700/50 border border-surface-600 hover:bg-surface-600 hover:border-surface-500 text-surface-100",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || loading}
      {...props}>
      {loading && (
        <svg className="animate-spin -ml-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </Comp>
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
