import Link from "next/link";

export default function SmToolsPage() {
  return (
    <section className="overflow-hidden border border-white/10 bg-[#1c1c1e] shadow-[0_0_40px_rgba(190,23,23,0.15),0_24px_60px_rgba(0,0,0,0.3)]">
      <div className="bg-[var(--accent)] bg-[url('/bg-card-3x2.jpg')] bg-cover bg-center px-5 py-5 sm:px-6">
        <h2 className="text-2xl font-bold text-white">Sales Manager Tools</h2>
        <p className="mt-1 text-sm text-white/70">Coming soon — LTV calculator, deal packet review, and more</p>
      </div>
      <div className="px-5 py-12 text-center sm:px-6">
        <p className="text-lg font-semibold text-white/60">Under Construction</p>
        <p className="mt-2 text-sm text-white/40">
          This section will house Sales Manager tools as they are built.
        </p>
        <Link
          href="/sm-queue"
          className="mt-6 inline-flex min-h-11 items-center justify-center border border-white/20 bg-white/10 px-6 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-white/20"
        >
          Back to SM Queue
        </Link>
      </div>
    </section>
  );
}
