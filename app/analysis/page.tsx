"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SEOReportView from "@/components/SEOReport";
import MetricCard from "@/components/MetricCard";
import {
  Search,
  Loader2,
  Globe,
  TrendingUp,
  ArrowUpDown,
  FileText,
} from "lucide-react";
import type { SEOReport } from "@/lib/seo-analyzer";

interface QueryRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

interface SearchConsoleData {
  queries: QueryRow[];
  pages: QueryRow[];
  totalClicks: number;
  totalImpressions: number;
}

function AnalysisContent() {
  const searchParams = useSearchParams();
  const initialSite = searchParams.get("site") || "";

  const [siteUrl, setSiteUrl] = useState(initialSite);
  const [analyzeUrl, setAnalyzeUrl] = useState(
    initialSite ? (initialSite.startsWith("sc-domain:") ? `https://${initialSite.replace("sc-domain:", "")}` : initialSite) : ""
  );
  const [activeTab, setActiveTab] = useState<"keywords" | "pages" | "seo">(
    "keywords"
  );
  const [scData, setScData] = useState<SearchConsoleData | null>(null);
  const [seoReport, setSeoReport] = useState<SEOReport | null>(null);
  const [loadingSC, setLoadingSC] = useState(false);
  const [loadingSEO, setLoadingSEO] = useState(false);
  const [scError, setSCError] = useState<string | null>(null);
  const [seoError, setSEOError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(analyzeUrl);

  useEffect(() => {
    if (initialSite) {
      loadSearchConsole(initialSite);
    }
  }, [initialSite]);

  async function loadSearchConsole(site: string) {
    setLoadingSC(true);
    setSCError(null);
    try {
      const res = await fetch(
        `/api/search-console?siteUrl=${encodeURIComponent(site)}`
      );
      if (!res.ok) throw new Error("Failed to fetch Search Console data");
      const data = await res.json();
      setScData(data);
    } catch (err) {
      setSCError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingSC(false);
    }
  }

  async function runSEOAnalysis(url: string) {
    if (!url) return;
    setLoadingSEO(true);
    setSEOError(null);
    setSeoReport(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Failed to analyze URL");
      const data = await res.json();
      setSeoReport(data);
    } catch (err) {
      setSEOError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingSEO(false);
    }
  }

  function handleSiteSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!siteUrl.trim()) return;
    loadSearchConsole(siteUrl.trim());
  }

  function handleSEOAnalysis(e: React.FormEvent) {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setAnalyzeUrl(urlInput.trim());
    runSEOAnalysis(urlInput.trim());
  }

  const avgCTR = scData?.queries.length
    ? (
        (scData.queries.reduce((sum, r) => sum + (r.ctr || 0), 0) /
          scData.queries.length) *
        100
      ).toFixed(2)
    : "—";

  const avgPos = scData?.queries.length
    ? (
        scData.queries.reduce((sum, r) => sum + (r.position || 0), 0) /
        scData.queries.length
      ).toFixed(1)
    : "—";

  return (
    <div className="flex min-h-screen bg-navy-950">
      <Sidebar />

      <main className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="px-6 py-6 border-b border-navy-800">
          <h1 className="text-2xl font-bold text-white mb-0.5">SEO Analysis</h1>
          <p className="text-slate-400 text-sm">
            Search Console data + technical SEO audit
          </p>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Site picker */}
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              Search Console Data
            </h2>
            <form onSubmit={handleSiteSearch} className="flex gap-3">
              <input
                type="text"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="Enter site URL (e.g. https://example.com or sc-domain:example.com)"
                className="flex-1 bg-navy-800 border border-navy-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                disabled={loadingSC}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors"
              >
                {loadingSC ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Load
              </button>
            </form>
          </div>

          {/* SC Metrics */}
          {scData && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricCard
                  label="Total Clicks"
                  value={scData.totalClicks.toLocaleString()}
                  sub="Last 28 days"
                  accent
                />
                <MetricCard
                  label="Impressions"
                  value={scData.totalImpressions.toLocaleString()}
                  sub="Last 28 days"
                />
                <MetricCard label="Avg. CTR" value={`${avgCTR}%`} />
                <MetricCard label="Avg. Position" value={avgPos} />
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-navy-900 border border-navy-700 rounded-xl p-1 w-fit">
                {(["keywords", "pages", "seo"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? "bg-accent text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab === "seo" ? "Technical SEO" : tab === "keywords" ? "Keywords" : "Top Pages"}
                  </button>
                ))}
              </div>

              {activeTab === "keywords" && (
                <KeywordsTable rows={scData.queries} />
              )}
              {activeTab === "pages" && <PagesTable rows={scData.pages} />}
              {activeTab === "seo" && (
                <SEOAuditTab
                  urlInput={urlInput}
                  setUrlInput={setUrlInput}
                  handleSEOAnalysis={handleSEOAnalysis}
                  loadingSEO={loadingSEO}
                  seoReport={seoReport}
                  seoError={seoError}
                />
              )}
            </>
          )}

          {scError && (
            <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {scError}
            </div>
          )}

          {/* Standalone SEO audit if no SC data */}
          {!scData && (
            <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                Technical SEO Audit
              </h2>
              <SEOAuditTab
                urlInput={urlInput}
                setUrlInput={setUrlInput}
                handleSEOAnalysis={handleSEOAnalysis}
                loadingSEO={loadingSEO}
                seoReport={seoReport}
                seoError={seoError}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function KeywordsTable({ rows }: { rows: QueryRow[] }) {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-navy-700 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-accent" />
        <h3 className="text-white font-semibold">Top Keywords</h3>
        <span className="ml-auto text-xs text-slate-500">Last 28 days</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-700">
              <th className="text-left px-5 py-3 text-slate-400 font-medium">
                Query
              </th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">
                <span className="flex items-center justify-end gap-1">
                  <ArrowUpDown className="w-3 h-3" /> Position
                </span>
              </th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">
                Clicks
              </th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">
                Impressions
              </th>
              <th className="text-right px-5 py-3 text-slate-400 font-medium">
                CTR
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-navy-800 hover:bg-navy-800/50 transition-colors"
              >
                <td className="px-5 py-3 text-white font-medium">
                  {row.keys?.[0] || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <PositionBadge pos={row.position} />
                </td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {row.clicks?.toLocaleString() || 0}
                </td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {row.impressions?.toLocaleString() || 0}
                </td>
                <td className="px-5 py-3 text-right text-slate-300">
                  {row.ctr ? (row.ctr * 100).toFixed(1) + "%" : "0%"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            No keyword data available.
          </p>
        )}
      </div>
    </div>
  );
}

function PositionBadge({ pos }: { pos?: number }) {
  if (!pos) return <span className="text-slate-500">—</span>;
  const color =
    pos <= 3
      ? "text-accent"
      : pos <= 10
      ? "text-yellow-400"
      : "text-slate-400";
  return <span className={`font-medium ${color}`}>{pos.toFixed(1)}</span>;
}

function PagesTable({ rows }: { rows: QueryRow[] }) {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-navy-700 flex items-center gap-2">
        <FileText className="w-4 h-4 text-accent" />
        <h3 className="text-white font-semibold">Top Pages</h3>
        <span className="ml-auto text-xs text-slate-500">Last 28 days</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-700">
              <th className="text-left px-5 py-3 text-slate-400 font-medium">
                Page
              </th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">
                Clicks
              </th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">
                Impressions
              </th>
              <th className="text-right px-5 py-3 text-slate-400 font-medium">
                CTR
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-navy-800 hover:bg-navy-800/50 transition-colors"
              >
                <td className="px-5 py-3 text-white max-w-xs">
                  <a
                    href={row.keys?.[0] || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors truncate block"
                  >
                    {row.keys?.[0]
                      ? new URL(row.keys[0]).pathname || "/"
                      : "—"}
                  </a>
                </td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {row.clicks?.toLocaleString() || 0}
                </td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {row.impressions?.toLocaleString() || 0}
                </td>
                <td className="px-5 py-3 text-right text-slate-300">
                  {row.ctr ? (row.ctr * 100).toFixed(1) + "%" : "0%"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            No page data available.
          </p>
        )}
      </div>
    </div>
  );
}

function SEOAuditTab({
  urlInput,
  setUrlInput,
  handleSEOAnalysis,
  loadingSEO,
  seoReport,
  seoError,
}: {
  urlInput: string;
  setUrlInput: (v: string) => void;
  handleSEOAnalysis: (e: React.FormEvent) => void;
  loadingSEO: boolean;
  seoReport: SEOReport | null;
  seoError: string | null;
}) {
  return (
    <div className="space-y-4">
      <form onSubmit={handleSEOAnalysis} className="flex gap-3">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Enter URL to audit (e.g. https://example.com/page)"
          className="flex-1 bg-navy-800 border border-navy-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={loadingSEO || !urlInput.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors whitespace-nowrap"
        >
          {loadingSEO ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Run Audit
            </>
          )}
        </button>
      </form>

      {seoError && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {seoError}
        </div>
      )}

      {seoReport && <SEOReportView report={seoReport} />}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-navy-950">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
