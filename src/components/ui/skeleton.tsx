import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-lg", className)}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.06)] p-5 space-y-3">
      <Skeleton className="h-3 w-24 rounded-full" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20 rounded-full" />
      <Skeleton className="h-3 w-28 rounded-full" />
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-2xl skeleton-shimmer h-[100px]" />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="px-0 pt-2 pb-1 space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3 w-60 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
