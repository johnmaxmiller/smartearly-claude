import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeSEO } from "@/lib/seo-analyzer";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const report = await analyzeSEO(url);
    return NextResponse.json(report);
  } catch (error) {
    console.error("SEO analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze URL" },
      { status: 500 }
    );
  }
}
