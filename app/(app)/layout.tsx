import Link from "next/link";
import type { ReactNode } from "react";

import { SupabaseSessionGate } from "@/components/auth/supabase-session-gate";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SupabaseSessionGate surface="app">
      <div className="min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <header className="border border-black/10 bg-[var(--panel)] shadow-[0_24px_60px_rgba(35,23,12,0.12)]">
            <div className="flex flex-col gap-4 px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Walker Mobile Workflow
                  </p>
                  <h1 className="text-2xl font-extrabold tracking-[0.01em] text-[var(--foreground)]">
                    Docs App Migration
                  </h1>
                </div>
                <div className="rounded-full border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
                  Next.js Pilot
                </div>
              </div>

              <nav className="flex flex-wrap gap-2">
                <Link
                  href="/workflow"
                  className="inline-flex min-h-11 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-bold uppercase tracking-[0.08em] text-white"
                >
                  Workflow
                </Link>
                <Link
                  href="/documents"
                  className="inline-flex min-h-11 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]"
                >
                  Documents
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1 py-6">{children}</main>
        </div>
      </div>
    </SupabaseSessionGate>
  );
}
