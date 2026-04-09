"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SettingsDrawer } from "@/components/workflow/settings-drawer";

export function DashboardScreen() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <section className="overflow-hidden border border-white/10 bg-[var(--panel)] bg-[url('/bg-hero-16x9.jpg')] bg-cover bg-center shadow-[0_0_40px_rgba(190,23,23,0.15),0_24px_60px_rgba(0,0,0,0.3)]">
        <div className="flex min-h-[60vh] items-center justify-center px-5 py-12 sm:px-6">
          <div className="text-center">
            <Image
              src="/walker-red-graphic-v2.png"
              alt="Walker Automotive graphic"
              width={320}
              height={116}
              priority
              className="mx-auto h-auto w-full max-w-[280px]"
            />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-white drop-shadow-sm">
              Walker Docs
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-[0.01em] text-white drop-shadow-sm sm:text-4xl">
              Select Workflow
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base leading-7 text-white/70">
              Choose a vehicle type to begin, or configure your dealership and salesperson in Settings.
            </p>

            <nav className="mx-auto mt-8 flex w-[240px] flex-col gap-3">
              <Link
                href="/deals"
                className="inline-flex min-h-12 w-full items-center justify-center border border-[var(--accent)] bg-white/10 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/20"
              >
                Deals
              </Link>
              <Link
                href="/documents/spaced"
                className="inline-flex min-h-12 w-full items-center justify-center border border-[var(--accent)] bg-white/10 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/20"
              >
                SPACED
              </Link>
              <Link
                href="/overview"
                className="inline-flex min-h-12 w-full items-center justify-center border border-[var(--accent)] bg-white/10 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/20"
              >
                Overview
              </Link>
              <Link
                href="/workflow/new"
                className="inline-flex min-h-12 w-full items-center justify-center border border-[var(--accent)] bg-white/10 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/20"
              >
                New Vehicle
              </Link>
              <Link
                href="/workflow"
                className="inline-flex min-h-12 w-full items-center justify-center border border-[var(--accent)] bg-white/10 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/20"
              >
                Used Vehicle
              </Link>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-[var(--accent)] bg-white/10 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                </svg>
                Settings
              </button>
            </nav>
          </div>
        </div>
      </section>

      {settingsOpen && <SettingsDrawer onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
