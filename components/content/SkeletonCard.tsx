import Skeleton from "@/components/ui/Skeleton";

export default function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border bg-surface">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
