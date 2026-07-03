import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  loading?: boolean;
  variant?: "blue" | "green" | "yellow";
}

const variantClasses = {
  blue: "from-blue/20 to-blue-2/10 text-blue-soft shadow-blue/10",
  green: "from-green/20 to-green-2/10 text-green shadow-green/10",
  yellow: "from-yellow/20 to-yellow/10 text-yellow shadow-yellow/10",
};

export function KpiCard({ label, value, sub, icon, loading, variant = "blue" }: KpiCardProps) {
  return (
    <div className="group relative rounded-md bg-navy-card border border-navy-line p-4 overflow-hidden transition-all hover:border-blue/40 hover:shadow-lg hover:shadow-blue/5">
      <div className="absolute inset-0 bg-gradient-to-br from-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-4 text-[11px] uppercase tracking-wider font-semibold mb-1.5">
            {label}
          </p>
          {loading ? (
            <div className="flex items-center gap-2 h-8">
              <Loader2 className="w-4 h-4 animate-spin text-gray-5" />
              <span className="text-sm text-gray-5">{label}</span>
            </div>
          ) : (
            <>
              <p className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                {value}
              </p>
              {sub && <p className="text-xs text-gray-3 mt-1.5">{sub}</p>}
            </>
          )}
        </div>
        {icon && !loading && (
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-sm bg-gradient-to-br ${variantClasses[variant]} flex items-center justify-center shadow-inner`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
