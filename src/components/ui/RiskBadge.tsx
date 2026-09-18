import type { RiskLevel } from "@/lib/types";

const RISK_CONFIG: Record<RiskLevel, { label: string; icon: string; className: string }> = {
  low: { label: "LOW RISK", icon: "✓", className: "text-[#23A26D] border-[#23A26D] bg-[#23A26D]/10" },
  medium: { label: "MEDIUM RISK", icon: "!", className: "text-[#F08A24] border-[#F08A24] bg-[#F08A24]/10" },
  high: { label: "HIGH RISK", icon: "!!", className: "text-[#E23B2E] border-[#E23B2E] bg-[#E23B2E]/10" },
  unusual: { label: "UNUSUAL", icon: "?", className: "text-[#2340E8] border-[#2340E8] bg-[#2340E8]/10" },
};

interface RiskBadgeProps {
  risk: RiskLevel;
  size?: "sm" | "md";
  className?: string;
}

export function RiskBadge({ risk, size = "md", className = "" }: RiskBadgeProps) {
  const config = RISK_CONFIG[risk];
  const sizeClass = size === "sm" ? "text-[0.55rem] px-1.5 py-0.5" : "text-[0.65rem] px-2 py-1";
  return (
    <span role="img" aria-label={`Risk level: ${config.label}`}
      className={`inline-flex items-center gap-1 border rounded-sm font-mono font-bold tracking-wider uppercase ${sizeClass} ${config.className} ${className}`}>
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}
