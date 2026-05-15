import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SiteCard from "@/components/SiteCard";
import MetricCard from "@/components/MetricCard";
import { TrendingUp, Globe, RefreshCw, AlertCircle } from "lucide-react";
import Image from "next/image";

interface SiteData {
  siteUrl: string;
  permissionLevel?: string | null;
  totalClicks: number;
  totalImpressions: number;
}

async function fetchSites(accessToken: string): Promise<SiteData[]> {
  try {
    // Server-side: call google lib directly via API route base URL trick
    // We import the server-side google helper directly
    const { getSearchConsoleSites, getSiteMetrics } = await import(
      "@/lib/google"
    );

    const sites = await getSearchConsoleSites(accessToken);

    const sitesWithMetrics = await Promise.all(
      sites.slice(0, 10).map(async (site) => {
        const siteUrl = site.siteUrl || "";
        try {
          const metrics = await getSiteMetrics(accessToken, siteUrl);
          return {
            siteUrl,
            permissionLevel: site.permissionLevel,
            totalClicks: metrics.totalClicks,
            totalImpressions: metrics.totalImpressions,
          };
        } catch {
          return {
            siteUrl,
            permissionLevel: site.permissionLevel,
            totalClicks: 0,
            totalImpressions: 0,
          };
        }
      })
    );

    return sitesWithMetrics;
  } catch (error) {
    console.error("Failed to fetch sites:", error);
    return [];
  }
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const sites = session.accessToken
    ? await fetchSites(session.accessToken)
    : [];

  const totalClicks = sites.reduce((sum, s) => sum + s.totalClicks, 0);
  const totalImpressions = sites.reduce((sum, s) => sum + s.totalImpressions, 0);

  function formatNumber(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toString();
  }

  return (
    <div className="flex min-h-screen bg-navy-950">
      <Sidebar />

      <main className="flex-1 lg:ml-0 min-w-0">
        {/* Page header */}
        <div className="px-6 py-6 border-b border-navy-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Search Console overview for last 28 days
            </p>
          </div>
          {session.user?.image && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-white font-medium">
                  {session.user.name}
                </p>
                <p className="text-xs text-slate-500">{session.user.email}</p>
              </div>
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={36}
                height={36}
                className="rounded-full ring-2 ring-navy-700"
              />
            </div>
          )}
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Total Clicks (28d)"
              value={formatNumber(totalClicks)}
              sub="Across all properties"
              accent
            />
            <MetricCard
              label="Total Impressions (28d)"
              value={formatNumber(totalImpressions)}
              sub="Across all properties"
            />
            <MetricCard
              label="Properties"
              value={sites.length}
              sub="Connected to Search Console"
            />
          </div>

          {/* Sites */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" />
                Your Properties
              </h2>
            </div>

            {sites.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {sites.map((site) => (
                  <SiteCard key={site.siteUrl} {...site} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-navy-800 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">
        No properties found
      </h3>
      <p className="text-slate-400 text-sm max-w-sm">
        No Google Search Console properties were found for your account. Make
        sure you have at least one verified property in Search Console and have
        granted the necessary permissions.
      </p>
      <a
        href="https://search.google.com/search-console"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 rounded-lg text-sm font-medium transition-colors"
      >
        <TrendingUp className="w-4 h-4" />
        Open Search Console
      </a>
    </div>
  );
}
