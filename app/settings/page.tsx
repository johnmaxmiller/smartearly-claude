import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { SignOutButton } from "@/components/AuthButton";
import Image from "next/image";
import {
  User,
  Shield,
  CheckCircle2,
  ExternalLink,
  Key,
} from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const scopes = [
    {
      name: "Google Search Console",
      scope: "webmasters.readonly",
      desc: "Read search performance data, queries, and page metrics.",
    },
    {
      name: "Google Analytics",
      scope: "analytics.readonly",
      desc: "Read Analytics data for your properties.",
    },
    {
      name: "OpenID / Profile",
      scope: "openid, profile, email",
      desc: "Basic account information for authentication.",
    },
  ];

  return (
    <div className="flex min-h-screen bg-navy-950">
      <Sidebar />

      <main className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <div className="px-6 py-6 border-b border-navy-800">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage your account and connected services
          </p>
        </div>

        <div className="px-6 py-6 max-w-2xl space-y-6">
          {/* Connected account */}
          <section className="bg-navy-900 border border-navy-700 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              Connected Account
            </h2>

            <div className="flex items-center gap-4 mb-6">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={56}
                  height={56}
                  className="rounded-full ring-2 ring-navy-600"
                />
              ) : (
                <div className="w-14 h-14 bg-navy-700 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-slate-400" />
                </div>
              )}
              <div>
                <p className="text-white font-semibold text-lg">
                  {session.user?.name || "Unknown User"}
                </p>
                <p className="text-slate-400 text-sm">
                  {session.user?.email || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <SignOutButton />
              <p className="text-slate-500 text-xs">
                Signing out will require you to re-authenticate with Google.
              </p>
            </div>
          </section>

          {/* Permissions */}
          <section className="bg-navy-900 border border-navy-700 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              Google Permissions
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Top Rank has been granted read-only access to the following Google
              services.
            </p>

            <div className="space-y-3">
              {scopes.map((s) => (
                <div
                  key={s.name}
                  className="flex items-start gap-3 p-4 bg-navy-800 rounded-xl border border-navy-700"
                >
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">{s.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{s.desc}</p>
                    <code className="text-slate-500 text-xs mt-1 block">
                      {s.scope}
                    </code>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-accent transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Manage Google permissions
            </a>
          </section>

          {/* API info */}
          <section className="bg-navy-900 border border-navy-700 rounded-2xl p-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-accent" />
              Session Info
            </h2>
            <div className="space-y-2">
              <InfoRow label="Session status" value="Active" valueClass="text-accent" />
              <InfoRow
                label="Access token"
                value={session.accessToken ? "Present" : "Not available"}
                valueClass={session.accessToken ? "text-accent" : "text-red-400"}
              />
              <InfoRow
                label="Authenticated via"
                value="Google OAuth 2.0"
              />
            </div>
          </section>

          {/* Danger zone */}
          <section className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6">
            <h2 className="text-red-400 font-semibold text-lg mb-2">
              Disconnect Account
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Signing out removes your session. To fully revoke access, visit
              your Google account permissions page.
            </p>
            <SignOutButton />
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-navy-700 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
