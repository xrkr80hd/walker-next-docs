"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import {
  getAuthRedirectUrl,
  getSessionLabel,
  getSupabaseBrowserClient,
  getSupabaseConfigError,
  isSupabaseConfigured,
} from "@/lib/supabase-browser";

type SupabaseSessionGateProps = {
  children: ReactNode;
  surface?: "app" | "print";
};

export function SupabaseSessionGate({
  children,
  surface = "app",
}: SupabaseSessionGateProps) {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setChecking(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) {
          return;
        }

        if (sessionError) {
          setError(sessionError.message);
        }

        setSession(data.session ?? null);
        setChecking(false);
      })
      .catch((sessionError: unknown) => {
        if (!active) {
          return;
        }

        setError(
          sessionError instanceof Error
            ? sessionError.message
            : "Could not verify access.",
        );
        setChecking(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession);
      setChecking(false);
      setError("");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleMagicLinkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Enter an authorized email address.");
      return;
    }

    setSending(true);
    setStatus("");
    setError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
          shouldCreateUser: false,
        },
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      setStatus(
        "Magic link sent. Finish sign-in from that email on this device to open the app.",
      );
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Could not start sign-in.",
      );
    } finally {
      setSending(false);
    }
  }

  async function handleSignOut() {
    setError("");
    setStatus("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError(signOutError.message);
      }
    } catch (signOutError) {
      setError(
        signOutError instanceof Error
          ? signOutError.message
          : "Could not sign out.",
      );
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6">
        <section className="w-full border border-red-900/20 bg-[var(--panel)] p-6 shadow-[0_24px_60px_rgba(35,23,12,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
            Supabase Setup Needed
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[var(--foreground)]">
            Auth gate is waiting on environment config.
          </h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            {getSupabaseConfigError()} Add the public Supabase URL and anon key,
            then reload this app.
          </p>
        </section>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6">
        <section className="w-full border border-black/10 bg-[var(--panel)] p-6 shadow-[0_24px_60px_rgba(35,23,12,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
            Authorizing
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[var(--foreground)]">
            Checking access…
          </h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            This login session stays in the active browser session only.
          </p>
        </section>
      </div>
    );
  }

  if (!session) {
    const title =
      surface === "print"
        ? "Sign in before using the print surface."
        : "Authorized access only.";
    const description =
      surface === "print"
        ? "Open the workflow in a signed-in tab first, or request a magic link below."
        : "Use an approved email to enter Walker Docs. Customer information still stays in the live browser session only and clears after the print dialog closes.";

    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6">
        <section className="w-full border border-black/10 bg-[var(--panel)] p-6 shadow-[0_24px_60px_rgba(35,23,12,0.12)]">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">
            Walker Docs Access
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[var(--foreground)]">
            {title}
          </h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            {description}
          </p>

          <form className="mt-6 grid gap-4" onSubmit={handleMagicLinkSubmit}>
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                Authorized Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                className="min-h-12 border border-[var(--border)] bg-white px-4 text-base text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                autoComplete="email"
              />
            </label>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex min-h-12 items-center justify-center border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-bold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Sending Link…" : "Email Magic Link"}
            </button>
          </form>

          {status ? (
            <p className="mt-4 border border-emerald-800/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
              {status}
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 border border-red-900/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">
              {error}
            </p>
          ) : null}
        </section>
      </div>
    );
  }

  if (surface === "print") {
    return <>{children}</>;
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-[var(--panel-strong)] px-4 py-3 shadow-[0_18px_44px_rgba(35,23,12,0.08)]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
              Authorized Session
            </p>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {getSessionLabel(session)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex min-h-11 items-center justify-center border border-[var(--foreground)] bg-white px-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]"
          >
            Sign Out
          </button>
        </div>
        {error ? (
          <p className="mt-3 border border-red-900/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">
            {error}
          </p>
        ) : null}
      </div>
      {children}
    </>
  );
}
