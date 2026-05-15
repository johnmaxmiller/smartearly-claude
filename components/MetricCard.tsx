import clsx from "clsx";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  accent?: boolean;
}

export default function MetricCard({
  label,
  value,
  sub,
  trend,
  accent,
}: MetricCardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl p-5 border transition-colors",
        accent
          ? "bg-accent/10 border-accent/30"
          : "bg-navy-900 border-navy-700 hover:border-navy-600"
      )}
    >
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p
        className={clsx(
          "text-2xl font-bold",
          accent ? "text-accent" : "text-white"
        )}
      >
        {value}
      </p>
      {sub && (
        <p
          className={clsx(
            "text-xs mt-1",
            trend === "up"
              ? "text-accent"
              : trend === "down"
              ? "text-red-400"
              : "text-slate-500"
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
