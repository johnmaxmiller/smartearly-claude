"use client";

import { CheckCircle2, AlertTriangle, XCircle, ExternalLink } from "lucide-react";
import type { SEOReport } from "@/lib/seo-analyzer";
import clsx from "clsx";

interface SEOReportProps {
  report: SEOReport;
}

export default function SEOReportView({ report }: SEOReportProps) {
  const checks = [
    { label: "Title Tag", data: report.title, detail: report.title.value },
    {
      label: "Meta Description",
      data: report.metaDescription,
      detail: report.metaDescription.value,
    },
    {
      label: "H1 Tags",
      data: report.h1Tags,
      detail: report.h1Tags.values.join(", ") || null,
    },
    { label: "Canonical Link", data: report.canonical, detail: report.canonical.value },
    { label: "Robots Meta", data: report.robotsMeta, detail: report.robotsMeta.value },
    { label: "OG Title", data: report.ogTitle, detail: report.ogTitle.value },
    {
      label: "OG Description",
      data: report.ogDescription,
      detail: report.ogDescription.value,
    },
    {
      label: "Page Speed",
      data: report.pageSpeed,
      detail: `${report.pageSpeed.responseTimeMs}ms response time`,
    },
  ];

  const scoreColor =
    report.score >= 75
      ? "text-accent"
      : report.score >= 50
      ? "text-yellow-400"
      : "text-red-400";

  const scoreRing =
    report.score >= 75
      ? "stroke-accent"
      : report.score >= 50
      ? "stroke-yellow-400"
      : "stroke-red-400";

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (report.score / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Score header */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Score ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#1e2a4a"
              strokeWidth="8"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={scoreRing}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={clsx("text-2xl font-bold", scoreColor)}>
              {report.score}
            </span>
          </div>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-white text-xl font-bold mb-1">SEO Score</h3>
          <p className="text-slate-400 text-sm">
            Analyzed:{" "}
            <a
              href={report.url.startsWith("http") ? report.url : `https://${report.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline inline-flex items-center gap-1"
            >
              {report.url}
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {new Date(report.fetchedAt).toLocaleString()}
          </p>
        </div>

        {/* Pass/warn/fail summary */}
        <div className="sm:ml-auto flex gap-4 text-sm">
          <Pill
            count={checks.filter((c) => c.data.status === "good").length}
            type="good"
          />
          <Pill
            count={checks.filter((c) => c.data.status === "warning").length}
            type="warning"
          />
          <Pill
            count={checks.filter((c) => c.data.status === "error").length}
            type="error"
          />
        </div>
      </div>

      {/* Checks */}
      <div className="space-y-3">
        {checks.map(({ label, data, detail }) => (
          <CheckRow key={label} label={label} data={data} detail={detail} />
        ))}
      </div>
    </div>
  );
}

function Pill({
  count,
  type,
}: {
  count: number;
  type: "good" | "warning" | "error";
}) {
  const colors = {
    good: "bg-accent/10 text-accent border-accent/20",
    warning: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    error: "bg-red-400/10 text-red-400 border-red-400/20",
  };
  const labels = { good: "Passed", warning: "Warnings", error: "Errors" };
  return (
    <div
      className={clsx(
        "flex flex-col items-center px-3 py-1.5 rounded-lg border",
        colors[type]
      )}
    >
      <span className="text-lg font-bold">{count}</span>
      <span className="text-xs">{labels[type]}</span>
    </div>
  );
}

function CheckRow({
  label,
  data,
  detail,
}: {
  label: string;
  data: { status: "good" | "warning" | "error"; message: string };
  detail?: string | null;
}) {
  const icons = {
    good: <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
  };

  const rowColors = {
    good: "border-navy-700",
    warning: "border-yellow-400/20",
    error: "border-red-400/20",
  };

  return (
    <div
      className={clsx(
        "bg-navy-900 border rounded-xl p-4 flex items-start gap-3",
        rowColors[data.status]
      )}
    >
      {icons[data.status]}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-white font-medium text-sm">{label}</span>
        </div>
        <p className="text-slate-400 text-sm">{data.message}</p>
        {detail && (
          <p className="text-slate-500 text-xs mt-1 truncate">
            <span className="text-slate-600">Value: </span>
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
