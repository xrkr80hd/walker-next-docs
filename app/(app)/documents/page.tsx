import Link from "next/link";

import { DOCUMENT_LIBRARY } from "@/lib/walker-workflow";

export default function DocumentsPage() {
  return (
    <div className="grid gap-6">
      <section className="border border-black/10 bg-[var(--panel)] p-5 shadow-[0_24px_60px_rgba(35,23,12,0.12)] sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
          Document Library
        </p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-[0.01em] text-[var(--foreground)]">
          Route by route migration
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
          Delivery Checklist is the first fully routed Next.js document. The
          rest stay mapped here as queued follow-on ports so the workflow shape
          stays clear while print parity is proven.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {DOCUMENT_LIBRARY.map((doc) => (
          <article
            key={doc.slug}
            className="border border-black/10 bg-[var(--panel-strong)] p-5 shadow-[0_18px_44px_rgba(35,23,12,0.08)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {doc.stage}
                </p>
                <h3 className="mt-1 text-xl font-bold text-[var(--foreground)]">
                  {doc.title}
                </h3>
              </div>
              <span
                className={`border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                  doc.ready
                    ? "border-[var(--success)] text-[var(--success)]"
                    : "border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                {doc.ready ? "Ready" : "Queued"}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {doc.description}
            </p>

            {doc.ready ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={doc.href}
                  className="inline-flex min-h-11 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-bold uppercase tracking-[0.08em] text-white"
                >
                  Open Document
                </Link>
                <Link
                  href={doc.printHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]"
                >
                  Open Print Surface
                </Link>
              </div>
            ) : (
              <p className="mt-5 text-sm font-semibold text-[var(--muted)]">
                Kept out of the first migration slice until the shared print
                contract is locked.
              </p>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
