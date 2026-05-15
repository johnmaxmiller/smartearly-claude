import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const session = await auth();
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll().map((c) => c.name);

  return NextResponse.json({
    session: session ? { user: session.user?.email, hasAccessToken: !!session.accessToken } : null,
    authCookies: allCookies.filter((n) => n.includes("auth") || n.includes("next")),
    allCookieNames: allCookies,
    env: {
      hasSecret: !!process.env.AUTH_SECRET,
      hasGoogleId: !!(process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID),
      authUrl: process.env.AUTH_URL ?? "(not set)",
      nextauthUrl: process.env.NEXTAUTH_URL ?? "(not set)",
    },
  });
}
