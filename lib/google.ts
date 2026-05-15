import { google } from "googleapis";

export function getOAuth2Client(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

export async function getSearchConsoleSites(accessToken: string) {
  const auth = getOAuth2Client(accessToken);
  const searchConsole = google.webmasters({ version: "v3", auth });

  try {
    const response = await searchConsole.sites.list();
    return response.data.siteEntry || [];
  } catch (error) {
    console.error("Error fetching Search Console sites:", error);
    return [];
  }
}

export async function getSearchConsoleData(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[] = ["query"],
  rowLimit = 10
) {
  const auth = getOAuth2Client(accessToken);
  const searchConsole = google.webmasters({ version: "v3", auth });

  try {
    const response = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions,
        rowLimit,
        startRow: 0,
      },
    });
    return response.data.rows || [];
  } catch (error) {
    console.error("Error fetching Search Console data:", error);
    return [];
  }
}

export async function getSiteMetrics(accessToken: string, siteUrl: string) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 28);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const [queries, pages] = await Promise.all([
    getSearchConsoleData(
      accessToken,
      siteUrl,
      formatDate(startDate),
      formatDate(endDate),
      ["query"],
      25
    ),
    getSearchConsoleData(
      accessToken,
      siteUrl,
      formatDate(startDate),
      formatDate(endDate),
      ["page"],
      10
    ),
  ]);

  const totalClicks = queries.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const totalImpressions = queries.reduce(
    (sum, row) => sum + (row.impressions || 0),
    0
  );

  return { queries, pages, totalClicks, totalImpressions };
}
