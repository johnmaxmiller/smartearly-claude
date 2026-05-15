import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SiteCard from "@/components/SiteCard";
import { Globe, ExternalLink, AlertCircle } from "lucide-react";

interface SiteData {
  siteUrl: string;
  permissionLevel?: string | null;
  totalClicks: number;
  totalImpressions: number;
}

async function fetchAllSites(accessToken: string): Promise<SiteData[]> {
  try {
    const { getSearchConsoleSites, getSiteMetrics } = await import(
      "@/lib/google"
    );

    const sites = await getSearchConsoleSites(accessToken);

    const sitesWithMetrics = await Promise.all(
      sites.map(async (site) => {
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

export default async function SitesPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const sites = session.accessToken
    ? await fetchAllSites(session.accessToken)
    : [];

  return (
    <div className="flex min-h-screen bg-navy-950">
      <Sidebar />

      <main className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="px-6 py-6 border-b border-navy-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Globe className="w-6 h-6 text-accent" />
              All Sites
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              All Google Search Console properties ({sites.length} total)
            </p>
          </div>
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-700 border border-navy-600 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Search Console
          </a>
        </div>

        <div className="px-6 py-6">
          {sites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-navy-800 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                No properties found
              </h3>
              <p className="text-slate-400 text-sm max-w-sm">
                No Google Search Console properties were found. Add and verify a
                property in Search Console to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {sites.map((site) => (
                <SiteCard key={site.siteUrl} {...site} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
