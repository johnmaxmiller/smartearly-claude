export interface SEOReport {
  url: string;
  fetchedAt: string;
  title: {
    value: string | null;
    length: number;
    status: "good" | "warning" | "error";
    message: string;
  };
  metaDescription: {
    value: string | null;
    length: number;
    status: "good" | "warning" | "error";
    message: string;
  };
  h1Tags: {
    values: string[];
    count: number;
    status: "good" | "warning" | "error";
    message: string;
  };
  canonical: {
    value: string | null;
    status: "good" | "warning" | "error";
    message: string;
  };
  robotsMeta: {
    value: string | null;
    status: "good" | "warning" | "error";
    message: string;
  };
  ogTitle: {
    value: string | null;
    status: "good" | "warning" | "error";
    message: string;
  };
  ogDescription: {
    value: string | null;
    status: "good" | "warning" | "error";
    message: string;
  };
  pageSpeed: {
    responseTimeMs: number;
    status: "good" | "warning" | "error";
    message: string;
  };
  score: number;
}

function evaluateTitle(title: string | null): SEOReport["title"] {
  if (!title) {
    return { value: null, length: 0, status: "error", message: "Missing title tag" };
  }
  const length = title.length;
  if (length < 30) {
    return { value: title, length, status: "warning", message: `Title is too short (${length} chars). Aim for 50–60 characters.` };
  }
  if (length > 70) {
    return { value: title, length, status: "warning", message: `Title is too long (${length} chars). Keep it under 60–70 characters.` };
  }
  return { value: title, length, status: "good", message: `Title length is good (${length} chars).` };
}

function evaluateMetaDescription(desc: string | null): SEOReport["metaDescription"] {
  if (!desc) {
    return { value: null, length: 0, status: "error", message: "Missing meta description" };
  }
  const length = desc.length;
  if (length < 70) {
    return { value: desc, length, status: "warning", message: `Meta description is too short (${length} chars). Aim for 150–160 characters.` };
  }
  if (length > 170) {
    return { value: desc, length, status: "warning", message: `Meta description is too long (${length} chars). Keep it under 160 characters.` };
  }
  return { value: desc, length, status: "good", message: `Meta description length is good (${length} chars).` };
}

function evaluateH1(h1Tags: string[]): SEOReport["h1Tags"] {
  const count = h1Tags.length;
  if (count === 0) {
    return { values: [], count: 0, status: "error", message: "No H1 tag found on the page" };
  }
  if (count > 1) {
    return { values: h1Tags, count, status: "warning", message: `Multiple H1 tags found (${count}). Use only one H1 per page.` };
  }
  return { values: h1Tags, count, status: "good", message: "One H1 tag found — perfect." };
}

function evaluateCanonical(canonical: string | null, pageUrl: string): SEOReport["canonical"] {
  if (!canonical) {
    return { value: null, status: "warning", message: "No canonical link found. Consider adding one." };
  }
  return { value: canonical, status: "good", message: "Canonical tag is present." };
}

function evaluateRobotsMeta(robots: string | null): SEOReport["robotsMeta"] {
  if (!robots) {
    return { value: null, status: "good", message: "No robots meta tag (defaults to index, follow)." };
  }
  const lower = robots.toLowerCase();
  if (lower.includes("noindex") || lower.includes("nofollow")) {
    return { value: robots, status: "error", message: `Page is set to: ${robots}. This may block search engines.` };
  }
  return { value: robots, status: "good", message: `Robots meta: ${robots}` };
}

function evaluateOG(value: string | null, field: string): { value: string | null; status: "good" | "warning" | "error"; message: string } {
  if (!value) {
    return { value: null, status: "warning", message: `Missing ${field} — recommended for social sharing.` };
  }
  return { value, status: "good", message: `${field} is present.` };
}

function evaluatePageSpeed(responseTimeMs: number): SEOReport["pageSpeed"] {
  if (responseTimeMs < 800) {
    return { responseTimeMs, status: "good", message: `Fast response time: ${responseTimeMs}ms` };
  }
  if (responseTimeMs < 2000) {
    return { responseTimeMs, status: "warning", message: `Moderate response time: ${responseTimeMs}ms. Aim for under 800ms.` };
  }
  return { responseTimeMs, status: "error", message: `Slow response time: ${responseTimeMs}ms. This may hurt rankings.` };
}

function calculateScore(report: Omit<SEOReport, "score">): number {
  const checks = [
    report.title.status,
    report.metaDescription.status,
    report.h1Tags.status,
    report.canonical.status,
    report.robotsMeta.status,
    report.ogTitle.status,
    report.ogDescription.status,
    report.pageSpeed.status,
  ];

  const points = checks.reduce((sum, status) => {
    if (status === "good") return sum + 12.5;
    if (status === "warning") return sum + 6.25;
    return sum;
  }, 0);

  return Math.round(points);
}

export async function analyzeSEO(url: string): Promise<SEOReport> {
  const startTime = Date.now();

  let html = "";
  let responseTimeMs = 0;

  try {
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    const response = await fetch(normalizedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TopRankBot/1.0; +https://toprank.app)",
      },
      signal: AbortSignal.timeout(10000),
    });
    responseTimeMs = Date.now() - startTime;
    html = await response.text();
  } catch {
    responseTimeMs = Date.now() - startTime;
  }

  // Parse HTML manually with regex (avoiding cheerio for edge compatibility)
  const getMetaContent = (name: string): string | null => {
    const patterns = [
      new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getMetaProperty = (property: string): string | null => {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const titleValue = titleMatch ? titleMatch[1].trim() : null;

  // Meta description
  const metaDesc = getMetaContent("description");

  // H1 tags
  const h1Tags: string[] = [];
  const h1Regex = /<h1[^>]*>(.*?)<\/h1>/gis;
  let h1Match: RegExpExecArray | null;
  while ((h1Match = h1Regex.exec(html)) !== null) {
    h1Tags.push(h1Match[1].replace(/<[^>]+>/g, "").trim());
  }

  // Canonical
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const canonicalValue = canonicalMatch ? canonicalMatch[1] : null;

  // Robots meta
  const robotsValue = getMetaContent("robots");

  // OG tags
  const ogTitle = getMetaProperty("og:title");
  const ogDescription = getMetaProperty("og:description");

  const partial: Omit<SEOReport, "score"> = {
    url,
    fetchedAt: new Date().toISOString(),
    title: evaluateTitle(titleValue),
    metaDescription: evaluateMetaDescription(metaDesc),
    h1Tags: evaluateH1(h1Tags),
    canonical: evaluateCanonical(canonicalValue, url),
    robotsMeta: evaluateRobotsMeta(robotsValue),
    ogTitle: evaluateOG(ogTitle, "og:title"),
    ogDescription: evaluateOG(ogDescription, "og:description"),
    pageSpeed: evaluatePageSpeed(responseTimeMs),
  };

  return { ...partial, score: calculateScore(partial) };
}
