import { Loader2 } from "lucide-react";

export function ChartSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-navy-card border border-navy-line rounded-lg p-4 sm:p-5 flex items-center justify-center text-gray-4 ${className}`}
    >
      <Loader2 className="w-5 h-5 animate-spin mr-2" />
    </div>
  );
}
