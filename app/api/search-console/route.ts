import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSearchConsoleSites, getSiteMetrics } from "@/lib/google";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const siteUrl = searchParams.get("siteUrl");

  try {
    if (siteUrl) {
      // Get metrics for a specific site
      const metrics = await getSiteMetrics(session.accessToken, siteUrl);
      return NextResponse.json(metrics);
    } else {
      // Get all sites
      const sites = await getSearchConsoleSites(session.accessToken);

      // Fetch summary metrics for each site (limited to first 5 to avoid rate limits)
      const sitesWithMetrics = await Promise.all(
        sites.slice(0, 5).map(async (site) => {
          const siteUrl = site.siteUrl || "";
          try {
            const metrics = await getSiteMetrics(session.accessToken!, siteUrl);
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

      return NextResponse.json({ sites: sitesWithMetrics });
    }
  } catch (error) {
    console.error("Search Console API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Search Console data" },
      { status: 500 }
    );
  }
}
