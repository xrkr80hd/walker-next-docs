"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { DisclosureGate } from "@/components/auth/disclosure-gate";
import { SupabaseSessionGate } from "@/components/auth/supabase-session-gate";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

const BREADCRUMB_LABELS: Record<string, string> = {
  workflow: "Workflow",
  documents: "Documents",
  "delivery-checklist": "Delivery Checklist",
  "pain-points": "Space Sheet",
  "payoff-form": "Payoff Form",
  "address-information": "Address Information",
  "buyers-guide": "Buyers Guide",
  reverse: "Reverse",
  "vin-verification": "VIN Verification",
};

function labelForSegment(segment: string) {
  const mapped = BREADCRUMB_LABELS[segment];
  if (mapped) {
    return mapped;
  }

  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function documentBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "documents") {
    return "Workflow";
  }

  return ["Workflow", ...segments.map((segment) => labelForSegment(segment))].join(" / ");
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      fetch("/api/me", { headers: { authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((me) => { if (me.role === "admin") setIsAdmin(true); })
        .catch(() => { });
    });
  }, []);

  const isDocumentRoute = pathname.startsWith("/documents");
  const isAdminRoute = pathname.startsWith("/admin");

  const backToPrevious = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/workflow");
  };

  const breadcrumb = isDocumentRoute ? documentBreadcrumb(pathname) : "";

  return (
    <SupabaseSessionGate surface="app">
      <DisclosureGate>
        {isDocumentRoute ? (
          <div className="min-h-screen overflow-x-auto px-0 pb-8 pt-4 sm:px-2 lg:px-4">
            <div className="mx-auto mb-3 flex w-full max-w-[8.5in] flex-wrap items-center justify-between gap-3 border border-black/10 bg-white/90 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
              <button
                type="button"
                onClick={backToPrevious}
                className="inline-flex min-h-10 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-sm font-bold text-[var(--foreground)]"
              >
                Back
              </button>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                {breadcrumb}
              </p>
            </div>
            {children}
          </div>
        ) : (
          <div className="min-h-screen">
            <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
              <header className="border border-black/10 bg-[var(--panel)] shadow-[0_24px_60px_rgba(35,23,12,0.12)]">
                <div className="flex flex-col gap-4 px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--muted)]">
                        Walker Automotive
                      </p>
                      <h1 className="text-2xl font-extrabold tracking-[0.01em] text-[var(--foreground)]">
                        Walker Docs
                      </h1>
                    </div>
                    <div className="rounded-full border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                      Beta
                    </div>
                  </div>

                  <nav className="flex flex-wrap gap-2">
                    <Link
                      href="/workflow"
                      className={`inline-flex min-h-11 items-center justify-center border px-4 text-sm font-bold uppercase tracking-[0.08em] ${!isAdminRoute
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-[var(--foreground)] bg-white text-[var(--foreground)]"
                        }`}
                    >
                      Workflow
                    </Link>
                    <Link
                      href="/documents"
                      className="inline-flex min-h-11 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]"
                    >
                      Documents
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className={`inline-flex min-h-11 items-center justify-center border px-4 text-sm font-bold uppercase tracking-[0.08em] ${isAdminRoute
                            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                            : "border-[var(--foreground)] bg-white text-[var(--foreground)]"
                          }`}
                      >
                        Admin
                      </Link>
                    )}
                  </nav>
                </div>
              </header>

              <main className="flex-1 py-6">{children}</main>
            </div>
          </div>
        )}
      </DisclosureGate>
    </SupabaseSessionGate>
  );
}
