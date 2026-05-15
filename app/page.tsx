import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import { TrendingUp, BarChart2, Search, Shield } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-navy-950 flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Top Rank
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-900 border border-navy-700 text-sm text-slate-400 mb-8">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            Powered by Google Search Console &amp; Analytics
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            SEO intelligence{" "}
            <span className="text-accent">powered by Google</span>
          </h1>

          <p className="text-xl text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed">
            Connect your Google account to analyze search performance, track
            keyword rankings, and run instant technical SEO audits.
          </p>

          {/* CTA */}
          <AuthButton />

          <p className="mt-5 text-sm text-slate-500">
            No credit card required. Uses your existing Google Search Console
            data.
          </p>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Search className="w-5 h-5 text-accent" />}
            title="Keyword Tracking"
            desc="See which queries drive traffic, your average position, CTR, and impressions for the last 28 days."
          />
          <FeatureCard
            icon={<BarChart2 className="w-5 h-5 text-accent" />}
            title="Traffic Analysis"
            desc="Discover your top-performing pages and spot opportunities to improve rankings fast."
          />
          <FeatureCard
            icon={<Shield className="w-5 h-5 text-accent" />}
            title="Technical SEO Audit"
            desc="Instantly check title tags, meta descriptions, H1s, canonical links, robots meta, and page speed."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-800 py-6 px-6 text-center text-sm text-slate-600">
        &copy; {new Date().getFullYear()} Top Rank. All rights reserved.
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 hover:border-accent/40 transition-colors">
      <div className="w-10 h-10 bg-navy-800 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
