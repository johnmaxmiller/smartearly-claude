import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Top Rank — SEO Intelligence",
  description:
    "SEO intelligence powered by Google. Analyze your search performance, track keywords, and improve your rankings.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📈</text></svg>",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="min-h-screen bg-navy-950 text-slate-100 antialiased">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
