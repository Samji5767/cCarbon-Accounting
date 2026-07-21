"use client";

import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center bg-slate-100/80 rounded-[9px] p-[3px] gap-[2px]",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => {
              if (!active) {
                haptics.selectionChanged();
                onChange(opt.value);
              }
            }}
            className={cn(
              "relative flex-1 min-w-[64px] px-4 py-1.5 rounded-[7px] text-[13px] font-medium transition-all duration-200 select-none",
              active
                ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.04)]"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
