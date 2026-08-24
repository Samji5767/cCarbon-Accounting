import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "border-emerald-200 bg-emerald-50 text-emerald-800",
        secondary:   "border-slate-200  bg-slate-50   text-slate-700",
        destructive: "border-rose-200   bg-rose-50    text-rose-800",
        warning:     "border-amber-200  bg-amber-50   text-amber-800",
        outline:     "border-slate-200  text-slate-700 bg-transparent",
        info:        "border-sky-200    bg-sky-50     text-sky-800",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
