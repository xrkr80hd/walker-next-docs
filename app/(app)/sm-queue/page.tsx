"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

const SmQueueScreen = dynamic(
  () =>
    import("@/components/workflow/sm-queue-screen").then(
      (module) => module.SmQueueScreen,
    ),
  { ssr: false },
);

export default function SmQueuePage() {
  const [role, setRole] = useState("user");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.role) setRole(profile.role);
        });
    });
  }, []);

  return <SmQueueScreen role={role} />;
}
