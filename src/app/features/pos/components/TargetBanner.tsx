import { Target } from "lucide-react";
import type { BranchTarget } from "../services/targetService";

interface TargetBannerProps {
  target: BranchTarget | null;
  loading: boolean;
  error: string;
}

export function TargetBanner({ target, loading, error }: TargetBannerProps) {
  if (error) {
    return (
      <div className="max-w-7xl mx-auto mb-6 rounded-2xl p-4 bg-red-50 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mb-6 rounded-2xl p-4 text-[#628141]/70 bg-[#FFFDF1]">
        Loading branch target...
      </div>
    );
  }

  if (!target) {
    return (
      <div className="max-w-7xl mx-auto mb-6 rounded-2xl p-4 text-[#628141]/70 bg-[#FFFDF1]">
        No revenue target set for this branch. Set one in Admin Settings.
      </div>
    );
  }

  const progress = Math.min(100, target.targetRevenue > 0
    ? Math.round((target.salesThisPeriod / target.targetRevenue) * 100)
    : 0);

  return (
    <div
      className="max-w-7xl mx-auto mb-6 rounded-2xl p-4 flex flex-col gap-2"
      style={{
        background: "#FFFDF1",
        boxShadow:
          "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
      }}
    >
      <div className="flex items-center gap-2 text-[#1B211A] font-semibold">
        <Target size={18} className="text-[#628141]" />
        Branch Target ({target.periodStart} – {target.periodEnd})
      </div>
      <div className="flex justify-between text-sm text-[#628141]">
        <span>Sales this period: ₱{target.salesThisPeriod.toLocaleString()}</span>
        <span>Target: ₱{target.targetRevenue.toLocaleString()}</span>
      </div>
      <div className="w-full h-3 rounded-full bg-[#628141]/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
          }}
        />
      </div>
      <div className="text-xs text-[#628141]/80">{progress}% of target reached</div>
    </div>
  );
}
