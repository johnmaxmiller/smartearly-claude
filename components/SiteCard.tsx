import Link from "next/link";
import { Globe, ExternalLink } from "lucide-react";

interface SiteCardProps {
  siteUrl: string;
  permissionLevel?: string | null;
  totalClicks: number;
  totalImpressions: number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function getDomain(siteUrl: string): string {
  try {
    const url = new URL(siteUrl);
    return url.hostname;
  } catch {
    return siteUrl.replace(/^sc-domain:/, "");
  }
}

export default function SiteCard({
  siteUrl,
  permissionLevel,
  totalClicks,
  totalImpressions,
}: SiteCardProps) {
  const domain = getDomain(siteUrl);
  const analysisUrl = `/analysis?site=${encodeURIComponent(siteUrl)}`;

  return (
    <div className="bg-navy-900 border border-navy-700 hover:border-accent/40 rounded-2xl p-5 transition-all group">
      {/* Domain */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-navy-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
            <Globe className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium truncate text-sm">{domain}</p>
            {permissionLevel && (
              <p className="text-slate-500 text-xs capitalize truncate">
                {permissionLevel.replace(/_/g, " ")}
              </p>
            )}
          </div>
        </div>
        <a
          href={siteUrl.startsWith("sc-domain:") ? `https://${domain}` : siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0 ml-2"
          aria-label="Open site"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-navy-800 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-1">Clicks (28d)</p>
          <p className="text-white font-bold text-lg">
            {formatNumber(totalClicks)}
          </p>
        </div>
        <div className="bg-navy-800 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-1">Impressions (28d)</p>
          <p className="text-white font-bold text-lg">
            {formatNumber(totalImpressions)}
          </p>
        </div>
      </div>

      {/* Action */}
      <Link
        href={analysisUrl}
        className="block w-full text-center text-sm font-medium py-2 px-4 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white transition-colors"
      >
        Analyze site
      </Link>
    </div>
  );
}
